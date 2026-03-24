# Missing Services Implementation - Feature Specification

**Project**: Next.js SOLID Boilerplate - Completing Phase 2.2 Services Layer
**Version**: 1.0
**Date**: 2025-09-17
**Status**: Implementation Required

## Overview

Implementation of the remaining services from Phase 2.2 of the todo.md. Based on analysis, these services are missing and need to be implemented following SOLID principles:

- **Phase 2.2.2**: ApiService (HTTP client abstraction)
- **Phase 2.2.3**: StorageService (Local/Session storage management)

## Current State Analysis

### ✅ Already Implemented

- **AuthService** - Complete Supabase implementation with full CRUD operations
- **DatabaseProvider** - Supabase database provider with factory pattern
- **RBAC System** - Complete role-based access control
- **Payment System** - Multi-provider payment integration

### ❌ Missing and Required

- **ApiService** - No centralized HTTP client abstraction found
- **StorageService** - Only basic hook exists, needs full service implementation

## Functional Requirements

### 2.2.2 ApiService Implementation

**Purpose**: HTTP client abstraction with interceptors and centralized error handling

**Requirements**:

- HTTP client abstraction (GET, POST, PUT, DELETE, PATCH)
- Request interceptors for authentication token injection
- Response interceptors for error handling and data transformation
- Centralized error handling with user-friendly messages
- TypeScript generic support for requests/responses
- Environment-based base URL configuration
- Request/response logging for development

**Integration Points**:

- Must work with existing AuthService for token management
- Should use existing ValidationService for request validation
- Must integrate with dependency container system

### 2.2.3 StorageService Implementation

**Purpose**: Comprehensive client-side storage management beyond basic localStorage hook

**Requirements**:

- Local storage operations with proper serialization/deserialization
- Session storage management
- Cookie operations with security flags
- Storage event listeners for reactive updates
- Optional encryption for sensitive data
- Type-safe storage operations with generic support
- Storage quota management and cleanup
- Cross-tab synchronization support

**Integration Points**:

- Should complement existing `use-local-storage` hook
- Must work with AuthService for token storage
- Should integrate with Theme system for preferences storage

## Technical Implementation Details

### File Structure

```
src/shared/services/
├── api/
│   ├── api.service.ts           # Main ApiService implementation
│   ├── api.types.ts             # API-specific types and interfaces
│   ├── api.errors.ts            # API error handling
│   ├── interceptors/
│   │   ├── auth.interceptor.ts  # Auth token injection
│   │   ├── error.interceptor.ts # Error handling
│   │   └── logging.interceptor.ts # Request/response logging
│   └── index.ts                 # Public API exports
├── storage/
│   ├── storage.service.ts       # Main StorageService implementation
│   ├── storage.types.ts         # Storage-specific types
│   ├── storage.errors.ts        # Storage error handling
│   ├── providers/
│   │   ├── local-storage.provider.ts    # LocalStorage implementation
│   │   ├── session-storage.provider.ts  # SessionStorage implementation
│   │   └── cookie.provider.ts           # Cookie management
│   └── index.ts                 # Public API exports
```

### Implementation Pattern

Following existing SOLID patterns in the codebase:

```typescript
// Service interface (Interface Segregation)
interface IApiService {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  // ... other methods
}

// Service implementation (Single Responsibility)
class ApiService implements IApiService {
  constructor(
    private config: ApiConfig,
    private interceptors: RequestInterceptor[],
  ) {}

  // Implementation...
}

// Factory pattern (Dependency Inversion)
export const createApiService = (deps: Dependencies): IApiService => {
  return new ApiService(deps.config, deps.interceptors);
};
```

## Success Criteria

### ApiService

- ✅ All HTTP methods (GET, POST, PUT, DELETE, PATCH) implemented
- ✅ Request/response interceptors working correctly
- ✅ Integration with AuthService for automatic token injection
- ✅ Centralized error handling with proper error types
- ✅ TypeScript generics for type-safe requests/responses
- ✅ Unit tests covering all methods and error scenarios

### StorageService

- ✅ Local storage, session storage, and cookie operations
- ✅ Type-safe storage with generic support
- ✅ Storage event handling for reactive updates
- ✅ Integration with existing hooks and services
- ✅ Proper error handling and edge cases
- ✅ Unit tests covering all storage operations

### Integration

- ✅ Services registered in dependency container
- ✅ Proper exports in main services index.ts
- ✅ Services can be used throughout the application
- ✅ Follows existing architectural patterns
- ✅ No breaking changes to existing code

## Dependencies

### Existing Infrastructure

- AuthService and auth providers (for token management)
- ValidationService (for request validation)
- DependencyContainer (for service registration)
- Environment configuration system
- Base service patterns and types

### Required Packages

- HTTP client library (evaluate Axios vs native Fetch)
- Cookie manipulation library (js-cookie or similar)
- Optional: encryption library for sensitive storage

## Implementation Priority

1. **Phase 2.2.2**: ApiService implementation (Higher priority - needed for API communication)
2. **Phase 2.2.3**: StorageService implementation (Medium priority - enhances existing storage hook)

## Out of Scope

- Advanced caching mechanisms (handled by higher-level services)
- Real-time WebSocket communication
- Complex business logic (belongs in domain-specific services)
- UI components (covered in Phase 2.3)

This specification focuses on completing the missing services from Phase 2.2 as identified in todo.md, following the established SOLID architecture patterns.
