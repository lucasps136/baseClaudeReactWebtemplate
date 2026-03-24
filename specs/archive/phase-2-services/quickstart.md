# Quickstart Guide: ApiService and StorageService

**Date**: 2025-09-17
**Status**: Phase 1 - Design Complete
**Purpose**: Practical usage examples and integration scenarios

## Overview

This quickstart guide provides hands-on examples for using the new ApiService and StorageService in the Next.js SOLID boilerplate. These examples demonstrate real-world usage patterns, integration with existing services, and best practices.

## Prerequisites

- Next.js 14+ project with SOLID architecture
- Existing AuthService (Supabase) configured
- ValidationService available
- Dependency injection container setup

## Quick Setup

### 1. Service Registration

```typescript
// src/shared/services/setup.ts
import {
  SERVICE_KEYS,
  registerSingleton,
  resolveService,
} from "./dependency-container";
import { createApiService } from "./api/api.service";
import { createStorageService } from "./storage/storage.service";

export const setupServices = () => {
  // ... existing service registrations ...

  // Register ApiService
  registerSingleton(SERVICE_KEYS.API, () => {
    const supabaseService = resolveService<ISupabaseService>(
      SERVICE_KEYS.SUPABASE,
    );
    const validationService = resolveService<IValidationService>(
      SERVICE_KEYS.VALIDATION,
    );
    return createApiService(supabaseService, validationService);
  });

  // Register StorageService
  registerSingleton(SERVICE_KEYS.STORAGE, () => {
    const supabaseService = resolveService<ISupabaseService>(
      SERVICE_KEYS.SUPABASE,
    );
    return createStorageService(supabaseService);
  });
};
```

### 2. Service Keys Update

```typescript
// src/shared/services/dependency-container.ts
export const SERVICE_KEYS = {
  SUPABASE: "supabase",
  VALIDATION: "validation",
  API: "api", // New
  STORAGE: "storage", // New
} as const;
```

## ApiService Usage Examples

### Basic HTTP Operations

```typescript
// src/features/users/services/user.service.ts
import { resolveService, SERVICE_KEYS } from "@/shared/services";
import type { IApiService } from "@/shared/services";

export class UserService {
  private apiService = resolveService<IApiService>(SERVICE_KEYS.API);

  // GET request with type safety
  async getUser(userId: string): Promise<User> {
    const response = await this.apiService.get<User>(`/api/users/${userId}`);
    return response.data;
  }

  // POST request with data
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.apiService.post<User>("/api/users", userData);
    return response.data;
  }

  // PUT request with authentication (automatic)
  async updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
    const response = await this.apiService.put<User>(
      `/api/users/${userId}`,
      updates,
    );
    return response.data;
  }

  // DELETE request
  async deleteUser(userId: string): Promise<void> {
    await this.apiService.delete(`/api/users/${userId}`);
  }
}
```

### Advanced Request Configuration

```typescript
// Custom headers and timeout
async function fetchProtectedData(token: string) {
  const apiService = resolveService<IApiService>(SERVICE_KEYS.API);

  const response = await apiService.get<ProtectedData>("/api/protected", {
    headers: {
      "X-Custom-Header": "custom-value",
      "X-Request-ID": crypto.randomUUID(),
    },
    timeout: 10000, // 10 seconds
    validateStatus: (status) => status < 500, // Accept 4xx as valid
  });

  return response.data;
}

// File upload with progress
async function uploadUserAvatar(file: File, userId: string) {
  const apiService = resolveService<IApiService>(SERVICE_KEYS.API);

  const formData = new FormData();
  formData.append("avatar", file);
  formData.append("userId", userId);

  const response = await apiService.post<{ avatarUrl: string }>(
    "/api/upload/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 seconds for file upload
    },
  );

  return response.data.avatarUrl;
}
```

### Request and Response Interceptors

