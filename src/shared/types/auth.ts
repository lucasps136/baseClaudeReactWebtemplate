export interface IUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  metadata?: Record<string, unknown>;
}

export interface IAuthSession {
  user: IUser;
  token: string;
  expiresAt?: Date;
  refreshToken?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterCredentials {
  email: string;
  password: string;
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface IResetPasswordData {
  email: string;
}

export interface IAuthError {
  code: string;
  message: string;
  details?: unknown;
}

export interface IAuthState {
  user: IUser | null;
  session: IAuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: IAuthError | null;
}

// Interface principal do provider (DIP)
export interface IAuthProvider {
  // Estado
  getState(): IAuthState;

  // Autenticação
  login(credentials: ILoginCredentials): Promise<IAuthSession>;
  register(credentials: IRegisterCredentials): Promise<IAuthSession>;
  logout(): Promise<void>;

  // Sessão
  getCurrentUser(): Promise<IUser | null>;
  getCurrentSession(): Promise<IAuthSession | null>;
  refreshSession(): Promise<IAuthSession | null>;

  // Recuperação de senha
  resetPassword(data: IResetPasswordData): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;

  // Listeners (Observer Pattern)
  onAuthStateChange(callback: (state: IAuthState) => void): () => void;

  // Inicialização
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

// Tipos para Strategy Pattern
export type AuthProviderType = "supabase" | "clerk" | "auth0" | "nextauth";

export interface IAuthProviderConfig {
  type: AuthProviderType;
  options: Record<string, unknown>;
}
