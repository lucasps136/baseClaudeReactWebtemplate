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

// Minimal type for Supabase query builder chain methods used internally
type SupabaseQueryBuilder = {
  eq(column: string, value: unknown): SupabaseQueryBuilder;
  in(column: string, values: unknown[]): SupabaseQueryBuilder;
  is(column: string, value: null): SupabaseQueryBuilder;
  order(column: string, options: { ascending: boolean }): SupabaseQueryBuilder;
  limit(count: number): SupabaseQueryBuilder;
  range(from: number, to: number): SupabaseQueryBuilder;
};

// Options for selectBy method
interface ISelectByOptions {
  field: string;
  value: unknown;
  options: Omit<IQueryOptions, "where">;
  mapError: (error: unknown) => IDatabaseError;
}

// Options for updateBy method
interface IUpdateByOptions {
  field: string;
  value: unknown;
  data: IUpdateData;
  mapError: (error: unknown) => IDatabaseError;
}

export class CrudOperations {
  constructor(private client: SupabaseClient) {}

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

  // SRP: Apply where conditions to query
  private applyWhereConditions<Q extends SupabaseQueryBuilder>(
    query: Q,
    where: IQueryOptions["where"],
  ): Q {
    if (!where) return query;

    let result = query;
    Object.entries(where).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        result = (result as SupabaseQueryBuilder).in(key, value) as Q;
      } else if (value === null) {
        result = (result as SupabaseQueryBuilder).is(key, null) as Q;
      } else {
        result = (result as SupabaseQueryBuilder).eq(key, value) as Q;
      }
    });

    return result;
  }

  // SRP: Apply ordering to query
  private applyOrdering<Q extends SupabaseQueryBuilder>(
    query: Q,
    orderBy: IQueryOptions["orderBy"],
  ): Q {
    if (!orderBy) return query;

    let result = query;
    orderBy.forEach(({ column, ascending = true }) => {
      result = (result as SupabaseQueryBuilder).order(column, {
        ascending,
      }) as Q;
    });

    return result;
  }

  // SRP: Apply pagination to query
  private applyPagination<Q extends SupabaseQueryBuilder>(
    query: Q,
    limit: number | undefined,
    offset: number | undefined,
  ): Q {
    let result = query;
    if (limit) {
      result = (result as SupabaseQueryBuilder).limit(limit) as Q;
    }
    if (offset) {
      result = (result as SupabaseQueryBuilder).range(
        offset,
        offset + (limit || 1000) - 1,
      ) as Q;
    }
    return result;
  }

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

      query = this.applyWhereConditions(query, options.where);
      query = this.applyOrdering(query, options.orderBy);
      query = this.applyPagination(query, options.limit, options.offset);

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
    selectOptions: ISelectByOptions,
  ): Promise<IDatabaseResponse<T[]>> {
    const { field, value, options, mapError } = selectOptions;
    return this.select<T>(
      table,
      {
        ...options,
        where: { [field]: value },
      },
      mapError,
    );
  }

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
    updateOptions: IUpdateByOptions,
  ): Promise<IDatabaseResponse<T[]>> {
    const { field, value, data, mapError } = updateOptions;
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
