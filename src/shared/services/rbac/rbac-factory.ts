// RBAC factory inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Enhanced with SOLID Factory Pattern

import type {
  IRBACProvider,
  RBACProviderType,
  IRBACProviderConfig,
} from "@/shared/types/rbac";

// Factory for creating RBAC providers (Factory Pattern + Strategy Pattern)
export class RBACProviderFactory {
  private static providers: Map<
    RBACProviderType,
    () => Promise<IRBACProvider>
  > = new Map();

  // Register provider (Open/Closed Principle)
  static registerProvider(
    type: RBACProviderType,
    factory: () => Promise<IRBACProvider>,
  ): void {
    this.providers.set(type, factory);
  }

  // Create provider based on type (Strategy Pattern)
  static async createProvider(
    config: IRBACProviderConfig,
  ): Promise<IRBACProvider> {
    const factory = this.providers.get(config.type);

    if (!factory) {
      throw new Error(`RBAC provider '${config.type}' not registered`);
    }

    const provider = await factory();
    await provider.initialize();

    return provider;
  }

  // List available providers
  static getAvailableProviders(): RBACProviderType[] {
    return Array.from(this.providers.keys());
  }

  // Check if provider is available
  static isProviderAvailable(type: RBACProviderType): boolean {
    return this.providers.has(type);
  }

  // Clear all registered providers
  static clearProviders(): void {
    this.providers.clear();
  }
}

// Auto-registration of available providers
export const registerDefaultRBACProviders = async () => {
  // Supabase Provider (default)
  RBACProviderFactory.registerProvider("supabase", async () => {
    const { SupabaseRBACProvider } = await import(
      "./providers/supabase-rbac-provider"
    );
    return new SupabaseRBACProvider();
  });

  // Database Provider (future - for other databases)
  RBACProviderFactory.registerProvider("database", async () => {
    const { DatabaseRBACProvider } = await import(
      "./providers/database-rbac-provider"
    );
    return new DatabaseRBACProvider();
  });
};

// Utility to validate RBAC configuration
export const validateRBACConfig = (config: IRBACProviderConfig): boolean => {
  if (!config.type) {
    throw new Error("RBAC provider type is required");
  }

  if (!RBACProviderFactory.isProviderAvailable(config.type)) {
    throw new Error(`RBAC provider '${config.type}' is not available`);
  }

  // Provider-specific validations
  switch (config.type) {
    case "supabase":
      if (!config.options.url || !config.options.serviceKey) {
        throw new Error("Supabase requires url and serviceKey in options");
      }
      break;

    case "database":
      if (!config.options.connectionString) {
        throw new Error(
          "Database provider requires connectionString in options",
        );
      }
      break;

    default:
      throw new Error(`Unknown RBAC provider type: ${config.type}`);
  }

  return true;
};

// Builder pattern for easy configuration
export class RBACConfigBuilder {
  private config: Partial<IRBACProviderConfig> = {};

  static create(): RBACConfigBuilder {
    return new RBACConfigBuilder();
  }

  useSupabase(url: string, serviceKey: string): this {
    this.config = {
      type: "supabase",
      options: { url, serviceKey },
    };
    return this;
  }

  useDatabase(connectionString: string): this {
    this.config = {
      type: "database",
      options: { connectionString },
    };
    return this;
  }

  withCustomOptions(options: Record<string, any>): this {
    this.config.options = { ...this.config.options, ...options };
    return this;
  }

  build(): IRBACProviderConfig {
    if (!this.config.type || !this.config.options) {
      throw new Error("RBAC configuration is incomplete");
    }

    const config = this.config as IRBACProviderConfig;
    validateRBACConfig(config);
    return config;
  }
}

// Preset configurations for common scenarios
export const createRBACConfig = {
  supabase: (url: string, serviceKey: string) =>
    RBACConfigBuilder.create().useSupabase(url, serviceKey).build(),

  database: (connectionString: string) =>
    RBACConfigBuilder.create().useDatabase(connectionString).build(),
};

// Singleton instance management (Optional Pattern)
export class RBACManager {
  private static instance: IRBACProvider | null = null;
  private static config: IRBACProviderConfig | null = null;

  static async initialize(config: IRBACProviderConfig): Promise<IRBACProvider> {
    if (this.instance && this.config?.type === config.type) {
      return this.instance;
    }

    if (this.instance) {
      await this.instance.cleanup();
    }

    this.instance = await RBACProviderFactory.createProvider(config);
    this.config = config;
    return this.instance;
  }

  static getInstance(): IRBACProvider {
    if (!this.instance) {
      throw new Error(
        "RBAC not initialized. Call RBACManager.initialize() first.",
      );
    }
    return this.instance;
  }

  static async cleanup(): Promise<void> {
    if (this.instance) {
      await this.instance.cleanup();
      this.instance = null;
      this.config = null;
    }
  }

  static isInitialized(): boolean {
    return this.instance !== null;
  }
}

// Easy access function for common use cases
export const getRBACProvider = (): IRBACProvider => {
  return RBACManager.getInstance();
};
