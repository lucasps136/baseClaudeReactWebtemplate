// Session Storage Provider
// Implements IStorageProvider interface for sessionStorage

import type { IStorageProvider, IStorageUsage } from "../storage.types";
import { StorageError, StorageQuotaError } from "../storage.types";

export class SessionStorageProvider implements IStorageProvider {
  private readonly storageKey = "bebarter-session";

  async setItem(key: string, value: string): Promise<void> {
    try {
      sessionStorage.setItem(this.getFullKey(key), value);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        const usage = await this.getUsage();
        throw new StorageQuotaError(usage.used, usage.quota, "sessionStorage");
      }
      throw new StorageError(
        `Failed to set item: ${error}`,
        "SET_FAILED",
        "sessionStorage",
      );
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return sessionStorage.getItem(this.getFullKey(key));
    } catch (error) {
      throw new StorageError(
        `Failed to get item: ${error}`,
        "GET_FAILED",
        "sessionStorage",
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      sessionStorage.removeItem(this.getFullKey(key));
    } catch (error) {
      throw new StorageError(
        `Failed to remove item: ${error}`,
        "REMOVE_FAILED",
        "sessionStorage",
      );
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      for (const key of keys) {
        sessionStorage.removeItem(this.getFullKey(key));
      }
    } catch (error) {
      throw new StorageError(
        `Failed to clear storage: ${error}`,
        "CLEAR_FAILED",
        "sessionStorage",
      );
    }
  }

  async keys(): Promise<string[]> {
    try {
      const allKeys = Object.keys(sessionStorage);
      const prefix = this.getFullKey("");
      return allKeys
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.substring(prefix.length));
    } catch (error) {
      throw new StorageError(
        `Failed to get keys: ${error}`,
        "KEYS_FAILED",
        "sessionStorage",
      );
    }
  }

  async getUsage(): Promise<IStorageUsage> {
    try {
      // sessionStorage typically has the same quota as localStorage
      const keys = await this.keys();
      let used = 0;

      for (const key of keys) {
        const value = await this.getItem(key);
        if (value) {
          // Approximate storage usage (key + value + overhead)
          used += key.length * 2 + value.length * 2 + 20; // UTF-16 encoding + overhead
        }
      }

      const quota = 5 * 1024 * 1024; // Typical sessionStorage limit: 5MB

      return {
        used,
        quota,
        percentage: (used / quota) * 100,
        provider: "sessionStorage",
      };
    } catch (error) {
      throw new StorageError(
        `Failed to get usage: ${error}`,
        "USAGE_FAILED",
        "sessionStorage",
      );
    }
  }

  private getFullKey(key: string): string {
    return `${this.storageKey}:${key}`;
  }

  private isQuotaExceededError(error: unknown): boolean {
    return (
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    );
  }

  // Check if sessionStorage is available
  static isSupported(): boolean {
    try {
      if (typeof sessionStorage === "undefined") return false;

      const testKey = "__sessionStorage_test__";
      sessionStorage.setItem(testKey, "test");
      sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
