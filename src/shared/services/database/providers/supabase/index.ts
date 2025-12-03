// Supabase Database Provider - Modular Implementation
// Main provider class that composes all operations

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getEnv } from "@/config/env";
import type {
  IDatabaseProvider,
  IDatabaseRecord,
  IQueryOptions,
  IInsertData,
  IUpdateData,
  IUpsertData,
  IDatabaseResponse,
  IDatabaseError,
  ITransactionContext,
  IRealtimeSubscription,
  RealtimeCallback,
} from "@/shared/types/database";

import { CrudOperations } from "./crud-operations";
import { RealtimeHandler } from "./realtime-handler";
import { StorageOperations } from "./storage-operations";
import { UtilityOperations } from "./utility-operations";

export class SupabaseDatabaseProvider implements IDatabaseProvider {
  private client: SupabaseClient;
  private adminClient?: SupabaseClient;

  // Composed operations
  private crud: CrudOperations;
  private realtime: RealtimeHandler;
  private storage: StorageOperations;
  private utilities: UtilityOperations;

  constructor() {
    const env = getEnv();

    // Client principal (com auth context)
    this.client = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    // Admin client (para operações privilegiadas)
    this.adminClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Initialize composed operations
    this.crud = new CrudOperations(this.client);
    this.realtime = new RealtimeHandler(this.client);
    this.storage = new StorageOperations(this.client);
    this.utilities = new UtilityOperations(this.client);
  }

  // Delegate to composed operations
  async isConnected(): Promise<boolean> {
    return this.utilities.isConnected();
  }

  async getHealth(): Promise<{
    status: "healthy" | "unhealthy";
    details?: unknown;
  }> {
    return this.utilities.getHealth();
  }

  async insert<T extends IDatabaseRecord>(
    table: string,
    data: IInsertData | IInsertData[],
  ): Promise<IDatabaseResponse<T[]>> {
    return this.crud.insert<T>(table, data, this.mapSupabaseError);
  }

  async select<T extends IDatabaseRecord>(
    table: string,
    options: IQueryOptions = {},
  ): Promise<IDatabaseResponse<T[]>> {
    return this.crud.select<T>(table, options, this.mapSupabaseError);
  }

  async selectOne<T extends IDatabaseRecord>(
    table: string,
    id: string,
  ): Promise<IDatabaseResponse<T>> {
    return this.crud.selectOne<T>(table, id, this.mapSupabaseError);
  }

  async selectBy<T extends IDatabaseRecord>(
    table: string,
    field: string,
    value: unknown,
    options: Omit<IQueryOptions, "where"> = {},
  ): Promise<IDatabaseResponse<T[]>> {
    return this.crud.selectBy<T>(table, {
      field,
      value,
      options,
      mapError: this.mapSupabaseError,
    });
  }

  async update<T extends IDatabaseRecord>(
    table: string,
    id: string,
    data: IUpdateData,
  ): Promise<IDatabaseResponse<T>> {
    return this.crud.update<T>(table, id, data, this.mapSupabaseError);
  }

  async updateBy<T extends IDatabaseRecord>(
    table: string,
    field: string,
    value: unknown,
    data: IUpdateData,
  ): Promise<IDatabaseResponse<T[]>> {
    return this.crud.updateBy<T>(table, {
      field,
      value,
      data,
      mapError: this.mapSupabaseError,
    });
  }

  async delete<T extends IDatabaseRecord>(
    table: string,
    id: string,
  ): Promise<IDatabaseResponse<T>> {
    return this.crud.delete<T>(table, id, this.mapSupabaseError);
  }

  async deleteBy<T extends IDatabaseRecord>(
    table: string,
    field: string,
    value: unknown,
  ): Promise<IDatabaseResponse<T[]>> {
    return this.crud.deleteBy<T>(table, field, value, this.mapSupabaseError);
  }

  async upsert<T extends IDatabaseRecord>(
    table: string,
    data: IUpsertData | IUpsertData[],
    conflictColumns: string[] = ["id"],
  ): Promise<IDatabaseResponse<T[]>> {
    return this.crud.upsert<T>(
      table,
      data,
      conflictColumns,
      this.mapSupabaseError,
    );
  }

  async query<T = unknown>(
    sql: string,
    params: unknown[] = [],
  ): Promise<IDatabaseResponse<T[]>> {
    return this.utilities.query<T>(sql, params, this.mapSupabaseError);
  }

  async transaction<T>(
    callback: (ctx: ITransactionContext) => Promise<T>,
  ): Promise<IDatabaseResponse<T>> {
    return this.utilities.transaction<T>(callback, this.mapSupabaseError);
  }

  async subscribe<T = unknown>(
    table: string,
    callback: RealtimeCallback<T>,
    options: { event?: "INSERT" | "UPDATE" | "DELETE" | "*" } = {},
  ): Promise<IRealtimeSubscription> {
    return this.realtime.subscribe<T>(table, callback, options);
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    return this.realtime.unsubscribe(subscriptionId);
  }

  async count(
    table: string,
    options: Pick<IQueryOptions, "where"> = {},
  ): Promise<IDatabaseResponse<number>> {
    return this.utilities.count(table, options, this.mapSupabaseError);
  }

  async exists(table: string, id: string): Promise<IDatabaseResponse<boolean>> {
    return this.utilities.exists(table, id, this.mapSupabaseError);
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: File | Buffer,
  ): Promise<IDatabaseResponse<{ path: string; url: string }>> {
    return this.storage.uploadFile(bucket, path, file, this.mapSupabaseError);
  }

  async downloadFile(
    bucket: string,
    path: string,
  ): Promise<IDatabaseResponse<{ data: Blob; url: string }>> {
    return this.storage.downloadFile(bucket, path, this.mapSupabaseError);
  }

  async deleteFile(
    bucket: string,
    path: string,
  ): Promise<IDatabaseResponse<void>> {
    return this.storage.deleteFile(bucket, path, this.mapSupabaseError);
  }

  async initialize(): Promise<void> {
    const health = await this.getHealth();
    if (health.status === "unhealthy") {
      console.warn("Supabase connection is unhealthy:", health.details);
    }
  }

  async cleanup(): Promise<void> {
    await this.realtime.cleanup();
  }

  // Mapper para erros (Single Responsibility)
  private mapSupabaseError = (error: unknown): IDatabaseError => {
    const errorObj = error as {
      code?: string;
      error_code?: string;
      message?: string;
      hint?: string;
    };

    return {
      code: errorObj.code || errorObj.error_code || "unknown_error",
      message: errorObj.message || "An unknown database error occurred",
      details: error,
      hint: errorObj.hint,
    };
  };
}

// Re-export all components
export { CrudOperations } from "./crud-operations";
export { RealtimeHandler } from "./realtime-handler";
export { StorageOperations } from "./storage-operations";
export { UtilityOperations } from "./utility-operations";
