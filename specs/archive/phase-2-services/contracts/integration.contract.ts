/**
 * Integration Contract
 *
 * This contract defines how ApiService and StorageService integrate
 * with the existing Next.js SOLID architecture, including dependency
 * injection, service registration, and inter-service communication.
 */

import type { IApiServiceContract } from "./api-service.contract";
import type { IStorageServiceContract } from "./storage-service.contract";
import { ApiError, NetworkError } from "./api-service.contract";
import {
  StorageError,
  StorageQuotaError,
  EncryptionError,
} from "./storage-service.contract";
import type { ApiRequest } from "./api-service.contract";

// Type aliases for services
type IApiService = IApiServiceContract;
type IStorageService = IStorageServiceContract;

// Note: ISupabaseService, IValidationService, and StorageProviderType
// are defined at the bottom of this file as exports (TypeScript handles forward references)

// ===========================================
// DEPENDENCY INJECTION CONTRACT
// ===========================================

/**
 * Service registration requirements
 * @contract Must integrate with existing dependency container
 * @contract Must follow singleton pattern for stateful services
 * @contract Must support factory pattern for service creation
 */
export interface ServiceRegistrationContract {
  /** Register ApiService in dependency container */
  registerApiService(container: IDependencyContainer): void;

  /** Register StorageService in dependency container */
  registerStorageService(container: IDependencyContainer): void;

  /** Validate service dependencies before registration */
  validateDependencies(container: IDependencyContainer): void;

  /** Setup service initialization order */
  getInitializationOrder(): string[];
}

/**
 * Service keys for dependency resolution
 * @contract Must extend existing SERVICE_KEYS constant
 * @contract Must use string literal types
 */
export interface ServiceKeysContract {
  readonly SUPABASE: "supabase";
  readonly VALIDATION: "validation";
  readonly API: "api";
  readonly STORAGE: "storage";
}

/**
 * Service dependencies definition
 * @contract ApiService depends on Supabase and Validation services
 * @contract StorageService depends only on Supabase service
 */
export interface ServiceDependenciesContract {
  apiService: {
    supabaseService: ISupabaseService;
    validationService: IValidationService;
  };

  storageService: {
    supabaseService: ISupabaseService;
  };
}

// ===========================================
// EXISTING SERVICE INTEGRATION CONTRACT
// ===========================================

/**
 * Supabase service integration
 * @contract Must use existing ISupabaseService interface
 * @contract Must access auth tokens through established patterns
 * @contract Must handle auth state changes appropriately
 */
export interface SupabaseIntegrationContract {
  /** Get current authentication token */
  getAuthToken(): Promise<string | null>;

  /** Get Supabase client instance */
  getClient(): any;

  /** Subscribe to auth state changes */
  onAuthStateChange(callback: (event: AuthEvent) => void): () => void;

  /** Check if user is authenticated */
  isAuthenticated(): Promise<boolean>;
}

/**
 * Validation service integration
 * @contract Must use existing IValidationService interface
 * @contract Must validate requests using Zod schemas
 * @contract Must handle validation errors consistently
 */
export interface ValidationIntegrationContract {
  /** Validate API request data */
  validateApiRequest(data: unknown): Promise<void>;

  /** Validate storage data */
  validateStorageData(data: unknown): Promise<void>;

  /** Get validation schema for type */
  getSchema(type: string): unknown;

  /** Create custom validation rules */
  createValidator(schema: unknown): (data: unknown) => Promise<void>;
}

// ===========================================
// DOMAIN SERVICE INTEGRATION CONTRACT
// ===========================================

/**
 * Domain service usage patterns
 * @contract Domain services must access new services via dependency injection
 * @contract Must maintain existing BaseService patterns
 * @contract Must support service composition
 */
export interface DomainServiceIntegrationContract {
  /** Example: UserService integration pattern */
  userServiceIntegration: {
    /** Upload user avatar using StorageService */
    uploadAvatar(userId: string, file: File): Promise<string>;

    /** Sync user data using ApiService */
    syncWithExternalApi(userId: string): Promise<void>;

    /** Cache user preferences using StorageService */
    cachePreferences(
      userId: string,
      preferences: UserPreferences,
    ): Promise<void>;
  };

