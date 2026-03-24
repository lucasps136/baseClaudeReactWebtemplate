/**
 * API Service Contract
 *
 * This contract defines the exact interface and behavior expectations
 * for the ApiService implementation. All implementations must conform
 * to this contract to ensure compatibility and maintainability.
 */

export interface IApiServiceContract {
  // ===========================================
  // CORE HTTP METHODS CONTRACT
  // ===========================================

  /**
   * Performs a GET request
   * @param url - The request URL (must be valid URL)
   * @param config - Optional request configuration
   * @returns Promise resolving to typed response data
   * @throws ApiError on HTTP errors (4xx, 5xx)
   * @throws NetworkError on network failures
   * @throws TimeoutError on request timeout
   */
  get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;

  /**
   * Performs a POST request
   * @param url - The request URL (must be valid URL)
   * @param data - Request body data (will be JSON serialized)
   * @param config - Optional request configuration
   * @returns Promise resolving to typed response data
   * @throws ApiError on HTTP errors (4xx, 5xx)
   * @throws NetworkError on network failures
   * @throws TimeoutError on request timeout
   */
  post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>>;

  /**
   * Performs a PUT request
   * @param url - The request URL (must be valid URL)
   * @param data - Request body data (will be JSON serialized)
   * @param config - Optional request configuration
   * @returns Promise resolving to typed response data
   */
  put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>>;

  /**
   * Performs a PATCH request
   * @param url - The request URL (must be valid URL)
   * @param data - Request body data (will be JSON serialized)
   * @param config - Optional request configuration
   * @returns Promise resolving to typed response data
   */
  patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>>;

  /**
   * Performs a DELETE request
   * @param url - The request URL (must be valid URL)
   * @param config - Optional request configuration
   * @returns Promise resolving to typed response data
   */
  delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;

  /**
   * Low-level request method for custom requests
   * @param request - Complete request configuration
   * @returns Promise resolving to typed response data
   */
  request<T>(request: ApiRequest): Promise<ApiResponse<T>>;

  // ===========================================
  // INTERCEPTOR MANAGEMENT CONTRACT
  // ===========================================

  /**
   * Adds a request interceptor
   * @param interceptor - Function to modify requests before sending
   * @returns Unique interceptor ID for removal
   * @contract Interceptor must be called for every request
   * @contract Must maintain request object structure
   */
  addRequestInterceptor(interceptor: RequestInterceptor): string;

  /**
   * Adds a response interceptor
   * @param interceptor - Object with success/error handlers
   * @returns Unique interceptor ID for removal
   * @contract Interceptor must be called for every response
   * @contract Must maintain response object structure
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): string;

  /**
   * Removes an interceptor by ID
   * @param id - Interceptor ID returned from add methods
   * @contract Must remove interceptor and stop calling it
   * @contract Must fail silently if ID doesn't exist
   */
  removeInterceptor(id: string): void;
}

// ===========================================
// REQUEST/RESPONSE TYPE CONTRACTS
// ===========================================

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

export interface ApiResponse<T = unknown> {
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

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

// ===========================================
// INTERCEPTOR TYPE CONTRACTS
// ===========================================

/**
 * Request interceptor function
 * @contract Must return modified request or promise resolving to request
 * @contract Must not modify original request object (immutability)
 * @contract Must handle errors gracefully
 */
export type RequestInterceptor = (
  request: ApiRequest,
) => ApiRequest | Promise<ApiRequest>;

/**
 * Response interceptor configuration
 * @contract onFulfilled called for successful responses (2xx)
 * @contract onRejected called for error responses (4xx, 5xx, network errors)
 */
export interface ResponseInterceptor {
  /** Handler for successful responses */
  onFulfilled?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;

  /** Handler for error responses */
  onRejected?: (error: ApiError) => ApiError | Promise<ApiError>;
}

// ===========================================
// ERROR HANDLING CONTRACT
// ===========================================

/**
 * Standard API error class
 * @contract Must be thrown for HTTP 4xx and 5xx responses
 * @contract Must include status, statusText, and original request
 */
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

/**
 * Network error class
 * @contract Must be thrown for network connectivity issues
 * @contract Status code must be 0 for network errors
 */
export class NetworkError extends ApiError {
  constructor(message: string, request?: ApiRequest) {
    super(message, 0, "Network Error", undefined, request);
    this.name = "NetworkError";
  }
}

/**
 * Timeout error class
 * @contract Must be thrown when request exceeds timeout
 * @contract Must include timeout duration in message
 */
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

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
  statusText: string;
  details?: unknown;
}

