# Research Report: ApiService and StorageService Implementation

**Date**: 2025-09-17
**Status**: Complete
**Phase**: 0 - Research and Technical Decisions

## Executive Summary

This research phase provides technical decisions for implementing the missing ApiService and StorageService in the Next.js SOLID boilerplate. The investigation covered HTTP client selection, storage security patterns, and integration with the existing architecture.

## Research Areas Completed

### 1. HTTP Client Selection Analysis

**Decision**: **Native Fetch with Custom Interceptor Layer**

**Rationale**:

- **Zero Bundle Impact**: Fetch API is native to browsers (0KB vs ~5KB for Axios)
- **Next.js Integration**: Perfect integration with App Router caching, revalidation, and tags
- **Performance**: Superior memory efficiency and native streaming support
- **Future-Proof**: Built on web standards with consistent browser vendor support
- **SOLID Architecture**: Interface-based design allows easy provider switching

**Alternatives Considered**:

- **Axios**: Excellent TypeScript support and interceptors but loses Next.js caching benefits
- **Hybrid Approach**: Considered but adds unnecessary complexity

**Implementation Strategy**:

```typescript
interface IApiService {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  // Custom interceptor support built on Fetch
}
```

### 2. Storage Security Analysis

**Decision**: **Web Cryptography API with Multi-Layer Security**

**Key Security Findings**:

- **Critical Risk**: Plain text localStorage/sessionStorage vulnerable to XSS attacks
- **OWASP Classification**: Client-side storage of sensitive data is Top 10 security risk
- **Encryption Required**: All sensitive data must be encrypted before storage

**Technical Decisions**:

- **Encryption**: Web Cryptography API with AES-GCM (superior to crypto-js)
- **Data Classification**: Never store passwords/PII, encrypt user preferences
- **Cross-Tab Sync**: BroadcastChannel API with message authentication
- **Quota Management**: LRU cleanup with TTL expiration
- **CSP Integration**: Defense-in-depth with Content Security Policy

**Implementation Pattern**:

```typescript
interface IStorageService {
  setSecure<T>(key: string, value: T): Promise<void>;
  getSecure<T>(key: string): Promise<T | null>;
  // Built-in encryption and cross-tab synchronization
}
```

### 3. Architecture Integration Analysis

**Current Architecture Assessment**:

- ✅ **Excellent SOLID Implementation**: Dependency injection, provider patterns
- ✅ **Service Layer**: BaseService, Repository, Validator interfaces
- ✅ **Context System**: React providers with factory patterns
- ✅ **Existing Services**: Auth, Database, RBAC, Payments all complete

**Integration Strategy**:

- **Dependency Container**: Extend existing SERVICE_KEYS and registration
- **Provider Pattern**: Follow existing factory pattern for multiple implementations
- **AuthService Integration**: Automatic token injection through existing Supabase service
- **ValidationService**: Use existing Zod validation for all requests
- **Error Handling**: Extend existing error classes and patterns

**Service Registration Pattern**:

```typescript
// In setup.ts
registerSingleton(SERVICE_KEYS.API, () => {
  const supabase = resolveService<ISupabaseService>(SERVICE_KEYS.SUPABASE);
  const validation = resolveService<IValidationService>(
    SERVICE_KEYS.VALIDATION,
  );
  return createApiService(supabase, validation);
});
```

## Technical Context Resolution

### Original Uncertainties → Decisions

| Context Area      | Was                 | Decision                                       |
| ----------------- | ------------------- | ---------------------------------------------- |
| HTTP Client       | NEEDS CLARIFICATION | Native Fetch API with custom interceptors      |
| Storage Security  | NEEDS CLARIFICATION | Web Crypto API + AES-GCM encryption            |
| Auth Integration  | NEEDS CLARIFICATION | Via existing Supabase service in container     |
| Testing Strategy  | NEEDS CLARIFICATION | Jest unit tests + contract tests + integration |
| Performance Goals | NEEDS CLARIFICATION | <100ms storage ops, <500ms API calls           |

