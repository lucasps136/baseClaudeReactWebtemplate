# Data Model: ApiService and StorageService

**Date**: 2025-09-17
**Status**: Phase 1 - Design Complete
**Services**: ApiService, StorageService

## Overview

This document defines the data models, interfaces, and types for the missing services in Phase 2.2 of the Next.js SOLID boilerplate. Both services follow the established architectural patterns and integrate seamlessly with existing services.

## ApiService Data Model

### Core Interfaces

#### IApiService - Main Service Interface

```typescript
export interface IApiService {
  // Core HTTP methods
  get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>>;
  put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>>;
  patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;

  // Low-level request method
  request<T>(request: ApiRequest): Promise<ApiResponse<T>>;

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): string;
  addResponseInterceptor(interceptor: ResponseInterceptor): string;
  removeInterceptor(id: string): void;
}
```

#### Configuration Types

```typescript
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  validateStatus?: (status: number) => boolean;
}

export interface ApiRequest {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
  cache?: RequestCache;
  credentials?: RequestCredentials;
}

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";
```

#### Response Types

```typescript
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: ApiRequest;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
  statusText: string;
  details?: unknown;
}
```

#### Interceptor Types

```typescript
export type RequestInterceptor = (
  request: ApiRequest,
) => ApiRequest | Promise<ApiRequest>;

export type ResponseInterceptor = {
  onFulfilled?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;
  onRejected?: (error: ApiError) => ApiError | Promise<ApiError>;
};

export interface InterceptorConfig {
  id: string;
  type: "request" | "response";
  handler: RequestInterceptor | ResponseInterceptor;
}
```

#### Error Types

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: ApiErrorResponse,
    public request?: ApiRequest,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, request?: ApiRequest) {
    super(message, 0, "Network Error", undefined, request);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends ApiError {
  constructor(timeout: number, request?: ApiRequest) {
    super(
      `Request timeout after ${timeout}ms`,
      0,
      "Timeout",
      undefined,
      request,
    );
    this.name = "TimeoutError";
  }
}
```

### Provider Types

```typescript
export type ApiProviderType = "fetch" | "axios";

export interface ApiProviderConfig {
  type: ApiProviderType;
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  validateStatus?: (status: number) => boolean;
}

export interface IApiProvider {
  request<T>(request: ApiRequest): Promise<ApiResponse<T>>;
  createInstance(config: ApiProviderConfig): IApiProvider;
}
```

## StorageService Data Model

### Core Interfaces

#### IStorageService - Main Service Interface

```typescript
export interface IStorageService {
  // Basic storage operations
  set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
  get<T>(key: string, defaultValue?: T): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;

  // Secure storage operations
  setSecure<T>(
    key: string,
    value: T,
    options?: SecureStorageOptions,
  ): Promise<void>;
  getSecure<T>(key: string, defaultValue?: T): Promise<T | null>;

  // Storage events
  subscribe(callback: StorageEventCallback): () => void;

  // Quota management
  getUsage(): Promise<StorageUsage>;
  cleanup(strategy?: CleanupStrategy): Promise<void>;
}
```

#### Storage Configuration

```typescript
export interface StorageOptions {
  provider?: StorageProviderType;
  ttl?: number; // Time to live in milliseconds
  compress?: boolean;
  sync?: boolean; // Cross-tab synchronization
}

export interface SecureStorageOptions extends StorageOptions {
  encrypt?: boolean;
  keyId?: string;
}

export type StorageProviderType =
  | "localStorage"
  | "sessionStorage"
  | "memory"
  | "cookie";
```

#### Storage Data Types

```typescript
export interface StorageItem<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
  compressed?: boolean;
  encrypted?: boolean;
}

export interface SecureStorageItem {
  data: string; // encrypted data
  iv: string; // initialization vector
  timestamp: number;
  ttl?: number;
  keyId?: string;
}

export interface StorageUsage {
  used: number; // bytes used
  quota: number; // total quota
  percentage: number; // usage percentage
  provider: StorageProviderType;
}
```

#### Storage Events

```typescript
export interface StorageEvent<T = unknown> {
  key: string;
  oldValue: T | null;
  newValue: T | null;
  timestamp: number;
  provider: StorageProviderType;
  source: "local" | "remote"; // Local change or cross-tab sync
}

export type StorageEventCallback = <T>(event: StorageEvent<T>) => void;

export interface CrossTabMessage<T = unknown> {
  type: "storage-change";
  key: string;
  value: T | null;
  timestamp: number;
  signature?: string;
}
```

#### Cleanup and Quota

```typescript
export interface CleanupStrategy {
  type: "lru" | "ttl" | "percentage" | "manual";
  maxAge?: number; // For TTL strategy
  maxItems?: number; // For LRU strategy
  targetPercentage?: number; // For percentage strategy
  keysToRemove?: string[]; // For manual strategy
}

