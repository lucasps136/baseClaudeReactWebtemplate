// Interceptor Manager
// Manages request and response interceptors with proper execution order

import type {
  ApiRequest,
  IApiResponse,
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
  InterceptorConfig,
} from "../api.types";

export class InterceptorManager {
  private requestInterceptors = new Map<string, RequestInterceptor>();
  private responseInterceptors = new Map<string, ResponseInterceptor>();

  addRequestInterceptor(interceptor: RequestInterceptor): string {
    const id = crypto.randomUUID();
    this.requestInterceptors.set(id, interceptor);
    return id;
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): string {
    const id = crypto.randomUUID();
    this.responseInterceptors.set(id, interceptor);
    return id;
  }

  removeInterceptor(id: string): void {
    this.requestInterceptors.delete(id);
    this.responseInterceptors.delete(id);
  }

  async executeRequestInterceptors(request: ApiRequest): Promise<ApiRequest> {
    let processedRequest = { ...request };

    // Execute all request interceptors in order
    for (const interceptor of this.requestInterceptors.values()) {
      try {
        processedRequest = await interceptor(processedRequest);
      } catch (error) {
        console.error("Request interceptor failed:", error);
        // Continue with other interceptors
      }
    }

    return processedRequest;
  }

  async executeResponseInterceptors(
    response: IApiResponse,
  ): Promise<IApiResponse> {
    let processedResponse = response;

    // Execute fulfilled response interceptors
    for (const interceptor of this.responseInterceptors.values()) {
      if (interceptor.onFulfilled) {
        try {
          processedResponse = await interceptor.onFulfilled(processedResponse);
        } catch (error) {
          console.error("Response interceptor (onFulfilled) failed:", error);
          // Continue with other interceptors
        }
      }
    }

    return processedResponse;
  }

  async executeErrorInterceptors(error: ApiError): Promise<ApiError> {
    let processedError = error;

    // Execute error response interceptors
    for (const interceptor of this.responseInterceptors.values()) {
      if (interceptor.onRejected) {
        try {
          processedError = await interceptor.onRejected(processedError);
        } catch (interceptorError) {
          console.error(
            "Response interceptor (onRejected) failed:",
            interceptorError,
          );
          // Continue with other interceptors
        }
      }
    }

    return processedError;
  }

  clear(): void {
    this.requestInterceptors.clear();
    this.responseInterceptors.clear();
  }

  getInterceptorCount(): { request: number; response: number } {
    return {
      request: this.requestInterceptors.size,
      response: this.responseInterceptors.size,
    };
  }
}
