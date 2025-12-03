"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  AuthProviderFactory,
  registerDefaultProviders,
} from "@/shared/services/auth/auth-factory";
import type {
  IAuthProvider,
  IAuthState,
  IAuthProviderConfig,
} from "@/shared/types/auth";

// Context (Dependency Inversion)
interface IAuthContextType extends IAuthState {
  provider: IAuthProvider | null;
  login: IAuthProvider["login"];
  register: IAuthProvider["register"];
  logout: IAuthProvider["logout"];
  resetPassword: IAuthProvider["resetPassword"];
  updatePassword: IAuthProvider["updatePassword"];
  refreshSession: IAuthProvider["refreshSession"];
}

const AuthContext = createContext<IAuthContextType | null>(null);

// Provider Props
interface IAuthProviderProps {
  children: ReactNode;
  config?: IAuthProviderConfig;
}

interface IUseAuthStateReturn {
  user: IAuthState["user"];
  session: IAuthState["session"];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: IAuthState["error"];
}

interface IUseAuthActionsReturn {
  login: IAuthProvider["login"];
  register: IAuthProvider["register"];
  logout: IAuthProvider["logout"];
  resetPassword: IAuthProvider["resetPassword"];
  updatePassword: IAuthProvider["updatePassword"];
  refreshSession: IAuthProvider["refreshSession"];
}

// Hook para usar o contexto (Interface Segregation)
export const useAuth = (): IAuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hook especializado para estado (Single Responsibility)
export const useAuthState = (): IUseAuthStateReturn => {
  const { user, session, isLoading, isAuthenticated, error } = useAuth();
  return { user, session, isLoading, isAuthenticated, error };
};

// Hook especializado para ações (Single Responsibility)
export const useAuthActions = (): IUseAuthActionsReturn => {
  const {
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    refreshSession,
  } = useAuth();
  return {
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    refreshSession,
  };
};

/**
 * Initializes auth provider with error handling
 * SRP: Responsible only for provider initialization
 */
const initializeAuthProvider = async (
  config: IAuthProviderConfig,
  onSuccess: (provider: IAuthProvider) => void,
  onError: (error: unknown) => void,
): Promise<() => void | null> => {
  let mounted = true;
  let unsubscribe: (() => void) | null = null;

  try {
    await registerDefaultProviders();
    const authProvider = await AuthProviderFactory.createProvider(config);

    if (!mounted) return () => {};

    onSuccess(authProvider);

    unsubscribe = authProvider.onAuthStateChange((): void => {
      if (mounted) {
        onSuccess(authProvider);
      }
    });

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  } catch (error) {
    console.error("Failed to initialize auth provider:", error);
    if (mounted) {
      onError(error);
    }
    return () => {
      mounted = false;
    };
  }
};

/**
 * Creates context value with provider methods
 * SRP: Responsible only for creating context value
 */
const createAuthContextValue = (
  authState: IAuthState,
  provider: IAuthProvider | null,
): IAuthContextType => {
  const defaultError = (): Promise<never> => {
    throw new Error("Auth provider not initialized");
  };

  return {
    ...authState,
    provider,
    login:
      provider?.login.bind(provider) ??
      (defaultError as IAuthProvider["login"]),
    register:
      provider?.register.bind(provider) ??
      (defaultError as IAuthProvider["register"]),
    logout:
      provider?.logout.bind(provider) ??
      (defaultError as IAuthProvider["logout"]),
    resetPassword:
      provider?.resetPassword.bind(provider) ??
      (defaultError as IAuthProvider["resetPassword"]),
    updatePassword:
      provider?.updatePassword.bind(provider) ??
      (defaultError as IAuthProvider["updatePassword"]),
    refreshSession:
      provider?.refreshSession.bind(provider) ??
      (defaultError as IAuthProvider["refreshSession"]),
  };
};

// Provider Component
export const AuthProvider = ({
  children,
  config = { type: "supabase", options: {} },
}: IAuthProviderProps): JSX.Element => {
  const [provider, setProvider] = useState<IAuthProvider | null>(null);
  const [authState, setAuthState] = useState<IAuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Inicialização do provider (Open/Closed Principle)
  useEffect(() => {
    const cleanup = initializeAuthProvider(
      config,
      (authProvider): void => {
        setProvider(authProvider);
        setAuthState(authProvider.getState());
      },
      (error): void => {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: {
            code: "initialization_failed",
            message: "Failed to initialize authentication",
            details: error,
          },
        }));
      },
    );

    return (): void => {
      cleanup.then((cleanupFn) => cleanupFn?.()).catch(console.error);
    };
  }, [config]);

  // Cleanup na desmontagem
  useEffect(() => {
    return (): void => {
      if (provider) {
        provider.cleanup();
      }
    };
  }, [provider]);

  // Context value (Single Responsibility)
  const contextValue = createAuthContextValue(authState, provider);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Componente para proteção de rotas (Single Responsibility)
interface IProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({
  children,
  fallback = <div>Loading...</div>,
  requireAuth = true,
}: IProtectedRouteProps): JSX.Element => {
  const { isAuthenticated, isLoading } = useAuthState();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// HOC para componentes que precisam de autenticação (Higher-Order Component Pattern)
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; fallback?: ReactNode } = {},
): React.ComponentType<P> {
  const { requireAuth = true, fallback } = options;

  return function AuthenticatedComponent(props: P): JSX.Element {
    return (
      <ProtectedRoute requireAuth={requireAuth} fallback={fallback}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
