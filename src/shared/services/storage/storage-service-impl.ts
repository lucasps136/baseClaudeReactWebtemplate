// Storage Service Implementation - Modular version
// Composes all operations into a cohesive service

import { CrossTabSyncService } from "./cross-tab-sync.service";
import { EncryptionService } from "./encryption.service";
import { CleanupStrategies } from "./operations/cleanup-strategies";
import { CompressionUtils } from "./operations/compression";
import { CoreOperations } from "./operations/core-operations";
import { SecureOperations } from "./operations/secure-operations";
import { LocalStorageProvider } from "./providers/local-storage.provider";
import { MemoryStorageProvider } from "./providers/memory.provider";
import { SessionStorageProvider } from "./providers/session-storage.provider";
import type {
  IStorageService,
  IStorageOptions,
  ISecureStorageOptions,
  StorageEventCallback,
  IStorageUsage,
  ICleanupStrategy,
  IStorageProvider,
  StorageProviderType,
  ISupabaseService,
} from "./storage.types";

export class StorageServiceImpl implements IStorageService {
  private providers = new Map<StorageProviderType, IStorageProvider>();
  private encryptionService: EncryptionService;
  private crossTabSync: CrossTabSyncService;
  private compressionUtils: CompressionUtils;

  // Composed operations
  private coreOps: CoreOperations;
  private secureOps: SecureOperations;
  private cleanupStrategies: CleanupStrategies;

  constructor() {
    this.initializeProviders();
    this.encryptionService = new EncryptionService();
    this.crossTabSync = new CrossTabSyncService();
    this.compressionUtils = new CompressionUtils();

    // Initialize composed operations
    this.coreOps = new CoreOperations(
      this.providers,
      this.compressionUtils.compress.bind(this.compressionUtils),
      this.compressionUtils.tryDecompress.bind(this.compressionUtils),
    );

    this.secureOps = new SecureOperations(this.encryptionService, this.coreOps);

    this.cleanupStrategies = new CleanupStrategies(
      this.providers,
      this.coreOps.getAccessTimes(),
      this.coreOps.keys.bind(this.coreOps),
      this.coreOps.remove.bind(this.coreOps),
    );

    this.setupCrossTabSync();
  }

  // Delegate to composed operations
  async set<T>(
    key: string,
    value: T,
    options: IStorageOptions = {},
  ): Promise<void> {
    await this.coreOps.set(key, value, options);

    // Broadcast to other tabs if sync enabled
    if (options.sync) {
      this.crossTabSync.broadcast({
        key,
        oldValue: null,
        newValue: value,
        timestamp: Date.now(),
        provider: options.provider || "localStorage",
        source: "local",
      });
    }
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    return this.coreOps.get(key, defaultValue);
  }

  async remove(key: string): Promise<void> {
    await this.coreOps.remove(key);
    this.crossTabSync.broadcast({
      key,
      oldValue: null,
      newValue: null,
      timestamp: Date.now(),
      provider: "localStorage",
      source: "local",
    });
  }

  async clear(): Promise<void> {
    return this.coreOps.clear();
  }

  async keys(): Promise<string[]> {
    return this.coreOps.keys();
  }

  async setSecure<T>(
    key: string,
    value: T,
    options: ISecureStorageOptions = {},
  ): Promise<void> {
    return this.secureOps.setSecure(key, value, options);
  }

  async getSecure<T>(key: string, defaultValue?: T): Promise<T | null> {
    return this.secureOps.getSecure(key, defaultValue);
  }

  subscribe(callback: StorageEventCallback): () => void {
    return this.coreOps.subscribe(callback);
  }

  async getUsage(): Promise<IStorageUsage> {
    return this.cleanupStrategies.getUsage();
  }

  async cleanup(strategy: ICleanupStrategy = { type: "ttl" }): Promise<void> {
    return this.cleanupStrategies.cleanup(strategy);
  }

  // Private methods
  private initializeProviders(): void {
    if (LocalStorageProvider.isSupported()) {
      this.providers.set("localStorage", new LocalStorageProvider());
    }

    if (SessionStorageProvider.isSupported()) {
      this.providers.set("sessionStorage", new SessionStorageProvider());
    }

    // Memory provider is always available as fallback
    this.providers.set("memory", new MemoryStorageProvider());
  }

  private setupCrossTabSync(): void {
    // Subscribe to cross-tab events and forward to our listeners
    this.crossTabSync.subscribe((event) => {
      // Forward to core operations listeners
      const listeners = (this.coreOps as any).eventListeners; // eslint-disable-line @typescript-eslint/no-explicit-any
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error("Storage event listener failed:", error);
        }
      }
    });
  }
}

// Factory function
export const createStorageService = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _supabaseService: ISupabaseService,
): IStorageService => {
  // supabaseService parameter kept for future use but not currently needed
  return new StorageServiceImpl();
};
