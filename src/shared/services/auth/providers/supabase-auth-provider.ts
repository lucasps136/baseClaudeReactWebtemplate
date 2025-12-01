import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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
import { getEnv } from "@/config/env";

export class SupabaseAuthProvider implements IAuthProvider {
  private client: SupabaseClient;
  private state: IAuthState = {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  };
  private listeners: ((state: IAuthState) => void)[] = [];

  constructor() {
    const env = getEnv();
    this.client = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  // Single Responsibility: Estado
  getState(): IAuthState {
    return { ...this.state };
  }

  private setState(partial: Partial<IAuthState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  // Single Responsibility: Autenticação
  async login(credentials: ILoginCredentials): Promise<IAuthSession> {
    try {
      this.setState({ isLoading: true, error: null });

      const { data, error } = await this.client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!data.session || !data.user) {
        throw new Error("Login failed - no session created");
      }

      const user = this.mapSupabaseUser(data.user);
      const session = this.mapSupabaseSession(data.session);

      this.setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return session;
    } catch (error) {
      const authError = error as IAuthError;
      this.setState({
        isLoading: false,
        error: authError,
        isAuthenticated: false,
      });
      throw authError;
    }
  }

  async register(credentials: IRegisterCredentials): Promise<IAuthSession> {
    try {
      this.setState({ isLoading: true, error: null });

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
        throw this.mapSupabaseError(error);
      }

      if (!data.session || !data.user) {
        throw new Error("Registration failed - no session created");
      }

      const user = this.mapSupabaseUser(data.user);
      const session = this.mapSupabaseSession(data.session);

      this.setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return session;
    } catch (error) {
      const authError = error as IAuthError;
      this.setState({
        isLoading: false,
        error: authError,
        isAuthenticated: false,
      });
      throw authError;
    }
  }

  async logout(): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });

      const { error } = await this.client.auth.signOut();

      if (error) {
        throw this.mapSupabaseError(error);
      }

      this.setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      const authError = error as IAuthError;
      this.setState({
        isLoading: false,
        error: authError,
      });
      throw authError;
    }
  }

  // Single Responsibility: Sessão
  async getCurrentUser(): Promise<IUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser();

      if (error) {
        throw this.mapSupabaseError(error);
      }

      return user ? this.mapSupabaseUser(user) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async getCurrentSession(): Promise<IAuthSession | null> {
    try {
      const {
        data: { session },
        error,
      } = await this.client.auth.getSession();

      if (error) {
        throw this.mapSupabaseError(error);
      }

      return session ? this.mapSupabaseSession(session) : null;
    } catch (error) {
      console.error("Error getting current session:", error);
      return null;
    }
  }

  async refreshSession(): Promise<IAuthSession | null> {
    try {
      const { data, error } = await this.client.auth.refreshSession();

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!data.session) {
        return null;
      }

      const session = this.mapSupabaseSession(data.session);
      const user = data.user ? this.mapSupabaseUser(data.user) : null;

      this.setState({
        user,
        session,
        isAuthenticated: !!user,
        error: null,
      });

      return session;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
  }

  // Single Responsibility: Recuperação de senha
  async resetPassword(data: IResetPasswordData): Promise<void> {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(
        data.email,
      );

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      throw error as IAuthError;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await this.client.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      throw error as IAuthError;
    }
  }

  // Observer Pattern: Listeners
  onAuthStateChange(callback: (state: IAuthState) => void): () => void {
    this.listeners.push(callback);

    // Retorna função para remover listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Inicialização e cleanup
  async initialize(): Promise<void> {
    try {
      // Verificar sessão atual
      const session = await this.getCurrentSession();
      const user = session ? await this.getCurrentUser() : null;

      this.setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: !!user,
        error: null,
      });

      // Configurar listener para mudanças de auth
      this.client.auth.onAuthStateChange((event, session) => {
        const user = session?.user ? this.mapSupabaseUser(session.user) : null;
        const mappedSession = session ? this.mapSupabaseSession(session) : null;

        this.setState({
          user,
          session: mappedSession,
          isAuthenticated: !!user,
          error: null,
        });
      });
    } catch (error) {
      this.setState({
        isLoading: false,
        error: error as IAuthError,
      });
    }
  }

  async cleanup(): Promise<void> {
    this.listeners = [];
    // Supabase client cleanup é automático
  }

  // Mappers para conversão de tipos (Single Responsibility)
  private mapSupabaseUser(supabaseUser: any): IUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.name,
      avatar: supabaseUser.user_metadata?.avatar_url,
      role: supabaseUser.user_metadata?.role,
      metadata: supabaseUser.user_metadata,
    };
  }

  private mapSupabaseSession(supabaseSession: any): IAuthSession {
    return {
      user: this.mapSupabaseUser(supabaseSession.user),
      token: supabaseSession.access_token,
      expiresAt: new Date(supabaseSession.expires_at * 1000),
      refreshToken: supabaseSession.refresh_token,
    };
  }

  private mapSupabaseError(error: any): IAuthError {
    return {
      code: error.message || "unknown_error",
      message: error.message || "An unknown error occurred",
      details: error,
    };
  }
}