```typescript
// src/features/analytics/services/analytics.service.ts
export class AnalyticsService {
  private apiService = resolveService<IApiService>(SERVICE_KEYS.API);

  setupInterceptors() {
    // Request interceptor for analytics tracking
    this.apiService.addRequestInterceptor((request) => {
      console.log(`API Request: ${request.method} ${request.url}`);

      return {
        ...request,
        headers: {
          ...request.headers,
          "X-Request-Timestamp": new Date().toISOString(),
          "X-Request-ID": crypto.randomUUID(),
        },
      };
    });

    // Response interceptor for error logging
    this.apiService.addResponseInterceptor({
      onFulfilled: (response) => {
        console.log(
          `API Response: ${response.status} - ${response.config.url}`,
        );
        return response;
      },
      onRejected: (error) => {
        console.error(`API Error: ${error.status} - ${error.message}`);

        // Send error to analytics
        this.trackApiError(error);

        return error;
      },
    });
  }

  private trackApiError(error: ApiError) {
    // Implementation for error tracking
  }
}
```

### Error Handling Patterns

```typescript
// src/features/products/services/product.service.ts
export class ProductService {
  private apiService = resolveService<IApiService>(SERVICE_KEYS.API);

  async getProduct(productId: string): Promise<Product | null> {
    try {
      const response = await this.apiService.get<Product>(
        `/api/products/${productId}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return null; // Product not found
        }

        if (error.status >= 500) {
          // Server error - retry logic or fallback
          throw new Error("Service temporarily unavailable");
        }

        // Client error - validation or permission issue
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      if (error instanceof NetworkError) {
        throw new Error("Network connection failed");
      }

      if (error instanceof TimeoutError) {
        throw new Error("Request timed out");
      }

      throw error;
    }
  }
}
```

## StorageService Usage Examples

### Basic Storage Operations

```typescript
// src/features/settings/services/settings.service.ts
export class SettingsService {
  private storageService = resolveService<IStorageService>(
    SERVICE_KEYS.STORAGE,
  );

  // Store user preferences
  async saveUserPreferences(
    userId: string,
    preferences: UserPreferences,
  ): Promise<void> {
    await this.storageService.set(`user-preferences-${userId}`, preferences, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      sync: true, // Sync across tabs
    });
  }

  // Retrieve user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const defaultPreferences: UserPreferences = {
      theme: "light",
      language: "en",
      notifications: true,
    };

    return await this.storageService.get(
      `user-preferences-${userId}`,
      defaultPreferences,
    );
  }

  // Cache API responses
  async cacheApiResponse<T>(
    cacheKey: string,
    data: T,
    ttlMinutes: number = 60,
  ): Promise<void> {
    await this.storageService.set(cacheKey, data, {
      ttl: ttlMinutes * 60 * 1000,
      compress: true, // Compress large responses
    });
  }

  // Get cached data with freshness check
  async getCachedData<T>(cacheKey: string): Promise<T | null> {
    return await this.storageService.get<T>(cacheKey);
  }
}
```

### Secure Storage for Sensitive Data

```typescript
// src/features/auth/services/token-storage.service.ts
export class TokenStorageService {
  private storageService = resolveService<IStorageService>(
    SERVICE_KEYS.STORAGE,
  );

  // Store authentication tokens securely
  async storeTokens(tokens: AuthTokens): Promise<void> {
    await this.storageService.setSecure("auth-tokens", tokens, {
      encrypt: true,
      provider: "sessionStorage", // More secure than localStorage
      keyId: "auth-v1",
    });
  }

  // Retrieve tokens securely
  async getTokens(): Promise<AuthTokens | null> {
    return await this.storageService.getSecure<AuthTokens>("auth-tokens");
  }

  // Store sensitive user data
  async storeEncryptedUserData(
    userId: string,
    sensitiveData: SensitiveUserData,
  ): Promise<void> {
    await this.storageService.setSecure(`sensitive-${userId}`, sensitiveData, {
      encrypt: true,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      keyId: `user-${userId}-v1`,
    });
  }

  // Clear all sensitive data
  async clearSensitiveData(): Promise<void> {
    const keys = await this.storageService.keys();
    const sensitiveKeys = keys.filter(
      (key) => key.startsWith("auth-") || key.startsWith("sensitive-"),
    );

    for (const key of sensitiveKeys) {
      await this.storageService.remove(key);
    }
  }
}
```

### Cross-Tab Synchronization

```typescript
// src/features/cart/services/cart-sync.service.ts
export class CartSyncService {
  private storageService = resolveService<IStorageService>(
    SERVICE_KEYS.STORAGE,
  );