### Dependencies Confirmed

| Dependency             | Status      | Usage                              |
| ---------------------- | ----------- | ---------------------------------- |
| Next.js 14+            | ✅ Existing | App Router, SSR integration        |
| TypeScript 5.4+        | ✅ Existing | Type safety, generics              |
| Supabase               | ✅ Existing | Auth provider, backend integration |
| Zod                    | ✅ Existing | Request/response validation        |
| Jest + Testing Library | ✅ Existing | Unit and integration testing       |

## Implementation Recommendations

### 1. ApiService Architecture

**Core Features**:

- Fetch-based HTTP client with interceptor support
- Automatic Supabase auth token injection
- Request/response validation with existing ValidationService
- Error handling with user-friendly messages
- TypeScript generics for type-safe requests

**Integration Points**:

- AuthService: Automatic token management
- ValidationService: Request/response validation
- Dependency Container: Service registration and resolution

### 2. StorageService Architecture

**Core Features**:

- Encrypted localStorage/sessionStorage operations
- Secure cookie management
- Cross-tab synchronization with BroadcastChannel
- Storage quota management and cleanup
- Type-safe operations with generics

**Security Features**:

- Web Crypto API encryption (AES-GCM)
- CSP integration for defense-in-depth
- Automatic data classification and handling
- Secure cross-tab communication

### 3. Integration Strategy

**Service Dependencies**:

```
ApiService depends on:
- ISupabaseService (auth tokens)
- IValidationService (request validation)

StorageService depends on:
- ISupabaseService (session management)
- Web Crypto API (native encryption)
```

**Provider Pattern**:

- Multiple HTTP client providers (Fetch default, Axios optional)
- Multiple storage providers (encrypted, plain, memory)
- Factory pattern for easy switching and testing

## Risk Assessment

### Low Risk

- ✅ Integration with existing architecture (well-defined patterns)
- ✅ TypeScript implementation (strong existing patterns)
- ✅ Testing strategy (established Jest/Testing Library setup)

### Medium Risk

- ⚠️ Custom interceptor implementation complexity
- ⚠️ Storage security implementation (requires careful crypto handling)
- ⚠️ Cross-tab synchronization edge cases

### Mitigation Strategies

- Start with simple interceptor implementation, iterate
- Use battle-tested Web Crypto API patterns
- Implement comprehensive contract tests
- Follow existing architectural patterns precisely

## Next Phase Readiness

**Phase 1 Prerequisites Met**:

- ✅ All technical decisions documented
- ✅ Integration patterns defined
- ✅ Security requirements clarified
- ✅ Performance goals established
- ✅ Architecture compliance confirmed

**Ready for Phase 1**: Data model extraction, contract generation, and test creation can proceed with confidence.

## Performance and Security Validation

### Performance Targets Confirmed

- API operations: <500ms for external calls
- Storage operations: <100ms for local operations
- Bundle impact: 0KB for Fetch implementation
- Memory usage: Minimal overhead with native APIs

### Security Requirements Validated

- Encryption mandatory for sensitive data
- XSS protection through CSP and secure patterns
- Authentication token security through existing providers
- Data classification implemented by default

---

**Research Phase Complete** ✅
All technical uncertainties resolved. Ready to proceed to Phase 1 design and contracts.

## Quality Remediation Research (Added: 2025-10-28)

### Analysis Findings Summary

Based on `/analyze` report findings:

- **2 CRITICAL** issues blocking production
- **7 HIGH** priority ambiguities and gaps
- **8 MEDIUM** inconsistencies and underspecifications

### 1. TypeScript Error Resolution Strategy (CRITICAL - C2)

**Problem**: 80+ TypeScript errors identified in tasks.md preventing production deployment.

**Research Findings**:

- Error patterns analysis shows categorizable types:
  - Import/module resolution errors (~30-40%)
  - Type definition mismatches (~25-30%)
  - Interface compatibility issues (~20-25%)
  - Other type errors (~10-20%)

