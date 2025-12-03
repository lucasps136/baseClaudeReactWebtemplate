// Authentication Operations
// Single Responsibility: Handle login, register, and logout

import type {
  SupabaseClient,
  User as SupabaseUser,
  Session as SupabaseSession,
  AuthError as SupabaseAuthError,
} from "@supabase/supabase-js";

import type {
  ILoginCredentials,
  IRegisterCredentials,
  IAuthSession,
  IUser,
  IAuthError,
} from "@/shared/types/auth";

export class AuthOperations {
  constructor(private client: SupabaseClient) {}

  async login(
    credentials: ILoginCredentials,
    mapUser: (user: SupabaseUser) => IUser,
    mapSession: (session: SupabaseSession) => IAuthSession,
    mapError: (error: SupabaseAuthError) => IAuthError,
  ): Promise<{ user: IUser; session: IAuthSession }> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw mapError(error);
    }

    if (!data.session || !data.user) {
      throw new Error("Login failed - no session created");
    }

    return {
      user: mapUser(data.user),
      session: mapSession(data.session),
    };
  }

  async register(
    credentials: IRegisterCredentials,
    mapUser: (user: SupabaseUser) => IUser,
    mapSession: (session: SupabaseSession) => IAuthSession,
    mapError: (error: SupabaseAuthError) => IAuthError,
  ): Promise<{ user: IUser; session: IAuthSession }> {
    const { data, error } = await this.client.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          ...credentials.metadata,
        },
      },
    });

    if (error) {
      throw mapError(error);
    }

    if (!data.session || !data.user) {
      throw new Error("Registration failed - no session created");
    }

    return {
      user: mapUser(data.user),
      session: mapSession(data.session),
    };
  }

  async logout(
    mapError: (error: SupabaseAuthError) => IAuthError,
  ): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw mapError(error);
    }
  }
}
