// CRUD Operations for Supabase Database Provider
// Single Responsibility: Create, Read, Update, Delete operations

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  IDatabaseRecord,
  IQueryOptions,
  IInsertData,
  IUpdateData,
  IUpsertData,
  IDatabaseResponse,
  IDatabaseError,
} from "@/shared/types/database";

export class CrudOperations {
  constructor(private client: SupabaseClient) {}

  // Create
  async insert<T extends IDatabaseRecord>(
    table: string,
    data: IInsertData | IInsertData[],
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T[]>> {
    try {
      const {
        data: result,
        error,
        count,
      } = await this.client.from(table).insert(data).select();

      return {
        data: result as T[],
        error: error ? mapError(error) : null,
        count: count ?? undefined,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
        count: undefined,
      };
    }
  }

  // Read
  async select<T extends IDatabaseRecord>(
    table: string,
    options: IQueryOptions,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T[]>> {
    try {
      let query = this.client
        .from(table)
        .select(options.select ? options.select.join(",") : "*", {
          count: "exact",
        });

      // Where conditions
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value === null) {
            query = query.is(key, null);
          } else {
            query = query.eq(key, value);
          }
        });
      }

      // Order by
      if (options.orderBy) {
        options.orderBy.forEach(({ column, ascending = true }) => {
          query = query.order(column, { ascending });
        });
      }

      // Pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 1000) - 1,
        );
      }

      const { data, error, count } = await query;

      return {
        data: error ? null : (data as unknown as T[]),
        error: error ? mapError(error) : null,
        count: count ?? undefined,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
        count: undefined,
      };
    }
  }

  async selectOne<T extends IDatabaseRecord>(
    table: string,
    id: string,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T>> {
    try {
      const { data, error } = await this.client
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

      return {
        data: data as T,
        error: error ? mapError(error) : null,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }

  async selectBy<T extends IDatabaseRecord>(
    table: string,
    field: string,
    value: unknown,
    options: Omit<IQueryOptions, "where">,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T[]>> {
    return this.select<T>(
      table,
      {
        ...options,
        where: { [field]: value },
      },
      mapError,
    );
  }

  // Update
  async update<T extends IDatabaseRecord>(
    table: string,
    id: string,
    data: IUpdateData,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T>> {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      return {
        data: result as T,
        error: error ? mapError(error) : null,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }

  async updateBy<T extends IDatabaseRecord>(
    table: string,
    field: string,
    value: unknown,
    data: IUpdateData,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T[]>> {
    try {
      const {
        data: result,
        error,
        count,
      } = await this.client
        .from(table)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq(field, value)
        .select();

      return {
        data: result as T[],
        error: error ? mapError(error) : null,
        count: count ?? undefined,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
        count: undefined,
      };
    }
  }

  // Delete
  async delete<T extends IDatabaseRecord>(
    table: string,
    id: string,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T>> {
    try {
      const { data, error } = await this.client
        .from(table)
        .delete()
        .eq("id", id)
        .select()
        .single();

      return {
        data: data as T,
        error: error ? mapError(error) : null,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }

  async deleteBy<T extends IDatabaseRecord>(
    table: string,
    field: string,
    value: unknown,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T[]>> {
    try {
      const { data, error, count } = await this.client
        .from(table)
        .delete()
        .eq(field, value)
        .select();

      return {
        data: data as T[],
        error: error ? mapError(error) : null,
        count: count ?? undefined,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
        count: undefined,
      };
    }
  }

  // Upsert
  async upsert<T extends IDatabaseRecord>(
    table: string,
    data: IUpsertData | IUpsertData[],
    conflictColumns: string[],
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<T[]>> {
    try {
      const {
        data: result,
        error,
        count,
      } = await this.client
        .from(table)
        .upsert(data, {
          onConflict: conflictColumns.join(","),
          ignoreDuplicates: false,
        })
        .select();

      return {
        data: result as T[],
        error: error ? mapError(error) : null,
        count: count ?? undefined,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
        count: undefined,
      };
    }
  }
}