  /** Example: ProductService integration pattern */
  productServiceIntegration: {
    /** Fetch product data from external API */
    fetchFromExternalCatalog(productId: string): Promise<Product>;

    /** Cache product images using StorageService */
    cacheProductImages(productId: string, images: File[]): Promise<string[]>;

    /** Store user's viewed products locally */
    trackProductView(userId: string, productId: string): Promise<void>;
  };
}

// ===========================================
// PROVIDER PATTERN INTEGRATION CONTRACT
// ===========================================

/**
 * Provider factory integration
 * @contract Must follow existing provider factory patterns
 * @contract Must support multiple implementations
 * @contract Must be extensible for future providers
 */
export interface ProviderFactoryIntegrationContract {
  /** API provider factory pattern */
  apiProviderFactory: {
    /** Register Fetch provider (default) */
    registerFetchProvider(): void;

    /** Register Axios provider (optional) */
    registerAxiosProvider(): void;

    /** Create provider instance */
    createProvider(type: "fetch" | "axios"): IApiService;
  };

  /** Storage provider factory pattern */
  storageProviderFactory: {
    /** Register localStorage provider (default) */
    registerLocalStorageProvider(): void;

    /** Register sessionStorage provider */
    registerSessionStorageProvider(): void;

    /** Register memory provider (testing) */
    registerMemoryProvider(): void;

    /** Create provider instance */
    createProvider(type: StorageProviderType): IStorageService;
  };
}

// ===========================================
// ERROR HANDLING INTEGRATION CONTRACT
// ===========================================

/**
 * Error handling integration
 * @contract Must extend existing error handling patterns
 * @contract Must integrate with validation errors
 * @contract Must provide consistent error formats
 */
export interface ErrorHandlingIntegrationContract {
  /** API error integration */
  apiErrorHandling: {
    /** Handle authentication errors */
    handleAuthError(error: ApiError): Promise<void>;

    /** Handle validation errors */
    handleValidationError(error: ValidationError): Promise<void>;

    /** Handle network errors */
    handleNetworkError(error: NetworkError): Promise<void>;
  };

  /** Storage error integration */
  storageErrorHandling: {
    /** Handle quota exceeded errors */
    handleQuotaError(error: StorageQuotaError): Promise<void>;

    /** Handle encryption errors */
    handleEncryptionError(error: EncryptionError): Promise<void>;

    /** Handle cross-tab sync errors */
    handleSyncError(error: SyncError): Promise<void>;
  };
}

// ===========================================
// CONTEXT PROVIDER INTEGRATION CONTRACT
// ===========================================

/**
 * React context provider integration
 * @contract Must integrate with existing provider hierarchy
 * @contract Must support server-side rendering
 * @contract Must handle hydration correctly
 */
export interface ContextIntegrationContract {
  /** Root provider integration */
  rootProviderIntegration: {
    /** Include new services in root provider setup */
    setupServices(): void;

    /** Initialize services for SSR */
    initializeSSR(): Promise<void>;

    /** Handle client-side hydration */
    handleHydration(): void;
  };

  /** Service-specific providers */
  serviceProviders: {
    /** Optional API service provider for configuration */
    apiServiceProvider?: React.ComponentType<{ children: React.ReactNode }>;

    /** Optional storage service provider for configuration */
    storageServiceProvider?: React.ComponentType<{ children: React.ReactNode }>;
  };
}

// ===========================================
// TESTING INTEGRATION CONTRACT
// ===========================================

/**
 * Testing framework integration
 * @contract Must integrate with existing Jest setup
 * @contract Must support mocking patterns
 * @contract Must provide test utilities
 */
export interface TestingIntegrationContract {
  /** Service mocking patterns */
  serviceMocking: {
    /** Mock ApiService for tests */
    mockApiService(): MockApiService;

    /** Mock StorageService for tests */
    mockStorageService(): MockStorageService;

    /** Mock service dependencies */
    mockDependencies(): MockDependencies;
  };

  /** Test utilities */
  testUtilities: {
    /** Create test container with mocked services */
    createTestContainer(): TestContainer;

    /** Setup test environment */
    setupTestEnvironment(): void;

    /** Cleanup test environment */
    cleanupTestEnvironment(): void;
  };
}

// ===========================================
// TYPE SAFETY INTEGRATION CONTRACT
// ===========================================

/**
 * TypeScript integration requirements
 * @contract Must provide full type safety
 * @contract Must integrate with existing type system
 * @contract Must support generic type inference
 */
