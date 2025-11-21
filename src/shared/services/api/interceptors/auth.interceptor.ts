// Authentication Interceptor
// Automatically injects Supabase auth tokens into requests

import type {
  IApiRequest,
  ISupabaseService,
  RequestInterceptor,
} from "../api.types";

export class AuthInterceptor {
  constructor(private supabaseService: ISupabaseService) {}

  createRequestInterceptor(): RequestInterceptor {
    return async (request: IApiRequest): Promise<IApiRequest> => {
      try {
        // Get current session from Supabase
        const {
          data: { session },
        } = await this.supabaseService.getClient().auth.getSession();

        if (session?.access_token) {
          // Inject Authorization header
          return {
            ...request,
            headers: {
              ...request.headers,
              Authorization: `Bearer ${session.access_token}`,
            },
          };
        }

        return request;
      } catch (error) {
        console.warn("Failed to inject auth token:", error);
        return request;
      }
    };
  }
}