export interface StorageProvider {
  setItem(key: string, value: string): void | Promise<void>;
  getItem(key: string): string | null | Promise<string | null>;
  removeItem(key: string): void | Promise<void>;
  clear(): void | Promise<void>;
  keys(): string[] | Promise<string[]>;
  getUsage(): StorageUsage | Promise<StorageUsage>;
}
```

#### Encryption Types

```typescript
export interface EncryptionConfig {
  algorithm: "AES-GCM";
  keyLength: 256;
  ivLength: 12;
  tagLength: 16;
}

export interface EncryptedData {
  data: string;
  iv: string;
  keyId?: string;
}

export interface IEncryptionService {
  encrypt(data: string, keyId?: string): Promise<EncryptedData>;
  decrypt(encryptedData: EncryptedData, keyId?: string): Promise<string>;
  generateKey(keyId: string): Promise<CryptoKey>;
  getKey(keyId: string): Promise<CryptoKey | null>;
}
```

#### Error Types

```typescript
export class StorageError extends Error {
  constructor(
    message: string,
    public code?: string,
    public provider?: StorageProviderType,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export class StorageQuotaError extends StorageError {
  constructor(used: number, quota: number, provider: StorageProviderType) {
    super(`Storage quota exceeded: ${used}/${quota} bytes`);
    this.code = "QUOTA_EXCEEDED";
    this.provider = provider;
  }
}

export class EncryptionError extends StorageError {
  constructor(message: string, operation: "encrypt" | "decrypt") {
    super(`Encryption ${operation} failed: ${message}`);
    this.code = `ENCRYPTION_${operation.toUpperCase()}_FAILED`;
  }
}
```

## Integration Interfaces

### Dependency Injection

```typescript
export interface ServiceDependencies {
  supabaseService: ISupabaseService;
  validationService: IValidationService;
}

export interface ApiServiceFactory {
  (dependencies: ServiceDependencies): IApiService;
}

export interface StorageServiceFactory {
  (dependencies: Pick<ServiceDependencies, "supabaseService">): IStorageService;
}
```

### Service Registration

```typescript
export interface ServiceRegistration {
  key: string;
  factory: () => unknown;
  singleton?: boolean;
}

export const SERVICE_KEYS = {
  SUPABASE: "supabase",
  VALIDATION: "validation",
  API: "api",
  STORAGE: "storage",
} as const;

export type ServiceKey = (typeof SERVICE_KEYS)[keyof typeof SERVICE_KEYS];
```

## Validation Schemas

### ApiService Validation

```typescript
import { z } from "zod";

export const apiRequestSchema = z.object({
  url: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
  timeout: z.number().positive().optional(),
});

export const requestConfigSchema = z.object({
  headers: z.record(z.string()).optional(),
  timeout: z.number().positive().max(60000).optional(),
  validateStatus: z.function().optional(),
});
```

### StorageService Validation

```typescript
export const storageOptionsSchema = z.object({
  provider: z
    .enum(["localStorage", "sessionStorage", "memory", "cookie"])
    .optional(),
  ttl: z.number().positive().optional(),
  compress: z.boolean().optional(),
  sync: z.boolean().optional(),
});

export const secureStorageOptionsSchema = storageOptionsSchema.extend({
  encrypt: z.boolean().optional(),
  keyId: z.string().optional(),
});

export const cleanupStrategySchema = z.object({
  type: z.enum(["lru", "ttl", "percentage", "manual"]),
  maxAge: z.number().positive().optional(),
  maxItems: z.number().positive().optional(),
  targetPercentage: z.number().min(0).max(100).optional(),
  keysToRemove: z.array(z.string()).optional(),
});
```

## Entity Relationships

### Service Dependencies

```
ApiService
├── depends on: ISupabaseService (auth tokens)
├── depends on: IValidationService (request validation)
└── provides: HTTP client abstraction

StorageService
├── depends on: ISupabaseService (session management)
├── uses: Web Crypto API (encryption)
├── uses: BroadcastChannel API (cross-tab sync)
└── provides: Secure storage abstraction

Both Services
├── registered in: DependencyContainer
├── exported from: shared/services/index.ts
└── used by: Domain services (UserService, etc.)
```

### Data Flow

```
Client Request → ApiService → Interceptors → Fetch → Supabase Auth → External API
Client Data → StorageService → Encryption → localStorage/sessionStorage → Cross-tab Sync
```

## State Transitions

### ApiService Request Lifecycle

```
Request Created → Request Interceptors → Validation → Auth Token Injection →
HTTP Request → Response Received → Response Interceptors →
Error Handling → Response Returned
```

### StorageService Data Lifecycle

```
Data Input → Validation → Encryption (if secure) → Serialization →
Storage Provider → Cross-tab Broadcast → Event Notification →
TTL Management → Cleanup (if needed)
```

## Performance Considerations

### ApiService

- Request timeout: 30s default
- Concurrent requests: Unlimited (controlled by browser)
- Response caching: Leverages Next.js native caching
- Memory usage: Minimal (native Fetch API)

### StorageService

- Operation latency: <100ms target
- Storage quota: 5-10MB typical browser limit
- Encryption overhead: ~10-20% performance impact
- Cross-tab sync: <50ms message propagation

---

**Data Model Complete** ✅
All interfaces, types, and relationships defined. Ready for contract generation and implementation.
