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

export interface IRequestConfig {
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

export interface IApiRequest {
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
  config: IApiRequest;
}

export interface IApiErrorResponse {
  error: string;
  message: string;
  status: number;
  statusText: string;
  details?: unknown;
}

// Request interceptor function
export type RequestInterceptor = (
  request: IApiRequest,
) => IApiRequest | Promise<IApiRequest>;

// Response interceptor configuration
export interface IResponseInterceptor {
  /** Handler for successful responses */
  onFulfilled?: (
    response: IApiResponse,
  ) => IApiResponse | Promise<IApiResponse>;

  /** Handler for error responses */
  onRejected?: (error: ApiError) => ApiError | Promise<ApiError>;
}

export interface IInterceptorConfig {
  id: string;
  type: "request" | "response";
  handler: RequestInterceptor | IResponseInterceptor;
}

// Main API Service interface
export interface IApiService {
  // Core HTTP methods
  get<T>(url: string, config?: IRequestConfig): Promise<IApiResponse<T>>;
  post<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>>;
  put<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>>;
  patch<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>>;
  delete<T>(url: string, config?: IRequestConfig): Promise<IApiResponse<T>>;

  // Low-level request method
  request<T>(request: IApiRequest): Promise<IApiResponse<T>>;

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): string;
  addResponseInterceptor(interceptor: IResponseInterceptor): string;
  removeInterceptor(id: string): void;
}

// Error classes
export interface IApiErrorOptions {
  status: number;
  statusText: string;
  response?: IApiErrorResponse;
  request?: IApiRequest;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public response?: IApiErrorResponse;
  public request?: IApiRequest;

  constructor(message: string, options: IApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.response = options.response;
    this.request = options.request;
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, request?: IApiRequest) {
    super(message, {
      status: 0,
      statusText: "Network Error",
      request,
    });
    this.name = "NetworkError";
  }
}

export class TimeoutError extends ApiError {
  constructor(timeout: number, request?: IApiRequest) {
    super(`Request timeout after ${timeout}ms`, {
      status: 0,
      statusText: "Timeout",
      request,
    });
    this.name = "TimeoutError";
  }
}

// Provider types
export type ApiProviderType = "fetch" | "axios";

export interface IApiProviderConfig {
  type: ApiProviderType;
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  validateStatus?: (status: number) => boolean;
}

export interface IApiProvider {
  request<T>(request: IApiRequest): Promise<IApiResponse<T>>;
  createInstance(config: IApiProviderConfig): IApiProvider;
}

// Service dependencies
export interface IApiServiceDependencies {
  supabaseService: ISupabaseService;
  validationService: IValidationService;
}

// Re-export external types (will be properly imported)
export interface ISupabaseService {
  getClient(): unknown; // Supabase client - type varies by implementation
}

export interface IValidationService {
  validate(schema: unknown, data: unknown): Promise<void>;
}
