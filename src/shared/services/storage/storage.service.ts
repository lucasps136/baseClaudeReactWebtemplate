// Storage Service Implementation
// Secure client-side storage with encryption and cross-tab synchronization

import { z } from "zod";
import type {
  IStorageService,
  IStorageOptions,
  ISecureStorageOptions,
  StorageEventCallback,
  IStorageUsage,
  ICleanupStrategy,
  IStorageEvent,
  IStorageItem,
  ISecureStorageItem,
  IStorageProvider,
  StorageProviderType,
  IStorageServiceDependencies,
  ISupabaseService,
} from "./storage.types";
import {
  StorageError,
  StorageQuotaError,
  EncryptionError,
} from "./storage.types";
import { EncryptionService } from "./encryption.service";
import { CrossTabSyncService } from "./cross-tab-sync.service";
import { LocalStorageProvider } from "./providers/local-storage.provider";
import { SessionStorageProvider } from "./providers/session-storage.provider";
import { MemoryStorageProvider } from "./providers/memory.provider";

// Validation schemas
const storageOptionsSchema = z.object({
  provider: z
    .enum(["localStorage", "sessionStorage", "memory", "cookie"])
    .optional(),
  ttl: z.number().positive().optional(),
  compress: z.boolean().optional(),
  sync: z.boolean().optional(),
});

const secureStorageOptionsSchema = storageOptionsSchema.extend({
  encrypt: z.boolean().optional(),
  keyId: z.string().optional(),
});

const cleanupStrategySchema = z.object({
  type: z.enum(["lru", "ttl", "percentage", "manual"]),
  maxAge: z.number().positive().optional(),
  maxItems: z.number().positive().optional(),
  targetPercentage: z.number().min(0).max(100).optional(),
  keysToRemove: z.array(z.string()).optional(),
});

export class StorageService implements IStorageService {
  private providers = new Map<StorageProviderType, IStorageProvider>();
  private encryptionService: EncryptionService;
  private crossTabSync: CrossTabSyncService;
  private eventListeners = new Set<StorageEventCallback>();
  private accessTimes = new Map<string, number>(); // For LRU tracking

  constructor(private supabaseService: ISupabaseService) {
    this.initializeProviders();
    this.encryptionService = new EncryptionService();
    this.crossTabSync = new CrossTabSyncService();
    this.setupCrossTabSync();
  }

  // Basic storage operations
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