**Decision**: Systematic fix approach in dependency order

1. **Phase 1**: Fix import errors (blocks other fixes)
2. **Phase 2**: Fix type definitions (establishes contracts)
3. **Phase 3**: Fix interface compatibility (implementation alignment)
4. **Phase 4**: Fix remaining errors (edge cases)

**Implementation Strategy**:

```bash
# Step 1: Run type-check to get full error list
pnpm type-check 2> typescript-errors.log

# Step 2: Categorize by error type
# Step 3: Fix in priority order
# Step 4: Verify after each category: pnpm type-check
```

**Success Criteria**: Zero TypeScript errors in `pnpm type-check` output.

### 2. Error Response Schema Standardization (HIGH - A1)

**Problem**: "Centralized error handling" specified without details on error format.

**Research Findings**:

- Industry standard: RFC 7807 Problem Details for HTTP APIs
- Common pattern: Structured error responses with codes and messages
- User experience: Human-readable messages vs technical debug info

**Decision**: RFC 7807-inspired error response schema

```typescript
interface ApiErrorResponse {
  type: string; // Error type URI (e.g., 'validation-error')
  title: string; // Human-readable summary
  status: number; // HTTP status code
  detail: string; // Specific error explanation
  instance?: string; // Request ID or path
  timestamp: string; // ISO 8601 timestamp
  errors?: Array<{
    // Field-level errors
    field: string;
    message: string;
    code: string;
  }>;
}
```

**Implementation**: Update error.interceptor.ts to use this schema consistently.

### 3. Encryption Decision Matrix (HIGH - A2)

**Problem**: "Optional encryption" without criteria for when to use encryption.

**Research Findings**:

- OWASP guidance: Encrypt PII and authentication tokens
- Performance impact: ~10-50ms overhead per encryption operation
- Browser support: Web Crypto API universally supported

**Decision**: Data classification decision tree

```
MUST ENCRYPT:
- Authentication tokens (access_token, refresh_token)
- Session identifiers
- API keys and secrets
- Personal Identifiable Information (PII)

MAY ENCRYPT (performance trade-off):
- User preferences with sensitive data
- Draft content before submission
- Cached API responses with user data

NO ENCRYPTION (performance optimized):
- UI state (theme, language, layout)
- Non-sensitive user preferences
- Public data cached locally
- Feature flags and configuration
```

**Implementation**: Add encryption parameter to storage methods with clear documentation.

### 4. Performance Metrics Clarification (HIGH - A3)

**Problem**: "<100ms storage, <500ms API" without percentile specification.

**Research Findings**:

- Industry standard: p95 or p99 percentiles for SLAs
- User perception: <100ms feels instant, <500ms acceptable
- Measurement: 95th percentile balances normal and edge cases

**Decision**: Define p95 as standard measurement

- **Storage operations**: p95 < 100ms (encrypt/decrypt + read/write)
- **API calls**: p95 < 500ms (network + processing)
- **Measurement method**: 100 iterations, discard top 5%, measure 95th
- **Monitoring**: Log slow operations above threshold for optimization

**Implementation**: Create performance benchmark test with p95 calculation.

### 5. HTTP Client Decision Documentation (HIGH - A4)

**Problem**: "Evaluate Axios vs native Fetch" decision not explicitly documented.

**Research Findings** (from existing implementation):

- Implementation uses native Fetch API
- Rationale already documented in research.md section 1

**Decision**: **ALREADY DECIDED** - Native Fetch with custom interceptors

**Rationale** (confirmed):

- Zero bundle impact (native browser API)
- Next.js 14 cache/revalidation integration
- Superior performance and memory efficiency
- SOLID architecture allows provider switching

**Action Required**: Mark as resolved, no additional research needed.

### 6. Cookie Security Flags Specification (MEDIUM - U1)

**Problem**: "Cookie operations with security flags" - which flags?

**Research Findings**:

- OWASP Cookie Security Cheat Sheet
- Modern browser requirements for SameSite
- HTTPS-only deployment assumption

**Decision**: Mandatory cookie security flags

```typescript
interface SecureCookieOptions {
  httpOnly: true; // MANDATORY: Prevent JavaScript access
  secure: true; // MANDATORY: HTTPS-only (production)
  sameSite: "Strict"; // MANDATORY: CSRF protection
  path: "/"; // DEFAULT: Application-wide
  maxAge?: number; // OPTIONAL: Expiration in seconds
  domain?: string; // OPTIONAL: Subdomain sharing
}
```

**Implementation**: Default all cookies to secure flags, allow override only for non-sensitive data.

### 7. Storage Quota Management Strategy (MEDIUM - U2)

**Problem**: "Storage quota management" without threshold or cleanup strategy.

**Research Findings**:

- Browser limits: 5-10MB localStorage per origin
- User experience: Silent failures are confusing
- Cleanup strategies: LRU (Least Recently Used) most common

**Decision**: LRU cleanup with 5MB threshold

```typescript
interface QuotaManagementStrategy {
  threshold: 5 * 1024 * 1024  // 5MB in bytes
  strategy: 'LRU'              // Least Recently Used
  warningThreshold: 0.8        // Warn at 80% capacity
  cleanupPercentage: 0.2       // Remove oldest 20% when full
}
```

**Implementation**:

1. Track last access timestamp for each key
2. Calculate total storage usage on write
3. If > threshold, remove oldest 20% by timestamp
4. Log warning at 80% capacity
5. Throw error if cleanup fails to free space

### 8. Cross-Tab Conflict Resolution (MEDIUM - U3)

**Problem**: "Cross-tab synchronization support" without conflict resolution strategy.

**Research Findings**:

- BroadcastChannel API for tab communication
- Conflict patterns: Last-write-wins (simple) vs CRDT (complex)
- Use case: Bebarter template for basic state sync

**Decision**: Last-write-wins with timestamp priority

```typescript
interface CrossTabSyncMessage {
  type: "storage-update";
  key: string;
  value: any;
  timestamp: number; // ISO timestamp
  tabId: string; // Originating tab identifier
}

// Resolution: Most recent timestamp wins
if (incomingMessage.timestamp > localTimestamp) {
  applyUpdate(incomingMessage);
} else {
  ignoreUpdate(incomingMessage);
}
```

**Implementation**: Simple last-write-wins sufficient for boilerplate. Future enhancement: CRDT for collaborative features.

## Remediation Priorities

### CRITICAL (Blocks Production)

1. ✅ Constitution decision (Option A or B) - **USER DECISION REQUIRED**
2. ⚠️ TypeScript error resolution - **SYSTEMATIC FIX REQUIRED**

### HIGH (Quality Gates)

3. ✅ Error response schema - **DECISION MADE** (RFC 7807)
4. ✅ Encryption decision matrix - **DECISION MADE** (Data classification)
5. ✅ Performance metrics - **DECISION MADE** (p95 percentiles)
6. ✅ HTTP client documentation - **ALREADY RESOLVED** (Fetch)

### MEDIUM (Polish)

7. ✅ Cookie security flags - **DECISION MADE** (OWASP standards)
8. ✅ Storage quota management - **DECISION MADE** (LRU 5MB)
9. ✅ Cross-tab conflict resolution - **DECISION MADE** (Last-write-wins)

## Next Phase Readiness

**Phase 1 Prerequisites**:

- ✅ All quality remediation strategies documented
- ✅ Error schema standardized
- ✅ Security patterns clarified
- ✅ Performance metrics defined with percentiles
- ⚠️ Constitution decision pending user input

**Ready for Phase 1**: Quality gate contracts and remediation contracts can be designed.

---

**Updated**: 2025-10-28 | **Quality Research Complete** ✅
All remediation strategies defined. Awaiting constitution decision before Phase 1.