  setupCartSync() {
    // Subscribe to storage changes
    return this.storageService.subscribe((event) => {
      if (event.key === "shopping-cart" && event.source === "remote") {
        // Another tab updated the cart
        this.onCartUpdatedFromAnotherTab(event.newValue);
      }
    });
  }

  async updateCart(cart: ShoppingCart): Promise<void> {
    await this.storageService.set("shopping-cart", cart, {
      sync: true, // Enable cross-tab synchronization
    });
  }

  private onCartUpdatedFromAnotherTab(newCart: ShoppingCart | null) {
    // Update UI to reflect cart changes from another tab
    if (newCart) {
      this.updateCartUI(newCart);
      this.showNotification("Cart updated in another tab");
    }
  }

  private updateCartUI(cart: ShoppingCart) {
    // Implementation to update UI
  }

  private showNotification(message: string) {
    // Implementation to show notification
  }
}
```

### Storage Quota Management

```typescript
// src/features/cache/services/cache-manager.service.ts
export class CacheManagerService {
  private storageService = resolveService<IStorageService>(
    SERVICE_KEYS.STORAGE,
  );

  async manageStorageQuota(): Promise<void> {
    const usage = await this.storageService.getUsage();

    if (usage.percentage > 80) {
      console.warn(`Storage usage high: ${usage.percentage}%`);

      // Cleanup old cache entries
      await this.storageService.cleanup({
        type: "ttl",
        maxAge: 24 * 60 * 60 * 1000, // Remove items older than 24 hours
      });
    }

    if (usage.percentage > 90) {
      console.warn("Storage usage critical, performing LRU cleanup");

      // More aggressive cleanup
      await this.storageService.cleanup({
        type: "lru",
        maxItems: 100, // Keep only 100 most recent items
      });
    }
  }

