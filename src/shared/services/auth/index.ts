// Export principal do módulo de autenticação
export { AuthProviderFactory, registerDefaultProviders } from "./auth-factory";
export { SupabaseAuthProvider } from "./providers/supabase-auth-provider";

// Re-export types
export type {
  IAuthProvider,
  IUser,
  IAuthSession,
  ILoginCredentials,
  IRegisterCredentials,
  IResetPasswordData,
  IAuthState,
  IAuthError,
  AuthProviderType,
  IAuthProviderConfig,
} from "@/shared/types/auth";

// Re-export provider components
export {
  AuthProvider,
  useAuth,
  useAuthState,
  useAuthActions,
  ProtectedRoute,
  withAuth,
} from "@/shared/components/providers/auth-provider";
