import type {
  IDatabaseProvider,
  DatabaseProviderType,
  IDatabaseProviderConfig,
} from "@/shared/types/database";

// Factory para criação de database providers (Factory Pattern + Strategy Pattern)
export class DatabaseProviderFactory {
  private static providers: Map<
    DatabaseProviderType,
    () => Promise<IDatabaseProvider>
  > = new Map();

  // Registrar provider (Open/Closed Principle)
  static registerProvider(
    type: DatabaseProviderType,
    factory: () => Promise<IDatabaseProvider>,
  ): void {
    this.providers.set(type, factory);
  }

  // Criar provider baseado no tipo (Strategy Pattern)
  static async createProvider(
    config: IDatabaseProviderConfig,
  ): Promise<IDatabaseProvider> {
    const factory = this.providers.get(config.type);

    if (!factory) {
      throw new Error(`Database provider '${config.type}' not registered`);
    }

    const provider = await factory();
    await provider.initialize();

    return provider;
  }

  // Listar providers disponíveis
  static getAvailableProviders(): DatabaseProviderType[] {
    return Array.from(this.providers.keys());
  }

  // Verificar se provider está disponível
  static isProviderAvailable(type: DatabaseProviderType): boolean {
    return this.providers.has(type);
  }

  // Limpar todos os providers registrados
  static clearProviders(): void {
    this.providers.clear();
  }
}

// Auto-registro de providers disponíveis
export const registerDefaultDatabaseProviders = async () => {
  // Supabase Provider (padrão)
  DatabaseProviderFactory.registerProvider("supabase", async () => {
    const { SupabaseDatabaseProvider } = await import(
      "./providers/supabase-database-provider"
    );
    return new SupabaseDatabaseProvider();
  });

  // NOTE: Provider not yet implemented - uncomment when ready
  // PlanetScale Provider (futuro)
  // DatabaseProviderFactory.registerProvider("planetscale", async () => {
  //   const { PlanetScaleDatabaseProvider } = await import(
  //     "./providers/planetscale-database-provider"
  //   );
  //   return new PlanetScaleDatabaseProvider();
  // });

  // NOTE: Provider not yet implemented - uncomment when ready
  // Prisma Provider (futuro)
  // DatabaseProviderFactory.registerProvider("prisma", async () => {
  //   const { PrismaDatabaseProvider } = await import(
  //     "./providers/prisma-database-provider"
  //   );
  //   return new PrismaDatabaseProvider();
  // });

  // NOTE: Provider not yet implemented - uncomment when ready
  // MongoDB Provider (futuro)
  // DatabaseProviderFactory.registerProvider("mongodb", async () => {
  //   const { MongoDBDatabaseProvider } = await import(
  //     "./providers/mongodb-database-provider"
  //   );
  //   return new MongoDBDatabaseProvider();
  // });
};

// Utilitário para validar configuração
export const validateDatabaseConfig = (
  config: IDatabaseProviderConfig,
): boolean => {
  if (!config.type) {
    throw new Error("Database provider type is required");
  }

  if (!DatabaseProviderFactory.isProviderAvailable(config.type)) {
    throw new Error(`Database provider '${config.type}' is not available`);
  }

  // Validações específicas por provider
  switch (config.type) {
    case "supabase":
      if (!config.options.url || !config.options.anonKey) {
        throw new Error("Supabase requires url and anonKey in options");
      }
      break;

    // NOTE: Validation for unimplemented providers - uncomment when ready
    // case "planetscale":
    //   if (
    //     !config.options.host ||
    //     !config.options.username ||
    //     !config.options.password
    //   ) {
    //     throw new Error(
    //       "PlanetScale requires host, username, and password in options",
    //     );
    //   }
    //   break;

    // case "prisma":
    //   if (!config.options.databaseUrl) {
    //     throw new Error("Prisma requires databaseUrl in options");
    //   }
    //   break;

    // case "mongodb":
    //   if (!config.options.connectionString) {
    //     throw new Error("MongoDB requires connectionString in options");
    //   }
    //   break;

    default:
      throw new Error(`Unknown database provider type: ${config.type}`);
  }

  return true;
};

// Builder pattern para configuração fácil
export class DatabaseConfigBuilder {
  private config: Partial<IDatabaseProviderConfig> = {};

  static create(): DatabaseConfigBuilder {
    return new DatabaseConfigBuilder();
  }

  useSupabase(url: string, anonKey: string, serviceRoleKey?: string): this {
    this.config = {
      type: "supabase",
      options: { url, anonKey, serviceRoleKey },
    };
    return this;
  }

  // NOTE: Builder methods for unimplemented providers - uncomment when ready
  // usePlanetScale(
  //   host: string,
  //   username: string,
  //   password: string,
  //   database: string,
  // ): this {
  //   this.config = {
  //     type: "planetscale",
  //     options: { host, username, password, database },
  //   };
  //   return this;
  // }

  // usePrisma(databaseUrl: string): this {
  //   this.config = {
  //     type: "prisma",
  //     options: { databaseUrl },
  //   };
  //   return this;
  // }

  // useMongoDB(connectionString: string, database: string): this {
  //   this.config = {
  //     type: "mongodb",
  //     options: { connectionString, database },
  //   };
  //   return this;
  // }

  withCustomOptions(options: Record<string, unknown>): this {
    this.config.options = { ...this.config.options, ...options };
    return this;
  }

  build(): IDatabaseProviderConfig {
    if (!this.config.type || !this.config.options) {
      throw new Error("Database configuration is incomplete");
    }

    const config = this.config as IDatabaseProviderConfig;
    validateDatabaseConfig(config);
    return config;
  }
}
