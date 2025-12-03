// Authentication Interceptor
// Automatically injects Supabase auth tokens into requests

import type { SupabaseClient } from "@supabase/supabase-js";

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
        const client = this.supabaseService.getClient() as SupabaseClient;
        const result = await client.auth.getSession();
        const session = result.data.session;

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
