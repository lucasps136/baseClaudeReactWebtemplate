// Memory Storage Provider
// In-memory storage provider for testing and fallback scenarios

import type { IStorageProvider, IStorageUsage } from "../storage.types";
import { StorageError } from "../storage.types";

export class MemoryStorageProvider implements IStorageProvider {
  private storage = new Map<string, string>();
  private readonly maxSize = 5 * 1024 * 1024; // 5MB limit

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Check if adding this item would exceed the limit
      const currentSize = this.calculateSize();
      const itemSize = key.length * 2 + value.length * 2 + 20; // UTF-16 + overhead

      if (currentSize + itemSize > this.maxSize) {
        const usage = await this.getUsage();
        throw new Error(
          `Memory storage quota exceeded: ${usage.used + itemSize}/${usage.quota} bytes`,
        );
      }

      this.storage.set(key, value);
    } catch (error) {
      throw new StorageError(
        `Failed to set item: ${error}`,
        "SET_FAILED",
        "memory",
      );
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.get(key) || null;
    } catch (error) {
      throw new StorageError(
        `Failed to get item: ${error}`,
        "GET_FAILED",
        "memory",
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.storage.delete(key);
    } catch (error) {
      throw new StorageError(
        `Failed to remove item: ${error}`,
        "REMOVE_FAILED",
        "memory",
      );
    }
  }

  async clear(): Promise<void> {
    try {
      this.storage.clear();
    } catch (error) {
      throw new StorageError(
        `Failed to clear storage: ${error}`,
        "CLEAR_FAILED",
        "memory",
      );
    }
  }

  async keys(): Promise<string[]> {
    try {
      return Array.from(this.storage.keys());
    } catch (error) {
      throw new StorageError(
        `Failed to get keys: ${error}`,
        "KEYS_FAILED",
        "memory",
      );
    }
  }

  async getUsage(): Promise<IStorageUsage> {
    try {
      const used = this.calculateSize();

      return {
        used,
        quota: this.maxSize,
        percentage: (used / this.maxSize) * 100,
        provider: "memory",
      };
    } catch (error) {
      throw new StorageError(
        `Failed to get usage: ${error}`,
        "USAGE_FAILED",
        "memory",
      );
    }
  }

  private calculateSize(): number {
    let totalSize = 0;

    for (const [key, value] of this.storage.entries()) {
      // Approximate size calculation (UTF-16 encoding + overhead)
      totalSize += key.length * 2 + value.length * 2 + 20;
    }

    return totalSize;
  }

  // Memory storage is always supported
  static isSupported(): boolean {
    return true;
  }
}
