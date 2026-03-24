/**
 * Storage Service Contract
 *
 * This contract defines the exact interface and behavior expectations
 * for the StorageService implementation. All implementations must conform
 * to this contract to ensure security, reliability, and maintainability.
 */

export interface IStorageServiceContract {
  // ===========================================
  // BASIC STORAGE OPERATIONS CONTRACT
  // ===========================================

  /**
   * Stores a value in storage
   * @param key - Storage key (must be non-empty string)
   * @param value - Value to store (will be JSON serialized)
   * @param options - Storage configuration options
   * @throws StorageError on storage failures
   * @throws StorageQuotaError on quota exceeded
   * @contract Must handle serialization automatically
   * @contract Must respect TTL if provided
   */
  set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;

  /**
   * Retrieves a value from storage
   * @param key - Storage key to retrieve
   * @param defaultValue - Value to return if key not found
   * @returns Stored value or default value
   * @contract Must handle deserialization automatically
   * @contract Must respect TTL expiration
   * @contract Must return null for expired items
   */
  get<T>(key: string, defaultValue?: T): Promise<T | null>;

  /**
   * Removes a value from storage
   * @param key - Storage key to remove
   * @contract Must handle non-existent keys gracefully
   * @contract Must trigger storage events
   */
  remove(key: string): Promise<void>;

  /**
   * Clears all storage for the current domain
   * @contract Must remove all items
   * @contract Must trigger storage events for each item
   * @contract Must respect provider boundaries
   */
  clear(): Promise<void>;

  /**
   * Returns all storage keys
   * @returns Array of all storage keys
   * @contract Must exclude expired items
   * @contract Must respect provider boundaries
   */
  keys(): Promise<string[]>;

  // ===========================================
  // SECURE STORAGE OPERATIONS CONTRACT
  // ===========================================

  /**
   * Stores a value with encryption
   * @param key - Storage key (must be non-empty string)
   * @param value - Value to store (will be encrypted then stored)
   * @param options - Secure storage configuration options
   * @throws StorageError on storage failures
   * @throws EncryptionError on encryption failures
   * @contract Must encrypt data before storage
   * @contract Must use Web Crypto API for encryption
   * @contract Must generate unique IV for each operation
   */
  setSecure<T>(
    key: string,
    value: T,
    options?: SecureStorageOptions,
  ): Promise<void>;

  /**
   * Retrieves and decrypts a value from storage
   * @param key - Storage key to retrieve
   * @param defaultValue - Value to return if key not found
   * @returns Decrypted value or default value
   * @throws EncryptionError on decryption failures
   * @contract Must decrypt data after retrieval
   * @contract Must handle encryption metadata correctly
   */
  getSecure<T>(key: string, defaultValue?: T): Promise<T | null>;

  // ===========================================
  // STORAGE EVENTS CONTRACT
  // ===========================================

  /**
   * Subscribes to storage change events
   * @param callback - Function to call on storage changes
   * @returns Unsubscribe function
   * @contract Must notify on all storage changes
   * @contract Must include old and new values
   * @contract Must support cross-tab synchronization
   */
  subscribe(callback: StorageEventCallback): () => void;

  // ===========================================
  // QUOTA MANAGEMENT CONTRACT
  // ===========================================

  /**
   * Returns current storage usage information
   * @returns Storage usage statistics
   * @contract Must provide accurate usage data
   * @contract Must respect provider-specific quotas
   */
  getUsage(): Promise<StorageUsage>;

  /**
   * Performs storage cleanup based on strategy
   * @param strategy - Cleanup strategy configuration
   * @contract Must implement all cleanup strategies
   * @contract Must not remove non-expired items unless required
   */
  cleanup(strategy?: CleanupStrategy): Promise<void>;
}

// ===========================================
// CONFIGURATION TYPE CONTRACTS
// ===========================================

export interface StorageOptions {
  /** Storage provider to use */
  provider?: StorageProviderType;

  /** Time to live in milliseconds */
  ttl?: number;

  /** Enable compression for large data */
  compress?: boolean;

  /** Enable cross-tab synchronization */
  sync?: boolean;
}

export interface SecureStorageOptions extends StorageOptions {
  /** Enable encryption (default: true) */
  encrypt?: boolean;

  /** Encryption key ID for key rotation */
  keyId?: string;
}

export type StorageProviderType =
  | "localStorage"
  | "sessionStorage"
  | "memory"
  | "cookie";

// ===========================================
// DATA TYPE CONTRACTS
// ===========================================

export interface StorageItem<T = unknown> {
  /** Storage key */
  key: string;

  /** Stored value */
  value: T;

  /** Timestamp when item was stored */
  timestamp: number;

  /** Time to live in milliseconds */
  ttl?: number;

  /** Whether data is compressed */
  compressed?: boolean;

