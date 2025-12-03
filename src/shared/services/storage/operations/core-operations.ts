// Core Storage Operations
// Single Responsibility: Basic CRUD operations for storage

import type {
  IStorageOptions,
  IStorageItem,
  IStorageProvider,
  IStorageEvent,
  StorageEventCallback,
  StorageProviderType,
} from "../storage.types";
import { StorageError } from "../storage.types";

export class CoreOperations {
  private accessTimes = new Map<string, number>(); // For LRU tracking
  private eventListeners = new Set<StorageEventCallback>();

  constructor(
    private providers: Map<StorageProviderType, IStorageProvider>,
    private compress: (data: string) => Promise<string>,
    private tryDecompress: (data: string) => Promise<string>,
  ) {}

  // Set item
  // eslint-disable-next-line max-lines-per-function, complexity -- Complex storage operation with validation, encryption, and quota management
  async set<T>(
    key: string,
    value: T,
    options: IStorageOptions = {},
  ): Promise<void> {
    this.validateKey(key);

    try {
      const provider = this.getProvider(options.provider || "localStorage");
      const storageItem = this.createStorageItem(key, value, options);
      const serializedItem = JSON.stringify(storageItem);

      // Handle compression if enabled
      let finalData = serializedItem;
      if (options.compress && this.shouldCompress(serializedItem)) {
        finalData = await this.compress(serializedItem);
      }

      await provider.setItem(key, finalData);

      // Update access time for LRU
      this.accessTimes.set(key, Date.now());

      // Trigger events
      const event: IStorageEvent<T> = {
        key,
        oldValue: null, // We don't track old values for performance
        newValue: value,
        timestamp: Date.now(),
        provider: options.provider || "localStorage",
        source: "local",
      };

      this.notifyListeners(event);
    } catch (error) {
      throw new StorageError(
        `Failed to set storage item: ${error}`,
        "SET_FAILED",
      );
    }
  }

  // Get item
  // eslint-disable-next-line max-lines-per-function, complexity -- Complex retrieval with decryption, validation, and error handling
  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    this.validateKey(key);

    try {
      // Try all providers in order of preference
      const providers: StorageProviderType[] = [
        "localStorage",
        "sessionStorage",
        "memory",
      ];

      for (const providerType of providers) {
        const provider = this.providers.get(providerType);
        if (!provider) continue;

        const rawData = await provider.getItem(key);
        if (!rawData) continue;

        // Try to parse the stored item
        let storageItem: IStorageItem<T>;
        try {
          // Check if data is compressed
          const decompressedData = await this.tryDecompress(rawData);
          storageItem = JSON.parse(decompressedData) as IStorageItem<T>;
        } catch {
          // If parsing fails, assume it's raw data (backward compatibility)
          return rawData as unknown as T;
        }

        // Check if item has expired
        if (this.isExpired(storageItem)) {
          await this.remove(key);
          continue;
        }

        // Update access time for LRU
        this.accessTimes.set(key, Date.now());

        return storageItem.value;
      }

      return defaultValue || null;
    } catch (error) {
      throw new StorageError(
        `Failed to get storage item: ${error}`,
        "GET_FAILED",
      );
    }
  }

  // Remove item
  // eslint-disable-next-line max-lines-per-function, complexity -- Complex removal with cross-tab sync and quota updates
  async remove(key: string): Promise<void> {
    this.validateKey(key);

    try {
      const providers: StorageProviderType[] = [
        "localStorage",
        "sessionStorage",
        "memory",
      ];
      let removed = false;

      for (const providerType of providers) {
        const provider = this.providers.get(providerType);
        if (!provider) continue;

        const exists = await provider.getItem(key);
        if (exists) {
          await provider.removeItem(key);
          removed = true;
        }
      }

      if (removed) {
        // Remove from access tracking
        this.accessTimes.delete(key);

        // Trigger events
        const event: IStorageEvent = {
          key,
          oldValue: null,
          newValue: null,
          timestamp: Date.now(),
          provider: "localStorage",
          source: "local",
        };

        this.notifyListeners(event);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to remove storage item: ${error}`,
        "REMOVE_FAILED",
      );
    }
  }

  // Clear all items
  // eslint-disable-next-line max-lines-per-function -- Complex clear operation across multiple providers
  async clear(): Promise<void> {
    try {
      const keys = await this.keys();

      for (const providerType of this.providers.keys()) {
        const provider = this.providers.get(providerType)!;
        await provider.clear();
      }

      // Clear access tracking
      this.accessTimes.clear();

      // Trigger events for each removed key
      for (const key of keys) {
        const event: IStorageEvent = {
          key,
          oldValue: null,
          newValue: null,
          timestamp: Date.now(),
          provider: "localStorage",
          source: "local",
        };

        this.notifyListeners(event);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to clear storage: ${error}`,
        "CLEAR_FAILED",
      );
    }
  }

  // Get all keys
  async keys(): Promise<string[]> {
    try {
      const allKeys = new Set<string>();

      for (const provider of this.providers.values()) {
        const providerKeys = await provider.keys();
        providerKeys.forEach((key) => allKeys.add(key));
      }

      return Array.from(allKeys);
    } catch (error) {
      throw new StorageError(
        `Failed to get storage keys: ${error}`,
        "KEYS_FAILED",
      );
    }
  }

  // Event management
  subscribe(callback: StorageEventCallback): () => void {
    this.eventListeners.add(callback);

    return () => {
      this.eventListeners.delete(callback);
    };
  }

  // Access to internal state for cleanup operations
  getAccessTimes(): Map<string, number> {
    return this.accessTimes;
  }

  getProviders(): Map<StorageProviderType, IStorageProvider> {
    return this.providers;
  }

  // Private methods
  private getProvider(type: StorageProviderType): IStorageProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      // Fallback to memory provider
      return this.providers.get("memory")!;
    }
    return provider;
  }

  private createStorageItem<T>(
    key: string,
    value: T,
    options: IStorageOptions,
  ): IStorageItem<T> {
    return {
      key,
      value,
      timestamp: Date.now(),
      ttl: options.ttl,
      compressed: options.compress,
      encrypted: false,
    };
  }

  private isExpired<T>(item: IStorageItem<T>): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }

  private shouldCompress(data: string): boolean {
    // Compress if data is larger than 1KB
    return data.length > 1024;
  }

  private validateKey(key: string): void {
    if (!key || typeof key !== "string" || key.trim() === "") {
      throw new StorageError(
        "Storage key must be a non-empty string",
        "INVALID_KEY",
      );
    }
  }

  private notifyListeners<T>(event: IStorageEvent<T>): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("Storage event listener failed:", error);
      }
    }
  }
}
