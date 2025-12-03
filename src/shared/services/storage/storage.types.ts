// Storage Service Types and Interfaces
// Following the contract specification from specs/master/contracts/storage-service.contract.ts

export type StorageProviderType =
  | "localStorage"
  | "sessionStorage"
  | "memory"
  | "cookie";

export interface IStorageOptions {
  /** Storage provider to use */
  provider?: StorageProviderType;

  /** Time to live in milliseconds */
  ttl?: number;

  /** Enable compression for large data */
  compress?: boolean;

  /** Enable cross-tab synchronization */
  sync?: boolean;
}

export interface ISecureStorageOptions extends IStorageOptions {
  /** Enable encryption (default: true) */
  encrypt?: boolean;

  /** Encryption key ID for key rotation */
  keyId?: string;
}

export interface IStorageItem<T = unknown> {
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

export interface ISecureStorageItem {
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

export interface IStorageUsage {
  /** Bytes currently used */
  used: number;

  /** Total quota in bytes */
  quota: number;

  /** Usage percentage (0-100) */
  percentage: number;

  /** Storage provider type */
  provider: StorageProviderType;
}

export interface IStorageEvent<T = unknown> {
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

export type StorageEventCallback = <T>(event: IStorageEvent<T>) => void;

export interface ICrossTabMessage<T = unknown> {
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

export interface ICleanupStrategy {
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

export interface IStorageProvider {
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
  getUsage(): IStorageUsage | Promise<IStorageUsage>;
}

export interface IEncryptionConfig {
  /** Must be AES-GCM */
  algorithm: "AES-GCM";

  /** Must be 256 bits */
  keyLength: 256;

  /** Must be 12 bytes (96 bits) */
  ivLength: 12;

  /** Must be 16 bytes (128 bits) */
  tagLength: 16;
}

export interface IEncryptedData {
  /** Base64 encoded encrypted data */
  data: string;

  /** Base64 encoded initialization vector */
  iv: string;

  /** Optional key ID for key rotation */
  keyId?: string;
}

export interface IEncryptionService {
  /** Encrypt data with optional key ID */
  encrypt(data: string, keyId?: string): Promise<IEncryptedData>;

  /** Decrypt data with optional key ID */
  decrypt(encryptedData: IEncryptedData, keyId?: string): Promise<string>;

  /** Generate new encryption key */
  generateKey(keyId: string): Promise<CryptoKey>;

  /** Retrieve existing encryption key */
  getKey(keyId: string): Promise<CryptoKey | null>;
}

// Main Storage Service interface
export interface IStorageService {
  // Basic storage operations
  set<T>(key: string, value: T, options?: IStorageOptions): Promise<void>;
  get<T>(key: string, defaultValue?: T): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;

  // Secure storage operations
  setSecure<T>(
    key: string,
    value: T,
    options?: ISecureStorageOptions,
  ): Promise<void>;
  getSecure<T>(key: string, defaultValue?: T): Promise<T | null>;

  // Storage events
  subscribe(callback: StorageEventCallback): () => void;

  // Quota management
  getUsage(): Promise<IStorageUsage>;
  cleanup(strategy?: ICleanupStrategy): Promise<void>;
}

// Error classes
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

// Service dependencies
export interface IStorageServiceDependencies {
  supabaseService: ISupabaseService;
}

// Re-export external types
export interface ISupabaseService {
  getClient(): unknown; // Supabase client
}