// ===========================================
// AUTHENTICATION INTEGRATION CONTRACT
// ===========================================

/**
 * Authentication integration requirements
 * @contract Must automatically inject auth tokens from Supabase
 * @contract Must refresh tokens when needed
 * @contract Must handle auth errors appropriately
 */
export interface AuthIntegrationContract {
  /** Must inject Authorization header for authenticated requests */
  injectAuthToken(request: ApiRequest): Promise<ApiRequest>;

  /** Must handle 401 responses by refreshing tokens */
  handleAuthError(error: ApiError): Promise<ApiError>;

  /** Must provide way to make unauthenticated requests */
  skipAuth(request: ApiRequest): ApiRequest;
}

// ===========================================
// VALIDATION INTEGRATION CONTRACT
// ===========================================

/**
 * Validation integration requirements
 * @contract Must validate requests before sending
 * @contract Must validate responses after receiving
 * @contract Must throw meaningful validation errors
 */
export interface ValidationIntegrationContract {
  /** Must validate request structure */
  validateRequest(request: ApiRequest): Promise<void>;

  /** Must validate response structure */
  validateResponse(response: ApiResponse): Promise<void>;

  /** Must provide request/response schemas */
  getRequestSchema(): unknown;
  getResponseSchema(): unknown;
}

// ===========================================
// PERFORMANCE CONTRACT
// ===========================================

/**
 * Performance requirements
 * @contract Request operations must complete within timeout
 * @contract Must handle concurrent requests efficiently
 * @contract Must not block main thread
 */
export interface PerformanceContract {
  /** Default timeout must be 30 seconds */
  readonly DEFAULT_TIMEOUT: 30000;

  /** Maximum timeout must be 60 seconds */
  readonly MAX_TIMEOUT: 60000;

  /** Must support concurrent requests without blocking */
  readonly CONCURRENT_REQUESTS: "unlimited";

  /** Must leverage browser's native request queuing */
  readonly REQUEST_QUEUING: "native";
}

// ===========================================
// NEXT.JS INTEGRATION CONTRACT
// ===========================================

/**
 * Next.js specific integration requirements
 * @contract Must work in both Client and Server Components
 * @contract Must leverage Next.js caching in Server Components
 * @contract Must handle SSR/hydration correctly
 */
export interface NextJSIntegrationContract {
  /** Must support Next.js cache options */
  nextCache?: {
    revalidate?: number;
    tags?: string[];
  };

  /** Must detect SSR vs client-side execution */
  isServerSide(): boolean;

  /** Must handle hydration mismatch gracefully */
  handleHydration(): void;
}

// ===========================================
// TESTING CONTRACT
// ===========================================

/**
 * Testing support requirements
 * @contract Must be easily mockable
 * @contract Must provide test utilities
 * @contract Must support dependency injection for testing
 */
export interface TestingContract {
  /** Must allow request mocking */
  mock(requests: Array<{ request: ApiRequest; response: ApiResponse }>): void;

  /** Must allow interceptor testing */
  testInterceptor(interceptor: RequestInterceptor | ResponseInterceptor): void;

  /** Must allow dependency replacement */
  replaceDependency(key: string, mock: unknown): void;
}

// ===========================================
// FACTORY CONTRACT
// ===========================================

/**
 * Service factory requirements
 * @contract Must create service instances with dependencies
 * @contract Must support multiple provider implementations
 * @contract Must integrate with dependency container
 */
export interface ApiServiceFactoryContract {
  /** Create service with Fetch provider (default) */
  createFetchProvider(dependencies: ServiceDependencies): IApiServiceContract;

  /** Create service with Axios provider (optional) */
  createAxiosProvider(dependencies: ServiceDependencies): IApiServiceContract;

  /** Register service in dependency container */
  registerInContainer(container: IDependencyContainer): void;
}

export interface ServiceDependencies {
  supabaseService: ISupabaseService;
  validationService: IValidationService;
}

// Re-export from external dependencies
export interface ISupabaseService {
  getClient(): any; // Supabase client
}

export interface IValidationService {
  validate(schema: unknown, data: unknown): Promise<void>;
}

export interface IDependencyContainer {
  register(key: string, factory: () => unknown): void;
  resolve<T>(key: string): T;
}
