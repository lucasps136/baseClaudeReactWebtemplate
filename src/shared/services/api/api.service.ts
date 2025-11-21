// API Service Implementation
// Fetch-based HTTP client with interceptor support following SOLID principles

import { z } from "zod";
import type {
  IApiService,
  IApiRequest,
  IApiResponse,
  IRequestConfig,
  RequestInterceptor,
  IResponseInterceptor,
  HttpMethod,
  IApiServiceDependencies,
  ISupabaseService,
  IValidationService,
} from "./api.types";
import { ApiError, NetworkError, TimeoutError } from "./api.types";
import { InterceptorManager } from "./interceptors/interceptor-manager";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { ErrorInterceptor } from "./interceptors/error.interceptor";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";

// Validation schemas
const apiRequestSchema = z.object({
  url: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
  timeout: z.number().positive().max(60000).optional(),
  signal: z.any().optional(),
  cache: z.any().optional(),
  credentials: z.any().optional(),
});

const requestConfigSchema = z.object({
  headers: z.record(z.string()).optional(),
  timeout: z.number().positive().max(60000).optional(),
  signal: z.any().optional(),
  cache: z.any().optional(),
  credentials: z.any().optional(),
  validateStatus: z.function().optional(),
});

export class ApiService implements IApiService {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly interceptorManager = new InterceptorManager();

  constructor(
    private supabaseService: ISupabaseService,
    private validationService: IValidationService,
  ) {
    this.setupDefaultInterceptors();
  }

