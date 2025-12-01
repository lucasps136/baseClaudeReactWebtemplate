// Payment factory inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Enhanced with SOLID Factory Pattern

import type {
  IPaymentProvider,
  PaymentProviderType,
  IPaymentProviderConfig,
} from "@/shared/types/payments";

// Factory for creating payment providers (Factory Pattern + Strategy Pattern)
export class PaymentProviderFactory {
  private static providers: Map<
    PaymentProviderType,
    () => Promise<IPaymentProvider>
  > = new Map();

  // Register provider (Open/Closed Principle)
  static registerProvider(
    type: PaymentProviderType,
    factory: () => Promise<IPaymentProvider>,
  ): void {
    this.providers.set(type, factory);
  }

  // Create provider based on type (Strategy Pattern)
  static async createProvider(
    config: IPaymentProviderConfig,
  ): Promise<IPaymentProvider> {
    const factory = this.providers.get(config.type);

    if (!factory) {
      throw new Error(`Payment provider '${config.type}' not registered`);
    }

    const provider = await factory();
    await provider.initialize();

    return provider;
  }

  // List available providers
  static getAvailableProviders(): PaymentProviderType[] {
    return Array.from(this.providers.keys());
  }

  // Check if provider is available
  static isProviderAvailable(type: PaymentProviderType): boolean {
    return this.providers.has(type);
  }

  // Clear all registered providers
  static clearProviders(): void {
    this.providers.clear();
  }
}

// Auto-registration of available providers
export const registerDefaultPaymentProviders = async () => {
  // Stripe Provider (default)
  PaymentProviderFactory.registerProvider("stripe", async () => {
    const { StripePaymentProvider } = await import(
      "./providers/stripe-payment-provider"
    );
    return new StripePaymentProvider();
  });

  // NOTE: Provider not yet implemented - uncomment when ready
  // Paddle Provider (future)
  // PaymentProviderFactory.registerProvider("paddle", async () => {
  //   const { PaddlePaymentProvider } = await import(
  //     "./providers/paddle-payment-provider"
  //   );
  //   return new PaddlePaymentProvider();
  // });

  // NOTE: Provider not yet implemented - uncomment when ready
  // LemonSqueezy Provider (future)
  // PaymentProviderFactory.registerProvider("lemonsqueezy", async () => {
  //   const { LemonSqueezyPaymentProvider } = await import(
  //     "./providers/lemonsqueezy-payment-provider"
  //   );
  //   return new LemonSqueezyPaymentProvider();
  // });
};

// Utility to validate payment configuration
export const validatePaymentConfig = (
  config: IPaymentProviderConfig,
): boolean => {
  if (!config.type) {
    throw new Error("Payment provider type is required");
  }

  if (!PaymentProviderFactory.isProviderAvailable(config.type)) {
    throw new Error(`Payment provider '${config.type}' is not available`);
  }

  // Provider-specific validations
  switch (config.type) {
    case "stripe":
      if (!config.options.publishableKey || !config.options.secretKey) {
        throw new Error(
          "Stripe requires publishableKey and secretKey in options",
        );
      }
      break;

    // NOTE: Validation for unimplemented providers - uncomment when ready
    // case "paddle":
    //   if (!config.options.vendorId || !config.options.apiKey) {
    //     throw new Error("Paddle requires vendorId and apiKey in options");
    //   }
    //   break;

    // case "lemonsqueezy":
    //   if (!config.options.apiKey) {
    //     throw new Error("LemonSqueezy requires apiKey in options");
    //   }
    //   break;

    default:
      throw new Error(`Unknown payment provider type: ${config.type}`);
  }

  return true;
};

// Builder pattern for easy configuration
export class PaymentConfigBuilder {
  private config: Partial<IPaymentProviderConfig> = {};

  static create(): PaymentConfigBuilder {
    return new PaymentConfigBuilder();
  }

  useStripe(
    publishableKey: string,
    secretKey: string,
    webhookSecret?: string,
  ): this {
    this.config = {
      type: "stripe",
      options: { publishableKey, secretKey, webhookSecret },
    };
    return this;
  }

  // NOTE: Builder methods for unimplemented providers - uncomment when ready
  // usePaddle(vendorId: string, apiKey: string, publicKey?: string): this {
  //   this.config = {
  //     type: "paddle",
  //     options: { vendorId, apiKey, publicKey },
  //   };
  //   return this;
  // }

  // useLemonSqueezy(apiKey: string, storeId?: string): this {
  //   this.config = {
  //     type: "lemonsqueezy",
  //     options: { apiKey, storeId },
  //   };
  //   return this;
  // }

  withCustomOptions(options: Record<string, any>): this {
    this.config.options = { ...this.config.options, ...options };
    return this;
  }

  build(): IPaymentProviderConfig {
    if (!this.config.type || !this.config.options) {
      throw new Error("Payment configuration is incomplete");
    }

    const config = this.config as IPaymentProviderConfig;
    validatePaymentConfig(config);
    return config;
  }
}

// Preset configurations for common scenarios
export const createPaymentConfig = {
  stripe: (publishableKey: string, secretKey: string, webhookSecret?: string) =>
    PaymentConfigBuilder.create()
      .useStripe(publishableKey, secretKey, webhookSecret)
      .build(),

  // NOTE: Presets for unimplemented providers - uncomment when ready
  // paddle: (vendorId: string, apiKey: string, publicKey?: string) =>
  //   PaymentConfigBuilder.create()
  //     .usePaddle(vendorId, apiKey, publicKey)
  //     .build(),

  // lemonsqueezy: (apiKey: string, storeId?: string) =>
  //   PaymentConfigBuilder.create().useLemonSqueezy(apiKey, storeId).build(),
};
