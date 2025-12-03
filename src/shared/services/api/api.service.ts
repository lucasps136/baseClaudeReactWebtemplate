// API Service Implementation
// Fetch-based HTTP client with interceptor support following SOLID principles

import { z } from "zod";

import type {
  IApiErrorResponse,
  IApiRequest,
  IApiResponse,
  IApiService,
  IRequestConfig,
  IResponseInterceptor,
  ISupabaseService,
  IValidationService,
  RequestInterceptor,
} from "./api.types";
import { ApiError, NetworkError, TimeoutError } from "./api.types";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { ErrorInterceptor } from "./interceptors/error.interceptor";
import { InterceptorManager } from "./interceptors/interceptor-manager";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";

// Validation schemas
const apiRequestSchema = z.object({
  url: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
  timeout: z.number().positive().max(60000).optional(),
  signal: z.instanceof(AbortSignal).optional(),
  cache: z.custom<RequestCache>().optional(),
  credentials: z.custom<RequestCredentials>().optional(),
});

// Unused schema - kept for future validation if needed
// const requestConfigSchema = z.object({
//   headers: z.record(z.string()).optional(),
//   timeout: z.number().positive().max(60000).optional(),
//   signal: z.any().optional(),
//   cache: z.any().optional(),
//   credentials: z.any().optional(),
//   validateStatus: z.function().optional(),
// });

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

      return processedResponse as IApiResponse<T>;
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

  // Private methods - Request execution broken into smaller methods for clarity
  private async executeRequest<T>(
    request: IApiRequest,
  ): Promise<IApiResponse<T>> {
    const { url, timeout, signal } = request;

    // Setup abort controller for timeout
    const { controller, timeoutId } = this.setupTimeoutController(timeout);

    try {
      // Prepare and execute fetch request
      const fetchOptions = this.prepareFetchOptions(
        request,
        signal || controller.signal,
      );
      const response = await fetch(url, fetchOptions);

      // Clear timeout and process response
      if (timeoutId) clearTimeout(timeoutId);

      return await this.processSuccessfulResponse<T>(response, request);
    } catch (error) {
      // Clear timeout and handle errors
      if (timeoutId) clearTimeout(timeoutId);
      throw this.handleExecutionError(error, request, timeout, signal);
    }
  }

  private setupTimeoutController(timeout?: number): {
    controller: AbortController;
    timeoutId: NodeJS.Timeout | null;
  } {
    const controller = new AbortController();
    const timeoutId = timeout
      ? setTimeout(() => controller.abort(), timeout)
      : null;

    return { controller, timeoutId };
  }

  private prepareFetchOptions(
    request: IApiRequest,
    finalSignal: AbortSignal,
  ): RequestInit {
    const { method, headers, body, cache, credentials } = request;

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
      this.addBodyToFetchOptions(fetchOptions, body);
    }

    return fetchOptions;
  }

  private addBodyToFetchOptions(
    fetchOptions: RequestInit,
    body: unknown,
  ): void {
    if (body instanceof FormData) {
      // Remove Content-Type header for FormData (browser will set it)
      delete (fetchOptions.headers as Record<string, string>)["Content-Type"];
      fetchOptions.body = body;
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  private async processSuccessfulResponse<T>(
    response: Response,
    request: IApiRequest,
  ): Promise<IApiResponse<T>> {
    // Check if response is ok based on custom validator or default
    const validateStatus = this.getValidateStatusFunction(request);
    if (!validateStatus(response.status)) {
      throw await this.createApiError(response, request);
    }

    // Parse response data
    const data = await this.parseResponseData<T>(response);

    // Create IApiResponse
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: request,
    };
  }

  // eslint-disable-next-line complexity -- Complex error handling with multiple error types
  private handleExecutionError(
    error: unknown,
    request: IApiRequest,
    timeout?: number,
    signal?: AbortSignal,
  ): Error {
    // Already an ApiError - return as-is
    if (error instanceof ApiError) {
      return error;
    }

    // Timeout/Abort error
    if (error instanceof DOMException && error.name === "AbortError") {
      if (timeout && !signal) {
        return new TimeoutError(timeout, request);
      }
    }

    // Network/Fetch error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return new NetworkError(error.message, request);
    }

    // Generic error - wrap in NetworkError
    return new NetworkError(`Request failed: ${error}`, request);
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
    const errorResponse = await this.parseErrorResponse(response);

    return new ApiError(
      errorResponse.message ||
        `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText,
      errorResponse,
      request,
    );
  }

  private async parseErrorResponse(
    response: Response,
  ): Promise<IApiErrorResponse> {
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return (await response.json()) as IApiErrorResponse;
      }

      return await this.createTextErrorResponse(response);
    } catch {
      return this.createDefaultErrorResponse(response);
    }
  }

  private async createTextErrorResponse(
    response: Response,
  ): Promise<IApiErrorResponse> {
    return {
      error: response.statusText,
      message: (await response.text()) || response.statusText,
      status: response.status,
      statusText: response.statusText,
    };
  }

  private createDefaultErrorResponse(response: Response): IApiErrorResponse {
    return {
      error: response.statusText,
      message: response.statusText,
      status: response.status,
      statusText: response.statusText,
    };
  }

  private normalizeError(error: unknown, request: IApiRequest): ApiError {
    // Already an ApiError - return as-is
    if (error instanceof ApiError) {
      return error;
    }

    // Timeout/Abort error
    if (this.isAbortError(error)) {
      return new TimeoutError(this.DEFAULT_TIMEOUT, request);
    }

    // Network/Fetch error
    if (this.isFetchError(error)) {
      return new NetworkError(error.message, request);
    }

    // Generic error
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new NetworkError(`Request failed: ${errorMessage}`, request);
  }

  private isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === "AbortError";
  }

  private isFetchError(error: unknown): error is TypeError {
    return error instanceof TypeError && error.message.includes("fetch");
  }

  private getValidateStatusFunction(
    request: IApiRequest,
  ): (status: number) => boolean {
    // Check if request config has custom validateStatus
    const requestWithValidation = request as IApiRequest & {
      validateStatus?: (status: number) => boolean;
    };
    const customValidateStatus = requestWithValidation.validateStatus;
    if (customValidateStatus && typeof customValidateStatus === "function") {
      return customValidateStatus;
    }

    // Default: 200-299 are successful
    return (status: number) => status >= 200 && status < 300;
  }

  private mergeConfig(config?: IRequestConfig): Partial<IApiRequest> {
    if (!config) return {};

    const merged: Partial<IApiRequest> & {
      validateStatus?: (status: number) => boolean;
    } = {
      headers: config.headers,
      timeout: config.timeout || this.DEFAULT_TIMEOUT,
      signal: config.signal,
      cache: config.cache,
      credentials: config.credentials,
    };

    if (config.validateStatus) {
      merged.validateStatus = config.validateStatus;
    }

    return merged;
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
