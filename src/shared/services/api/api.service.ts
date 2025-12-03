// API Service Implementation
// Fetch-based HTTP client with interceptor support following SOLID principles
// Composed from modular operation classes

import type {
  IApiRequest,
  IApiResponse,
  IApiService,
  IRequestConfig,
  IResponseInterceptor,
  ISupabaseService,
  IValidationService,
  RequestInterceptor,
} from "./api.types";
import { ApiError } from "./api.types";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { ErrorInterceptor } from "./interceptors/error.interceptor";
import { InterceptorManager } from "./interceptors/interceptor-manager";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";
import { HttpMethods } from "./operations/http-methods";
import { RequestValidator } from "./operations/request-validator";

export class ApiService implements IApiService {
  private readonly interceptorManager = new InterceptorManager();
  private readonly httpMethods: HttpMethods;
  private readonly validator: RequestValidator;

  constructor(
    private supabaseService: ISupabaseService,
    private validationService: IValidationService,
  ) {
    this.httpMethods = new HttpMethods();
    this.validator = new RequestValidator(validationService);
    this.setupDefaultInterceptors();
  }

  // Core HTTP methods - delegated to HttpMethods
  async get<T>(url: string, config?: IRequestConfig): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "GET",
      ...config,
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
      ...config,
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
      ...config,
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
      ...config,
    });
  }

  async delete<T>(
    url: string,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "DELETE",
      ...config,
    });
  }

  // Low-level request method with interceptors
  async request<T>(request: IApiRequest): Promise<IApiResponse<T>> {
    // Validate request
    await this.validator.validate(request);

    // Execute request interceptors
    const processedRequest =
      await this.interceptorManager.executeRequestInterceptors(request);

    try {
      // Make the actual HTTP request using HttpMethods
      const response = await this.httpMethods.request<T>(processedRequest);

      // Execute response interceptors
      const processedResponse =
        await this.interceptorManager.executeResponseInterceptors(response);

      return processedResponse as IApiResponse<T>;
    } catch (error) {
      // Convert to ApiError if needed
      const apiError = await this.normalizeError(error, processedRequest);

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

  // Error normalization
  private async normalizeError(
    error: unknown,
    request: IApiRequest,
  ): Promise<ApiError> {
    // Already an ApiError - return as-is
    if (error instanceof ApiError) {
      return error;
    }

    // Import error classes dynamically to avoid circular deps
    const { NetworkError } = await import("./api.types");

    // Generic error
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new NetworkError(`Request failed: ${errorMessage}`, request);
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
