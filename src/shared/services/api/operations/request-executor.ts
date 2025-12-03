// Request Execution Logic
// Single Responsibility: Execute HTTP requests with timeout and error handling

import type { IApiRequest, IApiResponse } from "../api.types";
import { TimeoutError, NetworkError } from "../api.types";

interface IErrorResponse {
  error: string;
  message: string;
  status: number;
  statusText: string;
}

export class RequestExecutor {
  async execute<T>(request: IApiRequest): Promise<IApiResponse<T>> {
    const { url, timeout, signal } = request;

    // Setup abort controller for timeout
    const { controller, timeoutId } = this.setupTimeoutController(timeout);

    try {
      // Prepare and execute fetch request
      const fetchOptions = this.prepareFetchOptions(
        request,
        signal || controller.signal,
      );
      const response = await fetch(url, fetchOptions);

      // Clear timeout and process response
      if (timeoutId) clearTimeout(timeoutId);

      return await this.processSuccessfulResponse<T>(response, request);
    } catch (error) {
      // Clear timeout and handle errors
      if (timeoutId) clearTimeout(timeoutId);
      throw this.handleExecutionError(error, request, timeout, signal);
    }
  }

  private setupTimeoutController(timeout?: number): {
    controller: AbortController;
    timeoutId: NodeJS.Timeout | null;
  } {
    const controller = new AbortController();
    const timeoutId = timeout
      ? setTimeout(() => controller.abort(), timeout)
      : null;

    return { controller, timeoutId };
  }

  private prepareFetchOptions(
    request: IApiRequest,
    finalSignal: AbortSignal,
  ): RequestInit {
    const { method, headers, body, cache, credentials } = request;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: finalSignal,
      cache,
      credentials,
    };

    // Add body for methods that support it
    if (body !== undefined && ["POST", "PUT", "PATCH"].includes(method)) {
      this.addBodyToFetchOptions(fetchOptions, body);
    }

    return fetchOptions;
  }

  private addBodyToFetchOptions(
    fetchOptions: RequestInit,
    body: unknown,
  ): void {
    if (body instanceof FormData) {
      // Remove Content-Type header for FormData (browser will set it)
      delete (fetchOptions.headers as Record<string, string>)["Content-Type"];
      fetchOptions.body = body;
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  private async processSuccessfulResponse<T>(
    response: Response,
    request: IApiRequest,
  ): Promise<IApiResponse<T>> {
    // Check if response is ok based on custom validator or default
    const validateStatus = this.getValidateStatusFunction(request);
    if (!validateStatus(response.status)) {
      throw await this.createApiError(response, request);
    }

    // Parse response data
    const data = await this.parseResponseData<T>(response);

    // Create IApiResponse
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: request,
    };
  }

  // eslint-disable-next-line complexity
  private handleExecutionError(
    error: unknown,
    request: IApiRequest,
    timeout?: number,
    signal?: AbortSignal,
  ): Error {
    // Already an ApiError - return as-is
    if (error instanceof Error && "isApiError" in error) {
      return error;
    }

    // Timeout/Abort error
    if (error instanceof DOMException && error.name === "AbortError") {
      if (timeout && !signal) {
        return new TimeoutError(timeout, request);
      }
    }

    // Network/Fetch error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return new NetworkError(error.message, request);
    }

    // Generic error - wrap in NetworkError
    return new NetworkError(`Request failed: ${error}`, request);
  }

  private async parseResponseData<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      try {
        return (await response.json()) as T;
      } catch {
        // If JSON parsing fails, return text
        return (await response.text()) as unknown as T;
      }
    }

    if (contentType?.includes("text/")) {
      return (await response.text()) as unknown as T;
    }

    // For other content types, try to parse as text
    try {
      return (await response.text()) as unknown as T;
    } catch {
      return null as unknown as T;
    }
  }

  private async createApiError(
    response: Response,
    request: IApiRequest,
  ): Promise<Error> {
    const { ApiError } = await import("../api.types");
    const errorResponse = await this.parseErrorResponse(response);

    return new ApiError(
      errorResponse.message ||
        `HTTP ${response.status}: ${response.statusText}`,
      {
        status: response.status,
        statusText: response.statusText,
        response: errorResponse,
        request,
      },
    );
  }

  private async parseErrorResponse(
    response: Response,
  ): Promise<IErrorResponse | Record<string, unknown>> {
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return (await response.json()) as Record<string, unknown>;
      }

      return await this.createTextErrorResponse(response);
    } catch {
      return this.createDefaultErrorResponse(response);
    }
  }

  private async createTextErrorResponse(
    response: Response,
  ): Promise<IErrorResponse> {
    return {
      error: response.statusText,
      message: (await response.text()) || response.statusText,
      status: response.status,
      statusText: response.statusText,
    };
  }

  private createDefaultErrorResponse(response: Response): IErrorResponse {
    return {
      error: response.statusText,
      message: response.statusText,
      status: response.status,
      statusText: response.statusText,
    };
  }

  private getValidateStatusFunction(
    request: IApiRequest,
  ): (status: number) => boolean {
    // Check if request config has custom validateStatus
    const requestWithValidation = request as IApiRequest & {
      validateStatus?: (status: number) => boolean;
    };
    const customValidateStatus = requestWithValidation.validateStatus;
    if (customValidateStatus && typeof customValidateStatus === "function") {
      return customValidateStatus;
    }

    // Default: 200-299 are successful
    return (status: number) => status >= 200 && status < 300;
  }
}
