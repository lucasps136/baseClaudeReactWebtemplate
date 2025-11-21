// Cross-Tab Synchronization Service
// Uses BroadcastChannel API for secure cross-tab communication

import type {
  ICrossTabMessage,
  IStorageEvent,
  StorageEventCallback,
} from "./storage.types";

export class CrossTabSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<StorageEventCallback>();

  constructor(private channelName: string = "bebarter-storage-sync") {
    this.initializeChannel();
  }

  // Subscribe to storage events
  subscribe(callback: StorageEventCallback): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Broadcast storage change to other tabs
  broadcast<T>(event: IStorageEvent<T>): void {
    if (!this.channel || event.source === "remote") {
      // Don't broadcast remote events to avoid loops
      return;
    }

    try {
      const message: ICrossTabMessage<T> = {
        type: "storage-change",
        key: event.key,
        value: event.newValue,
        timestamp: event.timestamp,
        signature: this.createSignature(event),
      };

      this.channel.postMessage(message);
    } catch (error) {
      console.warn("Failed to broadcast storage change:", error);
    }
  }

  // Cleanup resources
  cleanup(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }

  private initializeChannel(): void {
    if (!this.isSupported()) {
      console.warn("BroadcastChannel not supported, cross-tab sync disabled");
      return;
    }

    try {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.addEventListener("message", this.handleMessage.bind(this));
    } catch (error) {
      console.warn("Failed to initialize BroadcastChannel:", error);
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = event.data as ICrossTabMessage;

      if (message.type !== "storage-change") {
        return;
      }

      // Validate message authenticity
      if (!this.validateMessage(message)) {
        console.warn("Invalid cross-tab message received");
        return;
      }

      // Create storage event for listeners
      const storageEvent: IStorageEvent = {
        key: message.key,
        oldValue: null, // We don't track old values in cross-tab messages
        newValue: message.value,
        timestamp: message.timestamp,
        provider: "localStorage", // Assume localStorage for cross-tab sync
        source: "remote",
      };

      // Notify all listeners
      this.notifyListeners(storageEvent);
    } catch (error) {
      console.warn("Failed to handle cross-tab message:", error);
    }
  }

  private notifyListeners<T>(event: IStorageEvent<T>): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("Storage event listener failed:", error);
      }
    }
  }

  private createSignature<T>(event: IStorageEvent<T>): string {
    // Simple signature for message authenticity
    // In production, you might want to use HMAC or similar
    const data = `${event.key}:${JSON.stringify(event.newValue)}:${event.timestamp}`;
    return btoa(data).slice(0, 16); // Simple hash-like signature
  }

  private validateMessage<T>(message: ICrossTabMessage<T>): boolean {
    try {
      // Basic validation
      if (!message.key || typeof message.timestamp !== "number") {
        return false;
      }

      // Check timestamp is recent (within 5 seconds)
      const now = Date.now();
      if (Math.abs(now - message.timestamp) > 5000) {
        return false;
      }

      // Validate signature if present
      if (message.signature) {
        const expectedSignature = this.createSignature({
          key: message.key,
          oldValue: null,
          newValue: message.value,
          timestamp: message.timestamp,
          provider: "localStorage",
          source: "local",
        });
        return message.signature === expectedSignature;
      }

      return true;
    } catch {
      return false;
    }
  }

  // Check if BroadcastChannel is supported
  private isSupported(): boolean {
    return typeof BroadcastChannel !== "undefined";
  }

  // Static method to check support
  static isSupported(): boolean {
    return typeof BroadcastChannel !== "undefined";
  }
}
