// RBAC Provider component inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Enhanced with SOLID principles

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import {
  RBACManager,
  registerDefaultRBACProviders,
} from "@/shared/services/rbac/rbac-factory";
import type {
  IRBACProvider,
  IRBACError,
  IRBACProviderConfig,
} from "@/shared/types/rbac";

interface IRBACContextValue {
  provider: IRBACProvider | null;
  isInitialized: boolean;
  error: IRBACError | null;
  loading: boolean;
  reinitialize: () => Promise<void>;
}

const RBACContext = createContext<IRBACContextValue | null>(null);

interface IRBACProviderProps {
  children: ReactNode;
  // Explicit configuration. When omitted, the provider is a no-op —
  // service role keys must never be injected here (client component).
  config?: {
    provider?: "supabase" | "database";
    options?: Record<string, unknown>;
  };
}

// SRP: Create RBAC configuration from explicit props only
const createRBACConfiguration = (
  config: IRBACProviderProps["config"],
): IRBACProviderConfig | null => {
  if (!config) return null;
  return {
    type: config.provider || "supabase",
    options: config.options || {},
  };
};

// SRP: Convert error to RBAC error format
const createRBACError = (err: unknown): IRBACError => {
  return {
    code: "initialization_failed",
    message: err instanceof Error ? err.message : "Failed to initialize RBAC",
    details: err,
  };
};

// SRP: Initialize RBAC with error handling
const performRBACInitialization = async (
  rbacConfig: IRBACProviderConfig,
): Promise<IRBACProvider> => {
  await registerDefaultRBACProviders();
  return await RBACManager.initialize(rbacConfig);
};

/**
 * RBAC Provider Component
 *
 * Initializes and provides RBAC functionality to the application.
 * Follows Dependency Inversion Principle by using factory pattern.
 *
 * IMPORTANT: Without an explicit `config` prop this provider is a no-op
 * (isInitialized=false, provider=null). Apps that need real RBAC must
 * obtain configuration via a Server Action / Route Handler and pass it
 * down — service role keys cannot live in client components.
 *
 * @example
 * // No-op (default) — safe on the client
 * <RBACProvider>
 *   <App />
 * </RBACProvider>
 *
 * @example
 * // Explicit configuration from a server-side source
 * <RBACProvider config={{ provider: 'supabase', options: serverProvidedOptions }}>
 *   <App />
 * </RBACProvider>
 */

export function RBACProvider({
  children,
  config,
}: IRBACProviderProps): JSX.Element {
  const [provider, setProvider] = useState<IRBACProvider | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<IRBACError | null>(null);
  const [loading, setLoading] = useState(false);

  const initializeRBAC = useCallback(async (): Promise<void> => {
    const rbacConfig = createRBACConfiguration(config);
    if (!rbacConfig) {
      setProvider(null);
      setIsInitialized(false);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const rbacProvider = await performRBACInitialization(rbacConfig);
      setProvider(rbacProvider);
      setIsInitialized(true);
    } catch (err) {
      const rbacError = createRBACError(err);
      setError(rbacError);
      console.error("RBAC initialization failed:", rbacError);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const reinitialize = useCallback(async (): Promise<void> => {
    await initializeRBAC();
  }, [initializeRBAC]);

  useEffect(() => {
    initializeRBAC();
    return (): void => {
      RBACManager.cleanup().catch(console.error);
    };
  }, [initializeRBAC]);

  const contextValue: IRBACContextValue = {
    provider,
    isInitialized,
    error,
    loading,
    reinitialize,
  };

  return (
    <RBACContext.Provider value={contextValue}>{children}</RBACContext.Provider>
  );
}

// Hook to access RBAC context
export function useRBACContext(): IRBACContextValue {
  const context = useContext(RBACContext);

  if (!context) {
    throw new Error("useRBACContext must be used within RBACProvider");
  }

  return context;
}

// Error boundary for RBAC
interface IRBACErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RBACErrorBoundary({
  children,
  fallback = <div>RBAC Error: Unable to load permissions</div>,
}: IRBACErrorBoundaryProps): JSX.Element {
  const { error, loading } = useRBACContext();

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  if (error) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// HOC pattern for automatic RBAC setup
export function withRBACProvider<P extends object>(
  Component: React.ComponentType<P>,
  providerProps?: Omit<IRBACProviderProps, "children">,
) {
  return function ComponentWithRBAC(props: P): JSX.Element {
    return (
      <RBACProvider {...providerProps}>
        <Component {...props} />
      </RBACProvider>
    );
  };
}

// Initialization status component
export function RBACInitializationStatus(): JSX.Element {
  const { isInitialized, loading, error } = useRBACContext();

  if (loading) {
    return (
      <div className="text-muted-foreground">Initializing permissions...</div>
    );
  }

  if (error) {
    return <div className="text-destructive">RBAC Error: {error.message}</div>;
  }

  if (!isInitialized) {
    return <div className="text-warning">RBAC not initialized</div>;
  }

  return <div className="text-success">Permissions loaded</div>;
}