  // Core HTTP methods
  async get<T>(url: string, config?: IRequestConfig): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "GET",
      ...this.mergeConfig(config),
    });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "POST",
      body: data,
      ...this.mergeConfig(config),
    });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "PUT",
      body: data,
      ...this.mergeConfig(config),
    });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "PATCH",
      body: data,
      ...this.mergeConfig(config),
    });
  }

  async delete<T>(
    url: string,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "DELETE",
      ...this.mergeConfig(config),
    });
  }

  // Low-level request method
  async request<T>(request: IApiRequest): Promise<IApiResponse<T>> {
    // Validate request
    await this.validateRequest(request);

    // Execute request interceptors
    const processedRequest =
      await this.interceptorManager.executeRequestInterceptors(request);

    try {
      // Make the actual HTTP request
      const response = await this.executeRequest<T>(processedRequest);

      // Execute response interceptors
      const processedResponse =
        await this.interceptorManager.executeResponseInterceptors(response);

      return processedResponse;
    } catch (error) {
      // Convert to ApiError if needed
      const apiError = this.normalizeError(error, processedRequest);

      // Execute error interceptors
      const processedError =
        await this.interceptorManager.executeErrorInterceptors(apiError);

      throw processedError;
    }
  }

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): string {
    return this.interceptorManager.addRequestInterceptor(interceptor);
  }

  addResponseInterceptor(interceptor: IResponseInterceptor): string {
    return this.interceptorManager.addResponseInterceptor(interceptor);
  }

  removeInterceptor(id: string): void {
    this.interceptorManager.removeInterceptor(id);
  }

  // Private methods
  private async executeRequest<T>(
    request: IApiRequest,
  ): Promise<IApiResponse<T>> {
    const { url, method, headers, body, timeout, signal, cache, credentials } =
      request;

    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = timeout
      ? setTimeout(() => controller.abort(), timeout)
      : null;

    // Combine signals if both provided
    const finalSignal = signal || controller.signal;

    try {
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: finalSignal,
        cache,
        credentials,
      };

      // Add body for methods that support it
      if (body !== undefined && ["POST", "PUT", "PATCH"].includes(method)) {
        if (body instanceof FormData) {
          // Remove Content-Type header for FormData (browser will set it)
          delete (fetchOptions.headers as Record<string, string>)[
            "Content-Type"
          ];
          fetchOptions.body = body;
        } else {
          fetchOptions.body = JSON.stringify(body);
        }
      }

      // Make the request
      const response = await fetch(url, fetchOptions);

      // Clear timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Check if response is ok based on custom validator or default
      const validateStatus = this.getValidateStatusFunction(request);
      if (!validateStatus(response.status)) {
        throw await this.createApiError(response, request);
      }

      // Parse response data
      const data = await this.parseResponseData<T>(response);

      // Create IApiResponse
      const apiResponse: IApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: request,
      };

      return apiResponse;
    } catch (error) {
      // Clear timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Handle different error types
      if (error instanceof DOMException && error.name === "AbortError") {
        if (timeout && !signal) {
          throw new TimeoutError(timeout, request);
        }
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError(error.message, request);
      }

      // Re-throw if already an ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap other errors
      throw new NetworkError(`Request failed: ${error}`, request);
    }
  }

  private async parseResponseData<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      try {
        return (await response.json()) as T;
      } catch {
        // If JSON parsing fails, return text
        return (await response.text()) as unknown as T;
      }
    }

    if (contentType?.includes("text/")) {
      return (await response.text()) as unknown as T;
    }

    // For other content types, try to parse as text
    try {
      return (await response.text()) as unknown as T;
    } catch {
      return null as unknown as T;
    }
  }

  private async createApiError(
    response: Response,
    request: IApiRequest,
  ): Promise<ApiError> {
    let errorResponse: any;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        errorResponse = await response.json();
      } else {
        errorResponse = {
          error: response.statusText,
          message: (await response.text()) || response.statusText,
          status: response.status,
          statusText: response.statusText,
        };
      }
    } catch {
      errorResponse = {
        error: response.statusText,
        message: response.statusText,
        status: response.status,
        statusText: response.statusText,
      };
    }

    return new ApiError(
      errorResponse.message ||
        `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText,
      errorResponse,
      request,
    );
  }

  private normalizeError(error: any, request: IApiRequest): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return new TimeoutError(this.DEFAULT_TIMEOUT, request);
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return new NetworkError(error.message, request);
    }

    return new NetworkError(
      `Request failed: ${error.message || error}`,
      request,
    );
  }

  private getValidateStatusFunction(
    request: IApiRequest,
  ): (status: number) => boolean {
    // Check if request config has custom validateStatus
    const customValidateStatus = (request as any).validateStatus;
    if (customValidateStatus && typeof customValidateStatus === "function") {
      return customValidateStatus;
    }

    // Default: 200-299 are successful
    return (status: number) => status >= 200 && status < 300;
  }

  private mergeConfig(config?: IRequestConfig): Partial<IApiRequest> {
    if (!config) return {};

    return {
      headers: config.headers,
      timeout: config.timeout || this.DEFAULT_TIMEOUT,
      signal: config.signal,
      cache: config.cache,
      credentials: config.credentials,
      validateStatus: config.validateStatus,
    } as any;
  }

  private async validateRequest(request: IApiRequest): Promise<void> {
    try {
      await this.validationService.validate(apiRequestSchema, request);
    } catch (error) {
      throw new Error(`Invalid request: ${error}`);
    }
  }

  private setupDefaultInterceptors(): void {
    // Setup authentication interceptor
    const authInterceptor = new AuthInterceptor(this.supabaseService);
    this.addRequestInterceptor(authInterceptor.createRequestInterceptor());

    // Setup error interceptor
    const errorInterceptor = new ErrorInterceptor();
    this.addResponseInterceptor(errorInterceptor.createResponseInterceptor());

    // Setup logging interceptor (only in development)
    if (process.env.NODE_ENV === "development") {
      const loggingInterceptor = new LoggingInterceptor(true);
      this.addRequestInterceptor(loggingInterceptor.createRequestInterceptor());
      this.addResponseInterceptor(
        loggingInterceptor.createResponseInterceptor(),
      );
    }
  }
}

// Factory function
export const createApiService = (
  supabaseService: ISupabaseService,
  validationService: IValidationService,
): IApiService => {
  return new ApiService(supabaseService, validationService);
};
