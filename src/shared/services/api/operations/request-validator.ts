// Request Validation
// Single Responsibility: Validate API requests before execution

import { z } from "zod";

import type { IApiRequest, IValidationService } from "../api.types";

// Validation schemas
const apiRequestSchema = z.object({
  url: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
  timeout: z.number().positive().max(60000).optional(),
  signal: z.instanceof(AbortSignal).optional(),
  cache: z.custom<RequestCache>().optional(),
  credentials: z.custom<RequestCredentials>().optional(),
});

export class RequestValidator {
  constructor(private validationService: IValidationService) {}

  async validate(request: IApiRequest): Promise<void> {
    try {
      await this.validationService.validate(apiRequestSchema, request);
    } catch (error) {
      throw new Error(`Invalid request: ${error}`);
    }
  }
}
