// Logging Interceptor
// Logs requests and responses for debugging and monitoring

import type {
  IApiRequest,
  IApiResponse,
  RequestInterceptor,
  IResponseInterceptor,
} from "../api.types";

export class LoggingInterceptor {
  constructor(
    private enabled: boolean = process.env.NODE_ENV === "development",
  ) {}

  createRequestInterceptor(): RequestInterceptor {
    return (request: IApiRequest): IApiRequest => {
      if (this.enabled) {
        console.log(`🚀 API Request: ${request.method} ${request.url}`, {
          headers: request.headers,
          body: request.body,
          timestamp: new Date().toISOString(),
        });
      }

      // Add request metadata for tracking
      return {
        ...request,
        headers: {
          ...request.headers,
          "X-Request-ID": crypto.randomUUID(),
          "X-Request-Timestamp": new Date().toISOString(),
        },
      };
    };
  }

  createResponseInterceptor(): IResponseInterceptor {
    return {
      onFulfilled: (response: IApiResponse): IApiResponse => {
        if (this.enabled) {
          console.log(
            `✅ API Response: ${response.status} ${response.statusText}`,
            {
              url: response.config.url,
              status: response.status,
              duration: this.calculateDuration(
                response.config.headers?.["X-Request-Timestamp"],
              ),
              timestamp: new Date().toISOString(),
            },
          );
        }
        return response;
      },

      onRejected: (error: any): any => {
        if (this.enabled) {
          console.error(
            `❌ API Error: ${error.status || "Unknown"} ${error.statusText || "Error"}`,
            {
              url: error.request?.url,
              status: error.status,
              message: error.message,
              duration: this.calculateDuration(
                error.request?.headers?.["X-Request-Timestamp"],
              ),
              timestamp: new Date().toISOString(),
            },
          );
        }
        return error;
      },
    };
  }

  private calculateDuration(requestTimestamp?: string): number | undefined {
    if (!requestTimestamp) return undefined;

    try {
      const startTime = new Date(requestTimestamp).getTime();
      const endTime = Date.now();
      return endTime - startTime;
    } catch {
      return undefined;
    }
  }
}