  /** Whether data is encrypted */
  encrypted?: boolean;
}

export interface SecureStorageItem {
  /** Encrypted data string */
  data: string;

  /** Initialization vector for encryption */
  iv: string;

  /** Timestamp when item was stored */
  timestamp: number;

  /** Time to live in milliseconds */
  ttl?: number;

  /** Encryption key ID */
  keyId?: string;
}

export interface StorageUsage {
  /** Bytes currently used */
  used: number;

  /** Total quota in bytes */
  quota: number;

  /** Usage percentage (0-100) */
  percentage: number;

  /** Storage provider type */
  provider: StorageProviderType;
}

// ===========================================
// EVENT SYSTEM CONTRACT
// ===========================================

export interface StorageEvent<T = unknown> {
  /** Storage key that changed */
  key: string;

  /** Previous value (null if new item) */
  oldValue: T | null;

  /** New value (null if deleted) */
  newValue: T | null;

  /** Timestamp of change */
  timestamp: number;

  /** Storage provider that changed */
  provider: StorageProviderType;

  /** Source of change (local or cross-tab) */
  source: "local" | "remote";
}

export type StorageEventCallback = <T>(event: StorageEvent<T>) => void;

export interface CrossTabMessage<T = unknown> {
  /** Message type identifier */
  type: "storage-change";

  /** Storage key that changed */
  key: string;

  /** New value (null if deleted) */
  value: T | null;

  /** Timestamp of change */
  timestamp: number;

  /** Message signature for security */
  signature?: string;
}

// ===========================================
// CLEANUP AND QUOTA CONTRACTS
// ===========================================

export interface CleanupStrategy {
  /** Cleanup strategy type */
  type: "lru" | "ttl" | "percentage" | "manual";

  /** Maximum age for TTL strategy (milliseconds) */
  maxAge?: number;

  /** Maximum items for LRU strategy */
  maxItems?: number;

  /** Target percentage for percentage strategy */
  targetPercentage?: number;

  /** Specific keys to remove for manual strategy */
  keysToRemove?: string[];
}

/**
 * Storage provider interface
 * @contract All implementations must be async-compatible
 * @contract Must handle errors gracefully
 */
export interface StorageProvider {
  /** Store item in provider */
  setItem(key: string, value: string): void | Promise<void>;

  /** Retrieve item from provider */
  getItem(key: string): string | null | Promise<string | null>;

  /** Remove item from provider */
  removeItem(key: string): void | Promise<void>;

  /** Clear all items from provider */
  clear(): void | Promise<void>;

  /** Get all keys from provider */
  keys(): string[] | Promise<string[]>;

  /** Get usage statistics */
  getUsage(): StorageUsage | Promise<StorageUsage>;
}

// ===========================================
// ENCRYPTION CONTRACT
// ===========================================

/**
 * Encryption configuration
 * @contract Must use Web Crypto API
 * @contract Must use AES-GCM algorithm
 * @contract Must use 256-bit keys
 */
export interface EncryptionConfig {
  /** Must be AES-GCM */
  algorithm: "AES-GCM";

  /** Must be 256 bits */
  keyLength: 256;

  /** Must be 12 bytes (96 bits) */
  ivLength: 12;

  /** Must be 16 bytes (128 bits) */
  tagLength: 16;
}

export interface EncryptedData {
  /** Base64 encoded encrypted data */
  data: string;

  /** Base64 encoded initialization vector */
  iv: string;

  /** Optional key ID for key rotation */
  keyId?: string;
}

/**
 * Encryption service interface
 * @contract Must use cryptographically secure random IVs
 * @contract Must support key rotation
 */
export interface IEncryptionService {
  /** Encrypt data with optional key ID */
  encrypt(data: string, keyId?: string): Promise<EncryptedData>;

  /** Decrypt data with optional key ID */
  decrypt(encryptedData: EncryptedData, keyId?: string): Promise<string>;

  /** Generate new encryption key */
  generateKey(keyId: string): Promise<CryptoKey>;

  /** Retrieve existing encryption key */
  getKey(keyId: string): Promise<CryptoKey | null>;
}

// ===========================================
// ERROR HANDLING CONTRACT
// ===========================================

/**
 * Base storage error
 * @contract Must be thrown for all storage failures
 * @contract Must include relevant error context
 */
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

/**
 * Storage quota exceeded error
 * @contract Must be thrown when quota is exceeded
 * @contract Must include usage information
 */
export class StorageQuotaError extends StorageError {
  constructor(used: number, quota: number, provider: StorageProviderType) {
    super(`Storage quota exceeded: ${used}/${quota} bytes`);
    this.code = "QUOTA_EXCEEDED";
    this.provider = provider;
  }
}

/**
 * Encryption operation error
 * @contract Must be thrown for encryption/decryption failures
 * @contract Must not expose sensitive data in error messages
 */
