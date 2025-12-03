// Session Operations
// Single Responsibility: Handle session management and password reset

import type {
  SupabaseClient,
  User as SupabaseUser,
  Session as SupabaseSession,
  AuthError as SupabaseAuthError,
} from "@supabase/supabase-js";

import type {
  IUser,
  IAuthSession,
  IResetPasswordData,
  IAuthError,
} from "@/shared/types/auth";

export class SessionOperations {
  constructor(private client: SupabaseClient) {}

  async getCurrentUser(
    mapUser: (user: SupabaseUser) => IUser,
    mapError: (error: SupabaseAuthError) => IAuthError,
  ): Promise<IUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser();

      if (error) {
        throw mapError(error);
      }

      return user ? mapUser(user) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async getCurrentSession(
    mapSession: (session: SupabaseSession) => IAuthSession,
    mapError: (error: SupabaseAuthError) => IAuthError,
  ): Promise<IAuthSession | null> {
    try {
      const {
        data: { session },
        error,
      } = await this.client.auth.getSession();

      if (error) {
        throw mapError(error);
      }

      return session ? mapSession(session) : null;
    } catch (error) {
      console.error("Error getting current session:", error);
      return null;
    }
  }

  async refreshSession(
    mapUser: (user: SupabaseUser) => IUser,
    mapSession: (session: SupabaseSession) => IAuthSession,
    mapError: (error: SupabaseAuthError) => IAuthError,
  ): Promise<{ user: IUser | null; session: IAuthSession | null }> {
    try {
      const { data, error } = await this.client.auth.refreshSession();

      if (error) {
        throw mapError(error);
      }

      if (!data.session) {
        return { user: null, session: null };
      }

      return {
        session: mapSession(data.session),
        user: data.user ? mapUser(data.user) : null,
      };
    } catch (error) {
      console.error("Error refreshing session:", error);
      return { user: null, session: null };
    }
  }

  async resetPassword(
    data: IResetPasswordData,
    mapError: (error: SupabaseAuthError) => IAuthError,
  ): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(data.email);

    if (error) {
      throw mapError(error);
    }
  }

  async updatePassword(
    newPassword: string,
    mapError: (error: SupabaseAuthError) => IAuthError,
  ): Promise<void> {
    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw mapError(error);
    }
  }
}
