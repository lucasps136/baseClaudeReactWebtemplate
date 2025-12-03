// Export principal do módulo de database
export {
  DatabaseProviderFactory,
  registerDefaultDatabaseProviders,
  validateDatabaseConfig,
  DatabaseConfigBuilder,
} from "./database-factory";

export { SupabaseDatabaseProvider } from "./providers/supabase-database-provider";

// Re-export types
export type {
  IDatabaseProvider,
  IDatabaseRecord,
  IQueryOptions,
  IInsertData,
  IUpdateData,
  IUpsertData,
  IDatabaseResponse,
  IDatabaseError,
  ITransactionContext,
  IRealtimeSubscription,
  IRealtimeEvent,
  RealtimeCallback,
  DatabaseProviderType,
  IDatabaseProviderConfig,
  ISupabaseConfig,
  IPlanetScaleConfig,
  IPrismaConfig,
  IMongoDBConfig,
} from "@/shared/types/database";

// Re-export provider components
export {
  DatabaseProvider,
  useDatabase,
  useDatabaseOperations,
  useDatabaseRealtime,
  useDatabaseStorage,
  useDatabaseStatus,
  withDatabase,
  DatabaseStatus,
} from "@/shared/components/providers/database-provider";

// Re-import types and classes for helpers
import type { IDatabaseProviderConfig } from "@/shared/types/database";

import { DatabaseConfigBuilder } from "./database-factory";

// Helper para criar configuração facilmente
export const createDatabaseConfig = {
  supabase: (
    url: string,
    anonKey: string,
    serviceRoleKey?: string,
  ): IDatabaseProviderConfig =>
    DatabaseConfigBuilder.create()
      .useSupabase(url, anonKey, serviceRoleKey)
      .build(),

  // NOTE: Helpers for unimplemented providers - uncomment when ready
  // planetscale: (
  //   host: string,
  //   username: string,
  //   password: string,
  //   database: string,
  // ) =>
  //   DatabaseConfigBuilder.create()
  //     .usePlanetScale(host, username, password, database)
  //     .build(),

  // prisma: (databaseUrl: string) =>
  //   DatabaseConfigBuilder.create().usePrisma(databaseUrl).build(),

  // mongodb: (connectionString: string, database: string) =>
  //   DatabaseConfigBuilder.create()
  //     .useMongoDB(connectionString, database)
  //     .build(),
};
