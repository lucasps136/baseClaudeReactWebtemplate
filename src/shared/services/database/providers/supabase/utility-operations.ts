// Utility Operations for Supabase Database Provider
// Single Responsibility: Count, exists, health check, transactions

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  IQueryOptions,
  IDatabaseResponse,
  IDatabaseError,
  ITransactionContext,
} from "@/shared/types/database";

export class UtilityOperations {
  private transactionCounter = 0;

  constructor(private client: SupabaseClient) {}

  // Health check
  async isConnected(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from("_health_check")
        .select("*")
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async getHealth(): Promise<{
    status: "healthy" | "unhealthy";
    details?: unknown;
  }> {
    try {
      const startTime = Date.now();
      const { error } = await this.client
        .from("_health_check")
        .select("*")
        .limit(1);
      const responseTime = Date.now() - startTime;

      if (error && error.code !== "PGRST116") {
        // Table not found é ok para health check
        return {
          status: "unhealthy",
          details: { error: error.message, responseTime },
        };
      }

      return {
        status: "healthy",
        details: { responseTime },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        details: { error: (error as Error).message },
      };
    }
  }

  // Count operations
  async count(
    table: string,
    options: Pick<IQueryOptions, "where">,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<number>> {
    try {
      let query = this.client
        .from(table)
        .select("*", { count: "exact", head: true });

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { count, error } = await query;

      return {
        data: count || 0,
        error: error ? mapError(error) : null,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }

  async exists(
    table: string,
    id: string,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<boolean>> {
    try {
      const { count, error } = await this.client
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("id", id);

      return {
        data: (count || 0) > 0,
        error: error ? mapError(error) : null,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }

  // Raw queries (not supported in Supabase client)
  async query<T = unknown>(
    _sql: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    _params: unknown[], // eslint-disable-line @typescript-eslint/no-unused-vars
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T[]>> {
    try {
      // Supabase não tem execução direta de SQL via JS client
      // Isso seria feito via RPC (stored procedures) ou Edge Functions
      throw new Error(
        "Raw SQL queries are not supported via Supabase client. Use RPC functions instead.",
      );
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }

  // Transactions (simulated with RPC)
  async transaction<T>(
    callback: (ctx: ITransactionContext) => Promise<T>,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T>> {
    try {
      const transactionId = `tx_${++this.transactionCounter}_${Date.now()}`;
      const context: ITransactionContext = {
        id: transactionId,
        isActive: true,
      };

      // Supabase não tem transações diretas no client
      // Alternativas: usar RPC functions ou aceitar que operações são independentes
      const result = await callback(context);

      return {
        data: result,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }
}
