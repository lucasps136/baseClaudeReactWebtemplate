// Encryption Service
// Secure client-side encryption using Web Crypto API

import type {
  IEncryptionService,
  IEncryptedData,
  IEncryptionConfig,
} from "./storage.types";
import { EncryptionError } from "./storage.types";

export class EncryptionService implements IEncryptionService {
  private keys = new Map<string, CryptoKey>();
  private readonly config: IEncryptionConfig = {
    algorithm: "AES-GCM",
    keyLength: 256,
    ivLength: 12,
    tagLength: 16,
  };

  // eslint-disable-next-line max-lines-per-function -- Complex encryption with salt generation and encoding
  async encrypt(
    data: string,
    keyId: string = "default",
  ): Promise<IEncryptedData> {
    try {
      // Get or generate encryption key
      let key = await this.getKey(keyId);
      if (!key) {
        key = await this.generateKey(keyId);
      }

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength));

      // Encrypt the data
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv,
          tagLength: this.config.tagLength * 8, // Convert to bits
        },
        key,
        encodedData,
      );

      // Convert to base64 for storage
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const encryptedBase64 = this.arrayBufferToBase64(encryptedArray.buffer);
      const ivBase64 = this.arrayBufferToBase64(iv.buffer);

      return {
        data: encryptedBase64,
        iv: ivBase64,
        keyId,
      };
    } catch (error) {
      throw new EncryptionError(`Failed to encrypt data: ${error}`, "encrypt");
    }
  }

  // eslint-disable-next-line max-lines-per-function -- Complex decryption with validation and error handling
  async decrypt(
    encryptedData: IEncryptedData,
    keyId?: string,
  ): Promise<string> {
    try {
      const effectiveKeyId = keyId || encryptedData.keyId || "default";

      // Get encryption key
      const key = await this.getKey(effectiveKeyId);
      if (!key) {
        throw new EncryptionError(
          `Encryption key not found: ${effectiveKeyId}`,
          "decrypt",
        );
      }

      // Convert from base64
      const encryptedBytes = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.config.algorithm,
          iv: iv,
          tagLength: this.config.tagLength * 8, // Convert to bits
        },
        key,
        encryptedBytes,
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      throw new EncryptionError(`Failed to decrypt data: ${error}`, "decrypt");
    }
  }

  async generateKey(keyId: string): Promise<CryptoKey> {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: this.config.algorithm,
          length: this.config.keyLength,
        },
        false, // Not extractable for security
        ["encrypt", "decrypt"],
      );

      this.keys.set(keyId, key);
      return key;
    } catch (error) {
      throw new EncryptionError(`Failed to generate key: ${error}`, "encrypt");
    }
  }

  async getKey(keyId: string): Promise<CryptoKey | null> {
    return this.keys.get(keyId) || null;
  }

  // Utility methods
  private arrayBufferToBase64(buffer: ArrayBufferLike): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Check if Web Crypto API is available
  static isSupported(): boolean {
    return (
      typeof crypto !== "undefined" &&
      crypto.subtle !== undefined &&
      typeof crypto.getRandomValues === "function"
    );
  }
}
