"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  IDatabaseProvider,
  IDatabaseProviderConfig,
} from "@/shared/types/database";
import {
  DatabaseProviderFactory,
  registerDefaultDatabaseProviders,
} from "@/shared/services/database/database-factory";

// Context (Dependency Inversion)
interface IDatabaseContextType {
  provider: IDatabaseProvider | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<IDatabaseContextType | null>(null);

// Provider Props
interface IDatabaseProviderProps {
  children: ReactNode;
  config?: IDatabaseProviderConfig;
}

// Hook para usar o contexto (Interface Segregation)
export const useDatabase = (): IDatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

// Hook especializado para operações CRUD (Single Responsibility)
export const useDatabaseOperations = () => {
  const { provider } = useDatabase();

  if (!provider) {
    throw new Error("Database provider not initialized");
  }

  return {
    // Create
    insert: provider.insert.bind(provider),

    // Read
    select: provider.select.bind(provider),
    selectOne: provider.selectOne.bind(provider),
    selectBy: provider.selectBy.bind(provider),

    // Update
    update: provider.update.bind(provider),
    updateBy: provider.updateBy.bind(provider),

    // Delete
    delete: provider.delete.bind(provider),
    deleteBy: provider.deleteBy.bind(provider),

    // Upsert
    upsert: provider.upsert.bind(provider),

    // Utilities
    count: provider.count.bind(provider),
    exists: provider.exists.bind(provider),

    // Raw queries
    query: provider.query.bind(provider),

    // Transactions
    transaction: provider.transaction.bind(provider),
  };
};

// Hook especializado para realtime (Single Responsibility)
export const useDatabaseRealtime = () => {
  const { provider } = useDatabase();

  if (!provider) {
    throw new Error("Database provider not initialized");
  }

  return {
    subscribe: provider.subscribe.bind(provider),
    unsubscribe: provider.unsubscribe.bind(provider),
  };
};

// Hook especializado para storage (Single Responsibility)
export const useDatabaseStorage = () => {
  const { provider } = useDatabase();

  if (!provider) {
    throw new Error("Database provider not initialized");
  }

  return {
    uploadFile: provider.uploadFile?.bind(provider),
    downloadFile: provider.downloadFile?.bind(provider),
    deleteFile: provider.deleteFile?.bind(provider),
  };
};

// Hook para status de conexão (Single Responsibility)
export const useDatabaseStatus = () => {
  const { isConnected, isLoading, error } = useDatabase();
  return { isConnected, isLoading, error };
};

// Provider Component
export const DatabaseProvider = ({
  children,
  config = { type: "supabase", options: {} },
}: IDatabaseProviderProps) => {
  const [provider, setProvider] = useState<IDatabaseProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicialização do provider (Open/Closed Principle)
  useEffect(() => {
    let mounted = true;

    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Registrar providers disponíveis
        await registerDefaultDatabaseProviders();

        // Criar provider baseado na configuração
        const databaseProvider =
          await DatabaseProviderFactory.createProvider(config);

        if (!mounted) return;

        setProvider(databaseProvider);

        // Verificar conexão
        const connected = await databaseProvider.isConnected();
        setIsConnected(connected);

        if (!connected) {
          console.warn("Database provider initialized but not connected");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize database provider:", error);
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to initialize database",
          );
          setIsLoading(false);
          setIsConnected(false);
        }
      }
    };

    initializeDatabase();

    return () => {
      mounted = false;
    };
  }, [config]);

  // Health check periódico
  useEffect(() => {
    if (!provider) return;

    const healthCheckInterval = setInterval(async () => {
      try {
        const health = await provider.getHealth();
        setIsConnected(health.status === "healthy");

        if (health.status === "unhealthy") {
          setError(
            `Database unhealthy: ${health.details?.error || "Unknown error"}`,
          );
        } else {
          setError(null);
        }
      } catch (error) {
        setIsConnected(false);
        setError("Health check failed");
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [provider]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (provider) {
        provider.cleanup();
      }
    };
  }, [provider]);

  // Context value (Single Responsibility)
  const contextValue: IDatabaseContextType = {
    provider,
    isConnected,
    isLoading,
    error,
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

// HOC para componentes que precisam de database (Higher-Order Component Pattern)
export function withDatabase<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireConnection?: boolean; fallback?: ReactNode } = {},
) {
  const {
    requireConnection = true,
    fallback = <div>Loading database...</div>,
  } = options;

  return function DatabaseConnectedComponent(props: P) {
    const { isConnected, isLoading } = useDatabaseStatus();

    if (isLoading) {
      return <>{fallback}</>;
    }

    if (requireConnection && !isConnected) {
      return <div>Database not connected</div>;
    }

    return <Component {...props} />;
  };
}

// Componente para verificação de conexão (Single Responsibility)
interface IDatabaseStatusProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireConnection?: boolean;
}

export const DatabaseStatus = ({
  children,
  fallback = <div>Loading database...</div>,
  requireConnection = true,
}: IDatabaseStatusProps) => {
  const { isConnected, isLoading, error } = useDatabaseStatus();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (error) {
    return <div>Database error: {error}</div>;
  }

  if (requireConnection && !isConnected) {
    return <div>Database not connected</div>;
  }

  return <>{children}</>;
};
