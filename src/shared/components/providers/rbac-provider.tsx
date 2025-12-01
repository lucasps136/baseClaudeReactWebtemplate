// RBAC Provider component inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Enhanced with SOLID principles

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getEnv } from "@/config/env";
import {
  RBACManager,
  registerDefaultRBACProviders,
  createRBACConfig,
} from "@/shared/services/rbac/rbac-factory";
import type { IRBACProvider, IRBACError } from "@/shared/types/rbac";

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
  // Optional custom configuration
  config?: {
    provider?: "supabase" | "database";
    options?: Record<string, any>;
  };
}

/**
 * RBAC Provider Component
 *
 * Initializes and provides RBAC functionality to the application.
 * Follows Dependency Inversion Principle by using factory pattern.
 *
 * @example
 * // Basic usage (uses environment variables)
 * <RBACProvider>
 *   <App />
 * </RBACProvider>
 *
 * @example
 * // Custom configuration
 * <RBACProvider config={{ provider: 'supabase', options: { url: '...', serviceKey: '...' } }}>
 *   <App />
 * </RBACProvider>
 */
export function RBACProvider({ children, config }: IRBACProviderProps) {
  const [provider, setProvider] = useState<IRBACProvider | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<IRBACError | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeRBAC = async () => {
    try {
      setLoading(true);
      setError(null);

      // Register default providers if not already registered
      await registerDefaultRBACProviders();

      // Create configuration based on props or environment
      const rbacConfig = config
        ? {
            type: config.provider || "supabase",
            options: config.options || {},
          }
        : createDefaultConfig();

      // Initialize RBAC manager
      const rbacProvider = await RBACManager.initialize(rbacConfig);

      setProvider(rbacProvider);
      setIsInitialized(true);
    } catch (err) {
      const rbacError: IRBACError = {
        code: "initialization_failed",
        message:
          err instanceof Error ? err.message : "Failed to initialize RBAC",
        details: err,
      };
      setError(rbacError);
      console.error("RBAC initialization failed:", rbacError);
    } finally {
      setLoading(false);
    }
  };

  const reinitialize = async () => {
    await initializeRBAC();
  };

  useEffect(() => {
    initializeRBAC();

    // Cleanup on unmount
    return () => {
      RBACManager.cleanup().catch(console.error);
    };
  }, []);

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

// Helper function to create default configuration
function createDefaultConfig() {
  const env = getEnv();

  // Default to Supabase (env variables are now required)
  return createRBACConfig.supabase(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

// Error boundary for RBAC
interface IRBACErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RBACErrorBoundary({
  children,
  fallback = <div>RBAC Error: Unable to load permissions</div>,
}: IRBACErrorBoundaryProps) {
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
  return function ComponentWithRBAC(props: P) {
    return (
      <RBACProvider {...providerProps}>
        <Component {...props} />
      </RBACProvider>
    );
  };
}

// Initialization status component
export function RBACInitializationStatus() {
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
