// API Service Public Exports
// Following clean architecture principles

// Main service and factory
export { ApiService, createApiService } from "./api.service";

// Core types and interfaces
export type {
  IApiService,
  IApiRequest,
  IApiResponse,
  IRequestConfig,
  HttpMethod,
  RequestInterceptor,
  IResponseInterceptor,
  IInterceptorConfig,
  ApiProviderType,
  IApiProviderConfig,
  IApiProvider,
  IApiServiceDependencies,
  IApiErrorResponse,
} from "./api.types";

// Error classes
export { ApiError, NetworkError, TimeoutError } from "./api.types";

// Interceptor utilities (for advanced usage)
export { InterceptorManager } from "./interceptors/interceptor-manager";
export { AuthInterceptor } from "./interceptors/auth.interceptor";
export { ErrorInterceptor } from "./interceptors/error.interceptor";
export { LoggingInterceptor } from "./interceptors/logging.interceptor";