      // Broadcast to other tabs if sync enabled
      if (options.sync) {
        this.crossTabSync.broadcast(event);
      }
    } catch (error) {
      if (error instanceof StorageQuotaError) {
        throw error;
      }
      throw new StorageError(
        `Failed to set storage item: ${error}`,
        "SET_FAILED",
      );
    }
  }

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
        this.crossTabSync.broadcast(event);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to remove storage item: ${error}`,
        "REMOVE_FAILED",
      );
    }
  }

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

  // Secure storage operations
  async setSecure<T>(
    key: string,
    value: T,
    options: ISecureStorageOptions = {},
  ): Promise<void> {
    if (!EncryptionService.isSupported()) {
      throw new EncryptionError("Web Crypto API not supported", "encrypt");
    }

    try {
      const encryptedData = await this.encryptionService.encrypt(
        JSON.stringify(value),
        options.keyId,
      );

      const secureItem: ISecureStorageItem = {
        data: encryptedData.data,
        iv: encryptedData.iv,
        timestamp: Date.now(),
        ttl: options.ttl,
        keyId: encryptedData.keyId,
      };

      // Store the encrypted item
      await this.set(`secure:${key}`, secureItem, {
        ...options,
        provider: options.provider || "sessionStorage", // Default to sessionStorage for security
      });
    } catch (error) {
      if (error instanceof EncryptionError) {
        throw error;
      }
      throw new EncryptionError(
        `Failed to store secure item: ${error}`,
        "encrypt",
      );
    }
  }

  async getSecure<T>(key: string, defaultValue?: T): Promise<T | null> {
    if (!EncryptionService.isSupported()) {
      throw new EncryptionError("Web Crypto API not supported", "decrypt");
    }

    try {
      const secureItem = await this.get<ISecureStorageItem>(`secure:${key}`);
      if (!secureItem) {
        return defaultValue || null;
      }

      const encryptedData = {
        data: secureItem.data,
        iv: secureItem.iv,
        keyId: secureItem.keyId,
      };

      const decryptedJson = await this.encryptionService.decrypt(encryptedData);
      return JSON.parse(decryptedJson) as T;
    } catch (error) {
      if (error instanceof EncryptionError) {
        throw error;
      }
      throw new EncryptionError(
        `Failed to retrieve secure item: ${error}`,
        "decrypt",
      );
    }
  }

  // Storage events
  subscribe(callback: StorageEventCallback): () => void {
    this.eventListeners.add(callback);

    return () => {
      this.eventListeners.delete(callback);
    };
  }

  // Quota management
  async getUsage(): Promise<IStorageUsage> {
    try {
      // Use localStorage as primary storage for usage calculation
      const provider = this.getProvider("localStorage");
      return await provider.getUsage();
    } catch (error) {
      throw new StorageError(
        `Failed to get storage usage: ${error}`,
        "USAGE_FAILED",
      );
    }
  }

  async cleanup(strategy: ICleanupStrategy = { type: "ttl" }): Promise<void> {
    try {
      await this.validateCleanupStrategy(strategy);

      switch (strategy.type) {
        case "ttl":
          await this.cleanupExpired(strategy.maxAge);
          break;
        case "lru":
          await this.cleanupLRU(strategy.maxItems || 100);
          break;
        case "percentage":
          await this.cleanupByPercentage(strategy.targetPercentage || 80);
          break;
        case "manual":
          await this.cleanupManual(strategy.keysToRemove || []);
          break;
      }
    } catch (error) {
      throw new StorageError(
        `Failed to cleanup storage: ${error}`,
        "CLEANUP_FAILED",
      );
    }
  }

  // Private methods
  private initializeProviders(): void {
    // Initialize providers in order of preference
    if (LocalStorageProvider.isSupported()) {
      this.providers.set("localStorage", new LocalStorageProvider());
    }

    if (SessionStorageProvider.isSupported()) {
      this.providers.set("sessionStorage", new SessionStorageProvider());
    }

    // Memory provider is always available as fallback
    this.providers.set("memory", new MemoryStorageProvider());
  }

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

  private async compress(data: string): Promise<string> {
    // Simple compression using browser's built-in compression
    // In production, you might want to use a proper compression library
    try {
      const stream = new CompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(new TextEncoder().encode(data));
      writer.close();

      const compressed = await reader.read();
      return btoa(String.fromCharCode(...new Uint8Array(compressed.value!)));
    } catch {
      // Fallback: return original data if compression fails
      return data;
    }
  }

  private async tryDecompress(data: string): Promise<string> {
    try {
      // Try to decompress first
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const stream = new DecompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(bytes);
      writer.close();

      const decompressed = await reader.read();
      return new TextDecoder().decode(decompressed.value!);
    } catch {
      // If decompression fails, return original data
      return data;
    }
  }

  private validateKey(key: string): void {
    if (!key || typeof key !== "string" || key.trim() === "") {
      throw new StorageError(
        "Storage key must be a non-empty string",
        "INVALID_KEY",
      );
    }
  }

  private async validateCleanupStrategy(
    strategy: ICleanupStrategy,
  ): Promise<void> {
    try {
      cleanupStrategySchema.parse(strategy);
    } catch (error) {
      throw new StorageError(
        `Invalid cleanup strategy: ${error}`,
        "INVALID_STRATEGY",
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

  private setupCrossTabSync(): void {
    // Subscribe to cross-tab events and forward to our listeners
    this.crossTabSync.subscribe((event) => {
      this.notifyListeners(event);
    });
  }

  private async cleanupExpired(maxAge?: number): Promise<void> {
    const keys = await this.keys();
    const cutoffTime = maxAge ? Date.now() - maxAge : 0;

    for (const key of keys) {
      try {
        // Try to get the item to check its timestamp
        const rawData = await this.getProvider("localStorage").getItem(key);
        if (!rawData) continue;

        const item = JSON.parse(rawData) as IStorageItem<any>;
        if (item.timestamp && item.timestamp < cutoffTime) {
          await this.remove(key);
        } else if (this.isExpired(item)) {
          await this.remove(key);
        }
      } catch {
        // If we can't parse the item, it might be corrupted, remove it
        await this.remove(key);
      }
    }
  }

  private async cleanupLRU(maxItems: number): Promise<void> {
    const keys = await this.keys();
    if (keys.length <= maxItems) return;

    // Sort keys by access time (oldest first)
    const sortedKeys = keys.sort((a, b) => {
      const timeA = this.accessTimes.get(a) || 0;
      const timeB = this.accessTimes.get(b) || 0;
      return timeA - timeB;
    });

    // Remove oldest items
    const keysToRemove = sortedKeys.slice(0, keys.length - maxItems);
    for (const key of keysToRemove) {
      await this.remove(key);
    }
  }

  private async cleanupByPercentage(targetPercentage: number): Promise<void> {
    const usage = await this.getUsage();
    if (usage.percentage <= targetPercentage) return;

    // Calculate how many items to remove
    const targetUsage = (targetPercentage / 100) * usage.quota;
    const bytesToRemove = usage.used - targetUsage;

    // Remove items using LRU strategy until we reach target
    const keys = await this.keys();
    const sortedKeys = keys.sort((a, b) => {
      const timeA = this.accessTimes.get(a) || 0;
      const timeB = this.accessTimes.get(b) || 0;
      return timeA - timeB;
    });

    let removedBytes = 0;
    for (const key of sortedKeys) {
      if (removedBytes >= bytesToRemove) break;

      try {
        const rawData = await this.getProvider("localStorage").getItem(key);
        if (rawData) {
          removedBytes += rawData.length * 2; // Approximate UTF-16 size
          await this.remove(key);
        }
      } catch {
        // Continue with next key if this one fails
      }
    }
  }

  private async cleanupManual(keysToRemove: string[]): Promise<void> {
    for (const key of keysToRemove) {
      await this.remove(key);
    }
  }
}

// Factory function
export const createStorageService = (
  supabaseService: ISupabaseService,
): IStorageService => {
  return new StorageService(supabaseService);
};
