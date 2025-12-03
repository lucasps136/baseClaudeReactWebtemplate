// CRUD Operations for Supabase Database Provider
// Single Responsibility: Create, Read, Update, Delete operations

import type {
  SupabaseClient,
  PostgrestFilterBuilder,
} from "@supabase/supabase-js";

import type {
  IDatabaseRecord,
  IQueryOptions,
  IInsertData,
  IUpdateData,
  IUpsertData,
  IDatabaseResponse,
  IDatabaseError,
} from "@/shared/types/database";

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
  private applyWhereConditions<T>(
    query: PostgrestFilterBuilder<T, T[], unknown>,
    where: IQueryOptions["where"],
  ): PostgrestFilterBuilder<T, T[], unknown> {
    if (!where) return query;

    Object.entries(where).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (value === null) {
        query = query.is(key, null);
      } else {
        query = query.eq(key, value);
      }
    });

    return query;
  }

  // SRP: Apply ordering to query
  private applyOrdering<T>(
    query: PostgrestFilterBuilder<T, T[], unknown>,
    orderBy: IQueryOptions["orderBy"],
  ): PostgrestFilterBuilder<T, T[], unknown> {
    if (!orderBy) return query;

    orderBy.forEach(({ column, ascending = true }) => {
      query = query.order(column, { ascending });
    });

    return query;
  }

  // SRP: Apply pagination to query
  private applyPagination<T>(
    query: PostgrestFilterBuilder<T, T[], unknown>,
    limit: number | undefined,
    offset: number | undefined,
  ): PostgrestFilterBuilder<T, T[], unknown> {
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 1000) - 1);
    }
    return query;
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