export class EncryptionError extends StorageError {
  constructor(message: string, operation: "encrypt" | "decrypt") {
    super(`Encryption ${operation} failed: ${message}`);
    this.code = `ENCRYPTION_${operation.toUpperCase()}_FAILED`;
  }
}

// ===========================================
// SECURITY CONTRACT
// ===========================================

/**
 * Security requirements
 * @contract Must never store sensitive data in plain text
 * @contract Must use secure random number generation
 * @contract Must implement defense against XSS
 */
export interface SecurityContract {
  /** Must classify data before storage */
  classifyData(data: unknown): "public" | "private" | "sensitive";

  /** Must enforce encryption for sensitive data */
  enforceEncryption(data: unknown): boolean;

  /** Must validate data integrity */
  validateIntegrity(data: unknown): boolean;

  /** Must implement CSP compliance */
  enforceCSP(): void;
}

// ===========================================
// CROSS-TAB SYNCHRONIZATION CONTRACT
// ===========================================

/**
 * Cross-tab synchronization requirements
 * @contract Must use BroadcastChannel API
 * @contract Must handle message authentication
 * @contract Must prevent infinite loops
 */
export interface CrossTabSyncContract {
  /** Broadcast storage change to other tabs */
  broadcast(message: CrossTabMessage): void;

  /** Subscribe to messages from other tabs */
  subscribe(callback: (message: CrossTabMessage) => void): () => void;

  /** Authenticate message for security */
  authenticateMessage(message: CrossTabMessage): boolean;

  /** Prevent synchronization loops */
  preventLoop(message: CrossTabMessage): boolean;
}

// ===========================================
// PERFORMANCE CONTRACT
// ===========================================

/**
 * Performance requirements
 * @contract Storage operations must complete within 100ms
 * @contract Must handle large data efficiently
 * @contract Must not block main thread
 */
export interface PerformanceContract {
  /** Maximum operation time */
  readonly MAX_OPERATION_TIME: 100; // milliseconds

  /** Maximum item size */
  readonly MAX_ITEM_SIZE: 1048576; // 1MB

  /** Must support async operations */
  readonly ASYNC_OPERATIONS: true;

  /** Must support compression for large items */
  readonly COMPRESSION_SUPPORT: true;
}

// ===========================================
// BROWSER COMPATIBILITY CONTRACT
// ===========================================

/**
 * Browser compatibility requirements
 * @contract Must work in all modern browsers
 * @contract Must handle private/incognito mode
 * @contract Must gracefully degrade when APIs unavailable
 */
export interface CompatibilityContract {
  /** Detect if storage is available */
  isStorageAvailable(provider: StorageProviderType): boolean;

  /** Detect if encryption is available */
  isEncryptionAvailable(): boolean;

  /** Detect if cross-tab sync is available */
  isCrossTabSyncAvailable(): boolean;

  /** Handle private browsing mode */
  handlePrivateMode(): void;
}

// ===========================================
// FACTORY CONTRACT
// ===========================================

/**
 * Service factory requirements
 * @contract Must create service instances with dependencies
 * @contract Must support multiple provider implementations
 * @contract Must integrate with dependency container
 */
export interface StorageServiceFactoryContract {
  /** Create service with localStorage provider (default) */
  createLocalStorageProvider(
    dependencies: StorageDependencies,
  ): IStorageServiceContract;

  /** Create service with sessionStorage provider */
  createSessionStorageProvider(
    dependencies: StorageDependencies,
  ): IStorageServiceContract;

  /** Create service with memory provider (for testing) */
  createMemoryProvider(
    dependencies: StorageDependencies,
  ): IStorageServiceContract;

  /** Register service in dependency container */
  registerInContainer(container: IDependencyContainer): void;
}

export interface StorageDependencies {
  supabaseService: ISupabaseService;
}

// ===========================================
// TESTING CONTRACT
// ===========================================

/**
 * Testing support requirements
 * @contract Must be easily mockable
 * @contract Must provide test utilities
 * @contract Must support dependency injection for testing
 */
export interface TestingContract {
  /** Create mock storage provider */
  createMockProvider(): StorageProvider;

  /** Create test data for various scenarios */
  createTestData(): StorageTestData;

  /** Simulate storage quota exceeded */
  simulateQuotaExceeded(): void;

  /** Simulate encryption failures */
  simulateEncryptionFailure(): void;
}

export interface StorageTestData {
  smallData: unknown;
  largeData: unknown;
  sensitiveData: unknown;
  expiredData: unknown;
}

// Re-export from external dependencies
export interface ISupabaseService {
  getClient(): any; // Supabase client
}

export interface IDependencyContainer {
  register(key: string, factory: () => unknown): void;
  resolve<T>(key: string): T;
}
