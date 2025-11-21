// Error Interceptor
// Handles common error scenarios and provides consistent error formatting

import type { ApiError, IApiResponse, ResponseInterceptor } from "../api.types";

export class ErrorInterceptor {
  createResponseInterceptor(): ResponseInterceptor {
    return {
      onFulfilled: (response: IApiResponse): IApiResponse => {
        // Response is successful, just pass it through
        return response;
      },

      onRejected: async (error: ApiError): Promise<ApiError> => {
        // Handle different types of errors
        if (error.status === 401) {
          // Unauthorized - could trigger token refresh logic here
          console.warn("Unauthorized request detected:", error.request?.url);
        } else if (error.status === 403) {
          // Forbidden - user doesn't have permission
          console.warn("Forbidden request:", error.request?.url);
        } else if (error.status >= 500) {
          // Server error - could implement retry logic here
          console.error("Server error:", error.status, error.message);
        } else if (error.status >= 400) {
          // Client error - log for debugging
          console.warn("Client error:", error.status, error.message);
        }

        // Return the error (don't modify it, just log)
        return error;
      },
    };
  }
}
