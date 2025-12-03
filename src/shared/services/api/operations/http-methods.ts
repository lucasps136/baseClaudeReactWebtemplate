// HTTP Methods Implementation
// Single Responsibility: Provide high-level HTTP method wrappers

import type { IApiRequest, IApiResponse, IRequestConfig } from "../api.types";

import { RequestExecutor } from "./request-executor";

export class HttpMethods {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private executor: RequestExecutor;

  constructor() {
    this.executor = new RequestExecutor();
  }

  async get<T>(url: string, config?: IRequestConfig): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "GET",
      ...this.mergeConfig(config),
    });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "POST",
      body: data,
      ...this.mergeConfig(config),
    });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "PUT",
      body: data,
      ...this.mergeConfig(config),
    });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "PATCH",
      body: data,
      ...this.mergeConfig(config),
    });
  }

  async delete<T>(
    url: string,
    config?: IRequestConfig,
  ): Promise<IApiResponse<T>> {
    return this.request<T>({
      url,
      method: "DELETE",
      ...this.mergeConfig(config),
    });
  }

  async request<T>(request: IApiRequest): Promise<IApiResponse<T>> {
    return this.executor.execute<T>(request);
  }

  private mergeConfig(config?: IRequestConfig): Partial<IApiRequest> {
    if (!config) return {};

    const merged: Partial<IApiRequest> & {
      validateStatus?: (status: number) => boolean;
    } = {
      headers: config.headers,
      timeout: config.timeout || this.DEFAULT_TIMEOUT,
      signal: config.signal,
      cache: config.cache,
      credentials: config.credentials,
    };

    if (config.validateStatus) {
      merged.validateStatus = config.validateStatus;
    }

    return merged;
  }
}
