// Supabase Auth Provider - Modular Implementation
// Main provider class that composes all operations

import {
  createClient,
  type SupabaseClient,
  type User as SupabaseUser,
  type Session as SupabaseSession,
  type AuthError as SupabaseAuthError,
} from "@supabase/supabase-js";

import { getEnv } from "@/config/env";
import type {
  IAuthProvider,
  IUser,
  IAuthSession,
  ILoginCredentials,
  IRegisterCredentials,
  IResetPasswordData,
  IAuthState,
  IAuthError,
} from "@/shared/types/auth";

import { AuthOperations } from "./operations/auth-operations";
import { SessionOperations } from "./operations/session-operations";
import { StateManager } from "./operations/state-manager";

export class SupabaseAuthProvider implements IAuthProvider {
  private client: SupabaseClient;

  // Composed operations
  private authOps: AuthOperations;
  private sessionOps: SessionOperations;
  private stateManager: StateManager;

  constructor() {
    const env = getEnv();
    this.client = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    // Initialize composed operations
    this.authOps = new AuthOperations(this.client);
    this.sessionOps = new SessionOperations(this.client);
    this.stateManager = new StateManager();
  }

  // State management - delegated to StateManager
  getState(): IAuthState {
    return this.stateManager.getState();
  }

  // Authentication operations - delegated to AuthOperations
  async login(credentials: ILoginCredentials): Promise<IAuthSession> {
    try {
      this.stateManager.setState({ isLoading: true, error: null });

      const { user, session } = await this.authOps.login(
        credentials,
        this.mapSupabaseUser,
        this.mapSupabaseSession,
        this.mapSupabaseError,
      );

      this.stateManager.setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return session;
    } catch (error) {
      const authError = error as IAuthError;
      this.stateManager.setState({
        isLoading: false,
        error: authError,
        isAuthenticated: false,
      });
      throw authError;
    }
  }

  async register(credentials: IRegisterCredentials): Promise<IAuthSession> {
    try {
      this.stateManager.setState({ isLoading: true, error: null });

      const { user, session } = await this.authOps.register(
        credentials,
        this.mapSupabaseUser,
        this.mapSupabaseSession,
        this.mapSupabaseError,
      );

      this.stateManager.setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return session;
    } catch (error) {
      const authError = error as IAuthError;
      this.stateManager.setState({
        isLoading: false,
        error: authError,
        isAuthenticated: false,
      });
      throw authError;
    }
  }

  async logout(): Promise<void> {
    try {
      this.stateManager.setState({ isLoading: true, error: null });

      await this.authOps.logout(this.mapSupabaseError);

      this.stateManager.setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      const authError = error as IAuthError;
      this.stateManager.setState({
        isLoading: false,
        error: authError,
      });
      throw authError;
    }
  }

  // Session operations - delegated to SessionOperations
  async getCurrentUser(): Promise<IUser | null> {
    return this.sessionOps.getCurrentUser(
      this.mapSupabaseUser,
      this.mapSupabaseError,
    );
  }

  async getCurrentSession(): Promise<IAuthSession | null> {
    return this.sessionOps.getCurrentSession(
      this.mapSupabaseSession,
      this.mapSupabaseError,
    );
  }

  async refreshSession(): Promise<IAuthSession | null> {
    const { user, session } = await this.sessionOps.refreshSession(
      this.mapSupabaseUser,
      this.mapSupabaseSession,
      this.mapSupabaseError,
    );

    this.stateManager.setState({
      user,
      session,
      isAuthenticated: !!user,
      error: null,
    });

    return session;
  }

  async resetPassword(data: IResetPasswordData): Promise<void> {
    try {
      await this.sessionOps.resetPassword(data, this.mapSupabaseError);
    } catch (error) {
      throw error as IAuthError;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      await this.sessionOps.updatePassword(newPassword, this.mapSupabaseError);
    } catch (error) {
      throw error as IAuthError;
    }
  }

  // Observer Pattern - delegated to StateManager
  onAuthStateChange(callback: (state: IAuthState) => void): () => void {
    return this.stateManager.addListener(callback);
  }

  // Initialization and cleanup
  async initialize(): Promise<void> {
    try {
      // Verify current session
      const session = await this.getCurrentSession();
      const user = session ? await this.getCurrentUser() : null;

      this.stateManager.setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: !!user,
        error: null,
      });

      // Setup listener for auth changes
      this.client.auth.onAuthStateChange((event, session) => {
        const user = session?.user ? this.mapSupabaseUser(session.user) : null;
        const mappedSession = session ? this.mapSupabaseSession(session) : null;

        this.stateManager.setState({
          user,
          session: mappedSession,
          isAuthenticated: !!user,
          error: null,
        });
      });
    } catch (error) {
      this.stateManager.setState({
        isLoading: false,
        error: error as IAuthError,
      });
    }
  }

  async cleanup(): Promise<void> {
    this.stateManager.clearListeners();
    // Supabase client cleanup is automatic
  }

  // Mappers for type conversion (Single Responsibility)
  private mapSupabaseUser = (supabaseUser: SupabaseUser): IUser => ({
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.name,
    avatar: supabaseUser.user_metadata?.avatar_url,
    role: supabaseUser.user_metadata?.role,
    metadata: supabaseUser.user_metadata,
  });

  private mapSupabaseSession = (
    supabaseSession: SupabaseSession,
  ): IAuthSession => ({
    user: this.mapSupabaseUser(supabaseSession.user),
    token: supabaseSession.access_token,
    expiresAt: new Date((supabaseSession.expires_at ?? 0) * 1000),
    refreshToken: supabaseSession.refresh_token,
  });

  private mapSupabaseError = (error: SupabaseAuthError): IAuthError => ({
    code: error.message || "unknown_error",
    message: error.message || "An unknown error occurred",
    details: error,
  });
}
