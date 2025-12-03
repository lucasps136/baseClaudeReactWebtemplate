// Realtime Handler for Supabase Database Provider
// Single Responsibility: Realtime subscriptions and events

import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

import type {
  IRealtimeSubscription,
  IRealtimeEvent,
  RealtimeCallback,
} from "@/shared/types/database";

export class RealtimeHandler {
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  constructor(private client: SupabaseClient) {}

  async subscribe<T = unknown>(
    table: string,
    callback: RealtimeCallback<T>,
    options: { event?: "INSERT" | "UPDATE" | "DELETE" | "*" } = {},
  ): Promise<IRealtimeSubscription> {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const event = options.event || "*";

    const channel = this.client
      .channel(subscriptionId)
      .on(
        "postgres_changes" as any,
        {
          event,
          schema: "public",
          table,
        } as any,
        (payload: any) => {
          const realtimeEvent: IRealtimeEvent<T> = {
            eventType: payload.eventType as any,
            new: payload.new as T,
            old: payload.old as T,
            table: payload.table,
            schema: payload.schema,
            commit_timestamp: payload.commit_timestamp,
          };
          callback(realtimeEvent);
        },
      )
      .subscribe();

    this.subscriptions.set(subscriptionId, channel);

    return {
      id: subscriptionId,
      table,
      unsubscribe: () => this.unsubscribe(subscriptionId),
    };
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const channel = this.subscriptions.get(subscriptionId);
    if (channel) {
      await this.client.removeChannel(channel);
      this.subscriptions.delete(subscriptionId);
    }
  }

  async cleanup(): Promise<void> {
    for (const [id] of this.subscriptions) {
      await this.unsubscribe(id);
    }
    this.subscriptions.clear();
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}
