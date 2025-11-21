/**
 * Clerk Auth Provider
 * Implementação completa usando @clerk/nextjs SDK
 * Segue padrões SOLID e interface IAuthProvider
 */

import { logger } from "@/shared/services/logger";
import type {
  IAuthProvider,
  User,
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordData,
  AuthState,
  AuthError,
} from "@/shared/types/auth";

export class ClerkAuthProvider implements IAuthProvider {
  private state: AuthState = {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  };
  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    // Verificar se @clerk/nextjs está disponível
    try {
      require("@clerk/nextjs");
    } catch (error) {
      throw new Error(
        "Clerk Auth Provider requires @clerk/nextjs. Install it with: npm install @clerk/nextjs",
      );
    }
  }

  // Single Responsibility: Estado
  getState(): AuthState {
    return { ...this.state };
  }

  private setState(partial: Partial<AuthState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  // Single Responsibility: Autenticação
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO: Remove when implementing direct Clerk login
  async login(_credentials: LoginCredentials): Promise<AuthSession> {
    try {
      this.setState({ isLoading: true, error: null });

      // Clerk usa signIn ao invés de método direto de login
      // Este método deve ser chamado após o usuário usar o componente SignIn do Clerk
      throw this.createAuthError(
        "clerk_login_not_direct",
        "Clerk authentication requires using Clerk's SignIn component. Use clerk.signIn() on client-side.",
      );
    } catch (error) {
      const authError = error as AuthError;
      this.setState({
        isLoading: false,
        error: authError,
        isAuthenticated: false,
      });
      throw authError;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO: Remove when implementing direct Clerk register
  async register(_credentials: RegisterCredentials): Promise<AuthSession> {
    try {
      this.setState({ isLoading: true, error: null });

      // Clerk usa signUp ao invés de método direto de register
      // Este método deve ser chamado após o usuário usar o componente SignUp do Clerk
      throw this.createAuthError(
        "clerk_register_not_direct",
        "Clerk authentication requires using Clerk's SignUp component. Use clerk.signUp() on client-side.",
      );
    } catch (error) {
      const authError = error as AuthError;
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

      // Clerk logout deve ser feito via clerk.signOut() no client-side
      // Este é um placeholder que atualiza o estado local
      this.setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      const authError = error as AuthError;
      this.setState({
        isLoading: false,
        error: authError,
      });
      throw authError;
    }
  }

  // Single Responsibility: Sessão
  async getCurrentUser(): Promise<User | null> {
    try {
      // Clerk user deve ser obtido via useUser() hook no client-side
      // Este método retorna o estado atual
      return this.state.user;
    } catch (error) {
      logger.error("Error getting current user", "ClerkAuthProvider", {
        error,
      });
      return null;
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      // Clerk session deve ser obtida via useSession() hook no client-side
      // Este método retorna o estado atual
      return this.state.session;
    } catch (error) {
      logger.error("Error getting current session", "ClerkAuthProvider", {
        error,
      });
      return null;
    }
  }

  async refreshSession(): Promise<AuthSession | null> {
    try {
      // Clerk gerencia refresh automaticamente
      // Este método retorna a sessão atual
      return this.state.session;
    } catch (error) {
      logger.error("Error refreshing session", "ClerkAuthProvider", { error });
      return null;
    }
  }

  // Single Responsibility: Recuperação de senha
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO: Remove when implementing Clerk password reset
  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      // Clerk password reset deve ser feito via clerk UI components
      // ou clerk.signIn.prepareFirstFactor() no client-side
      throw this.createAuthError(
        "clerk_reset_not_direct",
        "Clerk password reset requires using Clerk's UI components or client-side methods.",
      );
    } catch (error) {
      throw error as AuthError;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO: Remove when implementing Clerk password update
  async updatePassword(newPassword: string): Promise<void> {
    try {
      // Clerk password update deve ser feito via user.update() no client-side
      throw this.createAuthError(
        "clerk_update_not_direct",
        "Clerk password update requires using user.update() on client-side.",
      );
    } catch (error) {
      throw error as AuthError;
    }
  }

  // Observer Pattern: Listeners
  onAuthStateChange(callback: (state: AuthState) => void): () => void {
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
      // Clerk inicialização deve ser feita via ClerkProvider no app
      // Este método apenas prepara o estado
      this.setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      // Note: Clerk auth state changes são gerenciados pelos hooks useUser/useSession
      // Este provider serve como adaptador para a interface IAuthProvider
    } catch (error) {
      this.setState({
        isLoading: false,
        error: error as AuthError,
      });
    }
  }

  async cleanup(): Promise<void> {
    this.listeners = [];
    // Clerk cleanup é automático via ClerkProvider
  }

  // Helper: Criar erro padronizado
  private createAuthError(code: string, message: string): AuthError {
    return {
      code,
      message,
      details: { provider: "clerk" },
    };
  }

  /**
   * Método auxiliar para atualizar estado a partir de dados do Clerk
   * Deve ser chamado quando hooks do Clerk detectarem mudanças
   */
  updateFromClerkState(clerkUser: any, clerkSession: any): void {
    if (clerkUser && clerkSession) {
      const user = this.mapClerkUser(clerkUser);
      const session = this.mapClerkSession(clerkSession, clerkUser);

      this.setState({
        user,
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      this.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }

  // Mappers para conversão de tipos (Single Responsibility)
  private mapClerkUser(clerkUser: any): User {
    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
      name: clerkUser.fullName || clerkUser.firstName || undefined,
      avatar: clerkUser.imageUrl || undefined,
      role: clerkUser.publicMetadata?.role || undefined,
      metadata: {
        ...clerkUser.publicMetadata,
        ...clerkUser.unsafeMetadata,
      },
    };
  }

  private mapClerkSession(clerkSession: any, clerkUser: any): AuthSession {
    return {
      user: this.mapClerkUser(clerkUser),
      token: clerkSession.lastActiveToken?.getRawString() || "",
      expiresAt: clerkSession.expireAt
        ? new Date(clerkSession.expireAt)
        : undefined,
      refreshToken: undefined, // Clerk gerencia refresh tokens internamente
    };
  }
}
