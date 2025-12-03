// Secure Storage Operations
// Single Responsibility: Encrypted storage operations

import { EncryptionService } from "../encryption.service";
import { EncryptionError } from "../storage.types";
import type {
  ISecureStorageOptions,
  ISecureStorageItem,
} from "../storage.types";

import type { CoreOperations } from "./core-operations";

export class SecureOperations {
  constructor(
    private encryptionService: EncryptionService,
    private coreOps: CoreOperations,
  ) {}

  // eslint-disable-next-line max-lines-per-function -- Complex secure storage with encryption and validation
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
      await this.coreOps.set(`secure:${key}`, secureItem, {
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

  // eslint-disable-next-line complexity -- Complex secure retrieval with decryption and validation
  async getSecure<T>(key: string, defaultValue?: T): Promise<T | null> {
    if (!EncryptionService.isSupported()) {
      throw new EncryptionError("Web Crypto API not supported", "decrypt");
    }

    try {
      const secureItem = await this.coreOps.get<ISecureStorageItem>(
        `secure:${key}`,
      );
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
}