export interface TypeSafetyIntegrationContract {
  /** Service type exports */
  serviceTypes: {
    /** Export all API service types */
    apiServiceTypes: IApiServiceTypes;

    /** Export all storage service types */
    storageServiceTypes: IStorageServiceTypes;

    /** Export integration types */
    integrationTypes: IIntegrationTypes;
  };

  /** Type guards and utilities */
  typeUtilities: {
    /** Type guard for API errors */
    isApiError(error: unknown): error is ApiError;

    /** Type guard for storage errors */
    isStorageError(error: unknown): error is StorageError;

    /** Type guard for validation errors */
    isValidationError(error: unknown): error is ValidationError;
  };
}

// ===========================================
// PERFORMANCE INTEGRATION CONTRACT
// ===========================================

/**
 * Performance optimization integration
 * @contract Must not degrade existing performance
 * @contract Must leverage Next.js optimizations
 * @contract Must support performance monitoring
 */
export interface PerformanceIntegrationContract {
  /** Performance monitoring */
  performanceMonitoring: {
    /** Track API request performance */
    trackApiPerformance(request: ApiRequest, duration: number): void;

    /** Track storage operation performance */
    trackStoragePerformance(operation: string, duration: number): void;

    /** Generate performance reports */
    generatePerformanceReport(): PerformanceReport;
  };

  /** Optimization strategies */
  optimizations: {
    /** Request deduplication */
    deduplicateRequests: boolean;

    /** Response caching */
    enableResponseCaching: boolean;

    /** Storage compression */
    enableStorageCompression: boolean;
  };
}

// ===========================================
// EXPORT INTEGRATION CONTRACT
// ===========================================

/**
 * Module export integration
 * @contract Must update main service exports
 * @contract Must maintain backward compatibility
 * @contract Must provide clear public API
 */
export interface ExportIntegrationContract {
  /** Main service exports update */
  mainExports: {
    /** Add to src/shared/services/index.ts */
    apiServiceExports: string[];

    /** Add to src/shared/services/index.ts */
    storageServiceExports: string[];

    /** Update SERVICE_KEYS export */
    updatedServiceKeys: ServiceKeysContract;
  };

  /** Type exports update */
  typeExports: {
    /** Export API service types */
    apiTypes: string[];

    /** Export storage service types */
    storageTypes: string[];

    /** Export integration types */
    integrationTypes: string[];
  };
}

// ===========================================
// SUPPORTING TYPE DEFINITIONS
// ===========================================

export interface AuthEvent {
  event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED";
  session: any;
}

export interface UserPreferences {
  theme: string;
  language: string;
  notifications: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface PerformanceReport {
  apiMetrics: {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
  };
  storageMetrics: {
    averageOperationTime: number;
    totalOperations: number;
    storageUsage: number;
  };
}

export interface MockApiService {
  mockGet: jest.Mock;
  mockPost: jest.Mock;
  mockPut: jest.Mock;
  mockDelete: jest.Mock;
}

export interface MockStorageService {
  mockSet: jest.Mock;
  mockGet: jest.Mock;
  mockRemove: jest.Mock;
  mockClear: jest.Mock;
}

export interface MockDependencies {
  mockSupabaseService: jest.Mock;
  mockValidationService: jest.Mock;
}

export interface TestContainer {
  resolve<T>(key: string): T;
  register(key: string, mock: unknown): void;
  cleanup(): void;
}

export interface IApiServiceTypes {
  IApiService: any;
  ApiRequest: any;
  ApiResponse: any;
  ApiError: any;
}

export interface IStorageServiceTypes {
  IStorageService: any;
  StorageOptions: any;
  StorageEvent: any;
  StorageError: any;
}

export interface IIntegrationTypes {
  ServiceDependencies: any;
  ServiceKeys: any;
  ProviderTypes: any;
}

// Re-export existing types
export interface ISupabaseService {
  getClient(): any;
}

export interface IValidationService {
  validate(schema: unknown, data: unknown): Promise<void>;
}

export interface IDependencyContainer {
  register(key: string, factory: () => unknown): void;
  resolve<T>(key: string): T;
  has(key: string): boolean;
}

export interface ValidationError extends Error {
  code: string;
  details: unknown;
}

export interface SyncError extends Error {
  code: string;
  tabId: string;
}

export type StorageProviderType =
  | "localStorage"
  | "sessionStorage"
  | "memory"
  | "cookie";
