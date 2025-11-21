// API Service Types and Interfaces
// Following the contract specification from specs/master/contracts/api-service.contract.ts

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface RequestConfig {
  /** Custom headers to include in request */
  headers?: Record<string, string>;

  /** Request timeout in milliseconds (max 60000) */
  timeout?: number;

  /** AbortSignal for request cancellation */
  signal?: AbortSignal;

  /** Cache strategy for the request */
  cache?: RequestCache;

  /** Credentials mode for the request */
  credentials?: RequestCredentials;

  /** Custom status code validation function */
  validateStatus?: (status: number) => boolean;
}

export interface ApiRequest {
  /** Request URL (must be valid URL) */
  url: string;

  /** HTTP method */
  method: HttpMethod;

  /** Request headers */
  headers?: Record<string, string>;

  /** Request body (will be JSON serialized if object) */
  body?: unknown;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** AbortSignal for cancellation */
  signal?: AbortSignal;

  /** Cache strategy */
  cache?: RequestCache;

  /** Credentials mode */
  credentials?: RequestCredentials;
}

export interface IApiResponse<T = unknown> {
  /** Response data (parsed JSON or raw) */
  data: T;

  /** HTTP status code */
  status: number;

  /** HTTP status text */
  statusText: string;

  /** Response headers */
  headers: Headers;

  /** Original request configuration */
  config: ApiRequest;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
  statusText: string;
  details?: unknown;
}

// Request interceptor function
export type RequestInterceptor = (
  request: ApiRequest,
) => ApiRequest | Promise<ApiRequest>;

// Response interceptor configuration
export interface ResponseInterceptor {
  /** Handler for successful responses */
  onFulfilled?: (
    response: IApiResponse,
  ) => IApiResponse | Promise<IApiResponse>;

  /** Handler for error responses */
  onRejected?: (error: ApiError) => ApiError | Promise<ApiError>;
}

export interface InterceptorConfig {
  id: string;
  type: "request" | "response";
  handler: RequestInterceptor | ResponseInterceptor;
}

// Main API Service interface
export interface IApiService {
  // Core HTTP methods
  get<T>(url: string, config?: RequestConfig): Promise<IApiResponse<T>>;
  post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<IApiResponse<T>>;
  put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<IApiResponse<T>>;
  patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<IApiResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<IApiResponse<T>>;

  // Low-level request method
  request<T>(request: ApiRequest): Promise<IApiResponse<T>>;

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): string;
  addResponseInterceptor(interceptor: ResponseInterceptor): string;
  removeInterceptor(id: string): void;
}

// Error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: ApiErrorResponse,
    public request?: ApiRequest,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, request?: ApiRequest) {
    super(message, 0, "Network Error", undefined, request);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends ApiError {
  constructor(timeout: number, request?: ApiRequest) {
    super(
      `Request timeout after ${timeout}ms`,
      0,
      "Timeout",
      undefined,
      request,
    );
    this.name = "TimeoutError";
  }
}

// Provider types
export type ApiProviderType = "fetch" | "axios";

export interface ApiProviderConfig {
  type: ApiProviderType;
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  validateStatus?: (status: number) => boolean;
}

export interface IApiProvider {
  request<T>(request: ApiRequest): Promise<IApiResponse<T>>;
  createInstance(config: ApiProviderConfig): IApiProvider;
}

// Service dependencies
export interface ApiServiceDependencies {
  supabaseService: ISupabaseService;
  validationService: IValidationService;
}

// Re-export external types (will be properly imported)
export interface ISupabaseService {
  getClient(): any; // Supabase client
}

export interface IValidationService {
  validate(schema: unknown, data: unknown): Promise<void>;
}