  async optimizeStorage(): Promise<void> {
    // Remove expired items
    await this.storageService.cleanup({ type: "ttl" });

    // Compress large items
    const keys = await this.storageService.keys();
    for (const key of keys) {
      const data = await this.storageService.get(key);
      if (data && JSON.stringify(data).length > 10000) {
        // Re-store with compression
        await this.storageService.set(key, data, { compress: true });
      }
    }
  }
}
```

## Integration with Existing Services

### User Service Integration

```typescript
// src/features/users/services/user.service.ts - Enhanced version
export class UserService extends BaseService<
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilter
> {
  private apiService = resolveService<IApiService>(SERVICE_KEYS.API);
  private storageService = resolveService<IStorageService>(
    SERVICE_KEYS.STORAGE,
  );

  constructor(
    userRepository: IUserRepository,
    userValidation: IUserValidation,
  ) {
    super(userRepository, userValidation);
  }

  // Sync user data with external API
  async syncWithExternalApi(userId: string): Promise<void> {
    try {
      const externalData = await this.apiService.get<ExternalUserData>(
        `/external/users/${userId}`,
      );

      const mappedData = this.mapExternalData(externalData.data);
      await this.userRepository.update(userId, mappedData);

      // Cache the external data for offline access
      await this.storageService.set(
        `external-user-${userId}`,
        externalData.data,
        {
          ttl: 60 * 60 * 1000, // 1 hour
          compress: true,
        },
      );
    } catch (error) {
      console.error("Failed to sync with external API:", error);

      // Try to use cached data
      const cachedData = await this.storageService.get<ExternalUserData>(
        `external-user-${userId}`,
      );
      if (cachedData) {
        const mappedData = this.mapExternalData(cachedData);
        await this.userRepository.update(userId, mappedData);
      }
    }
  }

  // Upload and manage user avatar
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await this.apiService.post<{ url: string }>(
      `/api/users/${userId}/avatar`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      },
    );

    // Cache avatar URL locally
    await this.storageService.set(`user-avatar-${userId}`, response.data.url, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
    });

    return response.data.url;
  }

  private mapExternalData(externalData: ExternalUserData): UpdateUserInput {
    // Implementation for mapping external data to internal format
    return {
      name: externalData.fullName,
      email: externalData.emailAddress,
      // ... other mappings
    };
  }
}
```

### Component Usage in React

```typescript
// src/features/users/components/UserProfile.tsx
import React, { useState, useEffect } from 'react'
import { resolveService, SERVICE_KEYS } from '@/shared/services'

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  const apiService = resolveService<IApiService>(SERVICE_KEYS.API)
  const storageService = resolveService<IStorageService>(SERVICE_KEYS.STORAGE)

  useEffect(() => {
    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    try {
      setLoading(true)

      // Load user data and preferences in parallel
      const [userData, userPrefs] = await Promise.all([
        apiService.get<User>(`/api/users/${userId}`),
        storageService.get<UserPreferences>(`preferences-${userId}`)
      ])

      setUser(userData.data)
      setPreferences(userPrefs)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: UserPreferences) => {
    try {
      // Update in API and local storage
      await Promise.all([
        apiService.put(`/api/users/${userId}/preferences`, newPreferences),
        storageService.set(`preferences-${userId}`, newPreferences, {
          ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
          sync: true
        })
      ])

      setPreferences(newPreferences)
    } catch (error) {
      console.error('Failed to update preferences:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>{user?.name}</h1>
      <UserPreferencesForm
        preferences={preferences}
        onUpdate={updatePreferences}
      />
    </div>
  )
}
```

## Testing Examples

### Unit Testing Services

```typescript
// src/features/users/services/__tests__/user.service.test.ts
import { UserService } from "../user.service";
import {
  createMockApiService,
  createMockStorageService,
} from "@/shared/services/__mocks__";

describe("UserService", () => {
  let userService: UserService;
  let mockApiService: MockApiService;
  let mockStorageService: MockStorageService;

  beforeEach(() => {
    mockApiService = createMockApiService();
    mockStorageService = createMockStorageService();

    // Mock service resolution
    jest
      .spyOn(require("@/shared/services"), "resolveService")
      .mockImplementation((key) => {
        if (key === "api") return mockApiService;
        if (key === "storage") return mockStorageService;
        return null;
      });

    userService = new UserService(mockUserRepository, mockUserValidation);
  });

  test("should sync user data with external API", async () => {
    const userId = "user-123";
    const externalData = {
      fullName: "John Doe",
      emailAddress: "john@example.com",
    };

    mockApiService.get.mockResolvedValue({ data: externalData });

    await userService.syncWithExternalApi(userId);

    expect(mockApiService.get).toHaveBeenCalledWith("/external/users/user-123");
    expect(mockStorageService.set).toHaveBeenCalledWith(
      "external-user-user-123",
      externalData,
      expect.objectContaining({ ttl: 3600000, compress: true }),
    );
  });

  test("should use cached data when API fails", async () => {
    const userId = "user-123";
    const cachedData = {
      fullName: "Cached User",
      emailAddress: "cached@example.com",
    };

    mockApiService.get.mockRejectedValue(new Error("API Error"));
    mockStorageService.get.mockResolvedValue(cachedData);

    await userService.syncWithExternalApi(userId);

    expect(mockStorageService.get).toHaveBeenCalledWith(
      "external-user-user-123",
    );
  });
});
```

## Performance Optimization

### Request Deduplication

```typescript
// src/shared/services/api/request-deduplication.ts
export class RequestDeduplicationService {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicatedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
  ): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

// Usage in service
export class OptimizedUserService {
  private deduplicationService = new RequestDeduplicationService();
  private apiService = resolveService<IApiService>(SERVICE_KEYS.API);

  async getUser(userId: string): Promise<User> {
    const cacheKey = `user-${userId}`;

    return this.deduplicationService.deduplicatedRequest(cacheKey, async () => {
      const response = await this.apiService.get<User>(`/api/users/${userId}`);
      return response.data;
    });
  }
}
```

### Smart Caching Strategy

```typescript
// src/shared/services/cache/smart-cache.service.ts
export class SmartCacheService {
  private storageService = resolveService<IStorageService>(
    SERVICE_KEYS.STORAGE,
  );

  async getWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: {
      ttl?: number;
      refreshThreshold?: number; // Refresh if data is older than this
      backgroundRefresh?: boolean;
    } = {},
  ): Promise<T> {
    const cached = await this.storageService.get<CachedData<T>>(key);

    if (cached && !this.isExpired(cached, options.ttl)) {
      // Check if we should refresh in background
      if (
        options.backgroundRefresh &&
        this.shouldRefresh(cached, options.refreshThreshold)
      ) {
        this.refreshInBackground(key, fetchFn);
      }

      return cached.data;
    }

    // Data is expired or doesn't exist, fetch fresh data
    const freshData = await fetchFn();

    await this.storageService.set(
      key,
      {
        data: freshData,
        timestamp: Date.now(),
      },
      { ttl: options.ttl },
    );

    return freshData;
  }

  private isExpired<T>(cached: CachedData<T>, ttl?: number): boolean {
    if (!ttl) return false;
    return Date.now() - cached.timestamp > ttl;
  }

  private shouldRefresh<T>(cached: CachedData<T>, threshold?: number): boolean {
    if (!threshold) return false;
    return Date.now() - cached.timestamp > threshold;
  }

  private async refreshInBackground<T>(key: string, fetchFn: () => Promise<T>) {
    try {
      const freshData = await fetchFn();
      await this.storageService.set(key, {
        data: freshData,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn("Background refresh failed:", error);
    }
  }
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}
```

## Summary

This quickstart guide demonstrates practical usage patterns for the new ApiService and StorageService:

### ✅ **ApiService Features Covered**

- Basic HTTP operations with type safety
- Advanced request configuration
- Request/response interceptors
- Error handling patterns
- Authentication integration
- Performance optimization

### ✅ **StorageService Features Covered**

- Basic storage operations
- Secure encrypted storage
- Cross-tab synchronization
- Quota management and cleanup
- Integration with existing services
- Performance optimization

### ✅ **Integration Patterns**

- Service composition in domain services
- React component integration
- Testing strategies
- Error handling and fallbacks
- Performance optimization techniques

The services follow SOLID principles, integrate seamlessly with the existing architecture, and provide a foundation for building robust, scalable applications.

---

## Quality Validation Guide (Added: 2025-10-28)

### Running Quality Gates

Quality gates ensure code meets constitutional requirements before production.

#### 1. TypeScript Type Check (CRITICAL)

```bash
# Run type check
pnpm type-check

# Expected output: "Found 0 errors"
# Constitutional requirement: Zero TypeScript errors
```

**Troubleshooting TypeScript Errors**:

```bash
# Generate detailed error report
pnpm type-check 2> typescript-errors.log

# Common fixes:
# 1. Missing imports
import type { IApiService } from '@/shared/services/api'

# 2. Type annotations
const apiService: IApiService = resolveService(SERVICE_KEYS.API)

# 3. Generic types
const response = await apiService.get<User>('/api/users/123')
```

#### 2. ESLint Check (HIGH)

```bash
# Run linter
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix

# Expected: 0 errors (warnings acceptable with justification)
```

#### 3. Contract Tests (CRITICAL)

```bash
# Run all contract tests
pnpm test -- "**/*.contract.test.ts"

# Run specific service contracts
pnpm test -- api-service.contract.test.ts
pnpm test -- storage-service.contract.test.ts

# Expected: All tests passing
```

#### 4. Unit Tests (HIGH)

```bash
# Run all tests with coverage
pnpm test --coverage

# Expected:
# - All tests passing
# - Statements: > 80%
# - Branches: > 75%
# - Functions: > 80%
# - Lines: > 80%
```

#### 5. Performance Benchmarks (MEDIUM)

```typescript
// tests/performance/storage-benchmark.test.ts
import { performanceTest } from "@/shared/testing/performance";

describe("Storage Performance", () => {
  test("p95 latency < 100ms", async () => {
    const results = await performanceTest(
      async () => {
        await storageService.set("test-key", { data: "test" });
        await storageService.get("test-key");
      },
      { iterations: 100 },
    );

    expect(results.p95).toBeLessThan(100); // p95 < 100ms
  });
});
```

```bash
# Run performance tests
pnpm test -- performance
```

#### 6. Security Audit (CRITICAL)

```bash
# Check for hardcoded secrets
pnpm audit:secrets

# Run security audit
pnpm audit

# Check dependencies for vulnerabilities
pnpm audit --audit-level=moderate
```

**OWASP Top 10 Checklist**:

- [ ] A01: Broken Access Control - RLS enabled on all tables
- [ ] A02: Cryptographic Failures - Web Crypto API used for sensitive data
- [ ] A03: Injection - All inputs validated with Zod
- [ ] A04: Insecure Design - SOLID principles followed
- [ ] A05: Security Misconfiguration - Proper security headers
- [ ] A06: Vulnerable Components - Dependencies audited
- [ ] A07: Authentication Failures - Supabase Auth properly configured
- [ ] A08: Software/Data Integrity - No CDN without SRI
- [ ] A09: Logging/Monitoring - Structured logging in place
- [ ] A10: Server-Side Request Forgery - URL validation implemented

### Quality Gate Summary

Run all gates in sequence:

```bash
# 1. Type Check (must pass first)
pnpm type-check

# 2. Linter
pnpm lint

# 3. All Tests
pnpm test

# 4. Security Audit
pnpm audit

# Production deployment allowed only if all CRITICAL and HIGH gates pass
```

### Debugging Common Issues

#### TypeScript Errors

**Problem**: "Cannot find module" errors

```typescript
// Solution: Add to tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"]
    }
  }
}
```

**Problem**: Type incompatibility

```typescript
// Bad: Using 'any'
const data: any = await apiService.get("/api/users");

// Good: Using generics
const data = await apiService.get<User[]>("/api/users");
```

#### Storage Quota Exceeded

```typescript
// Monitor and cleanup storage
const usage = await storageService.getUsage();

if (usage.percentage > 80) {
  // Clean up expired items
  await storageService.cleanup({ type: "ttl" });

  // Remove old cached data
  await storageService.cleanup({
    type: "lru",
    maxItems: 100,
  });
}
```

#### Cross-Tab Sync Not Working

```typescript
// Ensure BroadcastChannel is supported
if (typeof BroadcastChannel === "undefined") {
  console.warn(
    "BroadcastChannel not supported, falling back to localStorage events",
  );
}

// Subscribe with error handling
const unsubscribe = storageService.subscribe((event) => {
  try {
    handleStorageUpdate(event);
  } catch (error) {
    console.error("Failed to handle storage update:", error);
  }
});
```

#### API Request Failures

```typescript
// Implement retry logic
const response = await apiService.get<User>("/api/users/123", {
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: "exponential",
  },
  timeout: 5000,
});

// Fallback to cached data
try {
  const response = await apiService.get<User>(`/api/users/${userId}`);
  return response.data;
} catch (error) {
  const cached = await storageService.get<User>(`user-${userId}`);
  if (cached) {
    console.warn("Using cached user data due to API error");
    return cached;
  }
  throw error;
}
```

### Performance Optimization Tips

1. **Request Deduplication**: Prevent duplicate simultaneous requests
2. **Smart Caching**: Use background refresh for stale-while-revalidate
3. **Compression**: Enable compression for large payloads
4. **Batch Operations**: Group multiple storage operations
5. **Lazy Loading**: Load data only when needed

### Best Practices Summary

✅ **DO**:

- Always use TypeScript strict mode
- Write tests BEFORE implementation
- Use encryption for sensitive data
- Follow SOLID principles
- Handle errors gracefully
- Document complex logic
- Request user approval before marking complete

❌ **DON'T**:

- Use `any` type without justification
- Skip writing tests
- Store passwords in localStorage
- Bypass type checks with `@ts-ignore`
- Create god classes
- Duplicate existing code
- Mark tasks complete without user testing

---

**Quickstart Complete** ✅
Ready for implementation and quality validation phases.
