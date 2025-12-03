"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  DatabaseProviderFactory,
  registerDefaultDatabaseProviders,
} from "@/shared/services/database/database-factory";
import type {
  IDatabaseProvider,
  IDatabaseProviderConfig,
} from "@/shared/types/database";

interface IDatabaseContextType {
  provider: IDatabaseProvider | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<IDatabaseContextType | null>(null);

interface IDatabaseProviderProps {
  children: ReactNode;
  config?: IDatabaseProviderConfig;
}

interface IUseDatabaseOperationsReturn {
  insert: IDatabaseProvider["insert"];
  select: IDatabaseProvider["select"];
  selectOne: IDatabaseProvider["selectOne"];
  selectBy: IDatabaseProvider["selectBy"];
  update: IDatabaseProvider["update"];
  updateBy: IDatabaseProvider["updateBy"];
  delete: IDatabaseProvider["delete"];
  deleteBy: IDatabaseProvider["deleteBy"];
  upsert: IDatabaseProvider["upsert"];
  count: IDatabaseProvider["count"];
  exists: IDatabaseProvider["exists"];
  query: IDatabaseProvider["query"];
  transaction: IDatabaseProvider["transaction"];
}

interface IUseDatabaseRealtimeReturn {
  subscribe: IDatabaseProvider["subscribe"];
  unsubscribe: IDatabaseProvider["unsubscribe"];
}

interface IUseDatabaseStorageReturn {
  uploadFile: IDatabaseProvider["uploadFile"];
  downloadFile: IDatabaseProvider["downloadFile"];
  deleteFile: IDatabaseProvider["deleteFile"];
}

interface IUseDatabaseStatusReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useDatabase = (): IDatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

export const useDatabaseOperations = (): IUseDatabaseOperationsReturn => {
  const { provider } = useDatabase();

  if (!provider) {
    throw new Error("Database provider not initialized");
  }

  return {
    insert: provider.insert.bind(provider),
    select: provider.select.bind(provider),
    selectOne: provider.selectOne.bind(provider),
    selectBy: provider.selectBy.bind(provider),
    update: provider.update.bind(provider),
    updateBy: provider.updateBy.bind(provider),
    delete: provider.delete.bind(provider),
    deleteBy: provider.deleteBy.bind(provider),
    upsert: provider.upsert.bind(provider),
    count: provider.count.bind(provider),
    exists: provider.exists.bind(provider),
    query: provider.query.bind(provider),
    transaction: provider.transaction.bind(provider),
  };
};

export const useDatabaseRealtime = (): IUseDatabaseRealtimeReturn => {
  const { provider } = useDatabase();

  if (!provider) {
    throw new Error("Database provider not initialized");
  }

  return {
    subscribe: provider.subscribe.bind(provider),
    unsubscribe: provider.unsubscribe.bind(provider),
  };
};

export const useDatabaseStorage = (): IUseDatabaseStorageReturn => {
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

export const useDatabaseStatus = (): IUseDatabaseStatusReturn => {
  const { isConnected, isLoading, error } = useDatabase();
  return { isConnected, isLoading, error };
};

// SRP: Initialize database provider
const initializeDatabaseProvider = async (
  config: IDatabaseProviderConfig,
): Promise<IDatabaseProvider> => {
  await registerDefaultDatabaseProviders();
  return await DatabaseProviderFactory.createProvider(config);
};

// SRP: Extract error message from health details
const extractHealthErrorMessage = (details: unknown): string => {
  if (details && typeof details === "object" && "error" in details) {
    return String(details.error);
  }
  return "Unknown error";
};

// SRP: Handle health check
const handleHealthCheck = async (
  provider: IDatabaseProvider,
  setIsConnected: (connected: boolean) => void,
  setError: (error: string | null) => void,
): Promise<void> => {
  try {
    const health = await provider.getHealth();
    setIsConnected(health.status === "healthy");

    if (health.status === "unhealthy") {
      const errorMsg = extractHealthErrorMessage(health.details);
      setError(`Database unhealthy: ${errorMsg}`);
    } else {
      setError(null);
    }
  } catch (error) {
    setIsConnected(false);
    setError("Health check failed");
  }
};

// SRP: Database initialization logic
interface IDatabaseStateSetters {
  setProvider: (provider: IDatabaseProvider | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useInitializeDatabase = (
  config: IDatabaseProviderConfig,
  stateSetters: IDatabaseStateSetters,
): void => {
  const { setProvider, setIsConnected, setIsLoading, setError } = stateSetters;
  useEffect(() => {
    let mounted = true;

    const initializeDatabase = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const databaseProvider = await initializeDatabaseProvider(config);

        if (!mounted) return;

        setProvider(databaseProvider);

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

    return (): void => {
      mounted = false;
    };
  }, [config, setProvider, setIsConnected, setIsLoading, setError]);
};

export const DatabaseProvider = ({
  children,
  config = { type: "supabase", options: {} },
}: IDatabaseProviderProps): JSX.Element => {
  const [provider, setProvider] = useState<IDatabaseProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useInitializeDatabase(config, {
    setProvider,
    setIsConnected,
    setIsLoading,
    setError,
  });

  useEffect(() => {
    if (!provider) return;

    const healthCheckInterval = setInterval(
      () => handleHealthCheck(provider, setIsConnected, setError),
      30000,
    );

    return (): void => clearInterval(healthCheckInterval);
  }, [provider]);

  useEffect(() => {
    return (): void => {
      if (provider) {
        provider.cleanup();
      }
    };
  }, [provider]);

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

export function withDatabase<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireConnection?: boolean; fallback?: ReactNode } = {},
) {
  const {
    requireConnection = true,
    fallback = <div>Loading database...</div>,
  } = options;

  return function DatabaseConnectedComponent(props: P): JSX.Element {
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

interface IDatabaseStatusProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireConnection?: boolean;
}

export const DatabaseStatus = ({
  children,
  fallback = <div>Loading database...</div>,
  requireConnection = true,
}: IDatabaseStatusProps): JSX.Element => {
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
