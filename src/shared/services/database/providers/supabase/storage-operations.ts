// Storage Operations for Supabase Database Provider
// Single Responsibility: File storage operations

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  IDatabaseResponse,
  IDatabaseError,
} from "@/shared/types/database";

export class StorageOperations {
  constructor(private client: SupabaseClient) {}

  async uploadFile(
    bucket: string,
    path: string,
    file: File | Buffer,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<{ path: string; url: string }>> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file);

      if (error) {
        return {
          data: null,
          error: mapError(error),
        };
      }

      const {
        data: { publicUrl },
      } = this.client.storage.from(bucket).getPublicUrl(path);

      return {
        data: {
          path: data.path,
          url: publicUrl,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }

  async downloadFile(
    bucket: string,
    path: string,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<{ data: Blob; url: string }>> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .download(path);

      if (error) {
        return {
          data: null,
          error: mapError(error),
        };
      }

      const {
        data: { publicUrl },
      } = this.client.storage.from(bucket).getPublicUrl(path);

      return {
        data: {
          data: data as Blob,
          url: publicUrl,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }

  async deleteFile(
    bucket: string,
    path: string,
    mapError: (error: unknown) => IDatabaseError,
  ): Promise<IDatabaseResponse<void>> {
    try {
      const { error } = await this.client.storage.from(bucket).remove([path]);

      return {
        data: error ? null : undefined,
        error: error ? mapError(error) : null,
      };
    } catch (error) {
      return {
        data: null,
        error: mapError(error),
      };
    }
  }
}
