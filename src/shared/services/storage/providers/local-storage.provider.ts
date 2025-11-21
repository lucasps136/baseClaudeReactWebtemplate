// Local Storage Provider
// Implements IStorageProvider interface for localStorage

import type { IStorageProvider, IStorageUsage } from "../storage.types";
import { StorageError, StorageQuotaError } from "../storage.types";

export class LocalStorageProvider implements IStorageProvider {
  private readonly storageKey = "bebarter-storage";

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(this.getFullKey(key), value);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        const usage = await this.getUsage();
        throw new StorageQuotaError(usage.used, usage.quota, "localStorage");
      }
      throw new StorageError(
        `Failed to set item: ${error}`,
        "SET_FAILED",
        "localStorage",
      );
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(this.getFullKey(key));
    } catch (error) {
      throw new StorageError(
        `Failed to get item: ${error}`,
        "GET_FAILED",
        "localStorage",
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getFullKey(key));
    } catch (error) {
      throw new StorageError(
        `Failed to remove item: ${error}`,
        "REMOVE_FAILED",
        "localStorage",
      );
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      for (const key of keys) {
        localStorage.removeItem(this.getFullKey(key));
      }
    } catch (error) {
      throw new StorageError(
        `Failed to clear storage: ${error}`,
        "CLEAR_FAILED",
        "localStorage",
      );
    }
  }

  async keys(): Promise<string[]> {
    try {
      const allKeys = Object.keys(localStorage);
      const prefix = this.getFullKey("");
      return allKeys
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.substring(prefix.length));
    } catch (error) {
      throw new StorageError(
        `Failed to get keys: ${error}`,
        "KEYS_FAILED",
        "localStorage",
      );
    }
  }

  async getUsage(): Promise<IStorageUsage> {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        // Use modern Storage API if available
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 10 * 1024 * 1024; // Default 10MB

        return {
          used,
          quota,
          percentage: (used / quota) * 100,
          provider: "localStorage",
        };
      } else {
        // Fallback: estimate based on stored data
        const keys = await this.keys();
        let used = 0;

        for (const key of keys) {
          const value = await this.getItem(key);
          if (value) {
            // Approximate storage usage (key + value + overhead)
            used += key.length * 2 + value.length * 2 + 20; // UTF-16 encoding + overhead
          }
        }

        const quota = 5 * 1024 * 1024; // Typical localStorage limit: 5MB

        return {
          used,
          quota,
          percentage: (used / quota) * 100,
          provider: "localStorage",
        };
      }
    } catch (error) {
      throw new StorageError(
        `Failed to get usage: ${error}`,
        "USAGE_FAILED",
        "localStorage",
      );
    }
  }

  private getFullKey(key: string): string {
    return `${this.storageKey}:${key}`;
  }

  private isQuotaExceededError(error: any): boolean {
    return (
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    );
  }

  // Check if localStorage is available
  static isSupported(): boolean {
    try {
      if (typeof localStorage === "undefined") return false;

      const testKey = "__localStorage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
