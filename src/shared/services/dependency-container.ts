// Simple dependency injection container
// Following Dependency Inversion principle

type ServiceFactory<T> = () => T;
type ServiceInstance<T> = T;

export interface IDependencyContainer {
  register<T>(key: string, factory: ServiceFactory<T>): void;
  registerSingleton<T>(key: string, factory: ServiceFactory<T>): void;
  resolve<T>(key: string): T;
  has(key: string): boolean;
}

// Single Responsibility - only manages service dependencies
export class DependencyContainer implements IDependencyContainer {
  private services = new Map<string, ServiceFactory<unknown>>();
  private singletons = new Map<string, ServiceInstance<unknown>>();
  private singletonFactories = new Map<string, ServiceFactory<unknown>>();

  register<T>(key: string, factory: ServiceFactory<T>): void {
    this.services.set(key, factory);
  }

  registerSingleton<T>(key: string, factory: ServiceFactory<T>): void {
    this.singletonFactories.set(key, factory);
  }

  resolve<T>(key: string): T {
    // Check if it's a singleton
    if (this.singletonFactories.has(key)) {
      if (!this.singletons.has(key)) {
        const factory = this.singletonFactories.get(key)!;
        const instance = factory();
        this.singletons.set(key, instance);
      }
      return this.singletons.get(key)!;
    }

    // Check if it's a regular service
    if (this.services.has(key)) {
      const factory = this.services.get(key)!;
      return factory();
    }

    throw new Error(`Service '${key}' not registered`);
  }

  has(key: string): boolean {
    return this.services.has(key) || this.singletonFactories.has(key);
  }
}

// Global container instance
const globalContainer = new DependencyContainer();

// Service keys - centralized and type-safe
export const SERVICE_KEYS = {
  SUPABASE: "supabase",
  VALIDATION: "validation",
  API: "api",
  STORAGE: "storage",
} as const;

// Helper functions for easier usage
export const registerService = <T>(
  key: string,
  factory: ServiceFactory<T>,
): void => {
  globalContainer.register(key, factory);
};

export const registerSingleton = <T>(
  key: string,
  factory: ServiceFactory<T>,
): void => {
  globalContainer.registerSingleton(key, factory);
};

export const resolveService = <T>(key: string): T => {
  return globalContainer.resolve<T>(key);
};

export const hasService = (key: string): boolean => {
  return globalContainer.has(key);
};

export { globalContainer as container };
