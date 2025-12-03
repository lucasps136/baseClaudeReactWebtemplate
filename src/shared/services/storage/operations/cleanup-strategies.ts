// Cleanup Strategies for Storage
// Single Responsibility: Storage cleanup operations

import { z } from "zod";

import type {
  ICleanupStrategy,
  IStorageProvider,
  IStorageItem,
  IStorageUsage,
  StorageProviderType,
} from "../storage.types";
import { StorageError } from "../storage.types";

const cleanupStrategySchema = z.object({
  type: z.enum(["lru", "ttl", "percentage", "manual"]),
  maxAge: z.number().positive().optional(),
  maxItems: z.number().positive().optional(),
  targetPercentage: z.number().min(0).max(100).optional(),
  keysToRemove: z.array(z.string()).optional(),
});

export class CleanupStrategies {
  constructor(
    private providers: Map<StorageProviderType, IStorageProvider>,
    private accessTimes: Map<string, number>,
    private getKeys: () => Promise<string[]>,
    private remove: (key: string) => Promise<void>,
  ) {}

  // Main cleanup method
  // eslint-disable-next-line complexity -- Complex cleanup with multiple strategies and quota management
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

  // Get storage usage
  async getUsage(): Promise<IStorageUsage> {
    try {
      const provider = this.providers.get("localStorage");
      if (!provider) {
        throw new Error("localStorage provider not available");
      }
      return await provider.getUsage();
    } catch (error) {
      throw new StorageError(
        `Failed to get storage usage: ${error}`,
        "USAGE_FAILED",
      );
    }
  }

  // Private cleanup methods
  // eslint-disable-next-line complexity -- Complex expiration cleanup with batch processing
  private async cleanupExpired(maxAge?: number): Promise<void> {
    const keys = await this.getKeys();
    const cutoffTime = maxAge ? Date.now() - maxAge : 0;

    for (const key of keys) {
      try {
        const provider = this.providers.get("localStorage");
        if (!provider) continue;

        const rawData = await provider.getItem(key);
        if (!rawData) continue;

        const item = JSON.parse(rawData) as IStorageItem<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const keys = await this.getKeys();
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

  // eslint-disable-next-line max-lines-per-function, complexity -- Complex percentage-based cleanup with sorting and filtering
  private async cleanupByPercentage(targetPercentage: number): Promise<void> {
    const usage = await this.getUsage();
    if (usage.percentage <= targetPercentage) return;

    // Calculate how many items to remove
    const targetUsage = (targetPercentage / 100) * usage.quota;
    const bytesToRemove = usage.used - targetUsage;

    // Remove items using LRU strategy until we reach target
    const keys = await this.getKeys();
    const sortedKeys = keys.sort((a, b) => {
      const timeA = this.accessTimes.get(a) || 0;
      const timeB = this.accessTimes.get(b) || 0;
      return timeA - timeB;
    });

    let removedBytes = 0;
    for (const key of sortedKeys) {
      if (removedBytes >= bytesToRemove) break;

      try {
        const provider = this.providers.get("localStorage");
        if (!provider) continue;

        const rawData = await provider.getItem(key);
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

  private isExpired<T>(item: IStorageItem<T>): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }
}
