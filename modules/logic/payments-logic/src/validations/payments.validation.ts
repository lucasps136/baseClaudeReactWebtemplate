/**
 * Payments Validation Module
 * Bebarter Modular Architecture
 *
 * Zod schemas and validation helpers for payment operations.
 * Follows Interface Segregation Principle with specific validation contracts.
 */

import { z } from "zod";
import type {
  CreatePaymentDTO,
  UpdatePaymentDTO,
  RefundDTO,
  PaymentFilters,
} from "../types";

// =============================================================================
// VALIDATION INTERFACE
// =============================================================================

/**
 * Interface for payment validation operations.
 * Allows custom validation implementations.
 */
export interface IPaymentsValidation {
  validateCreatePayment(data: unknown): CreatePaymentDTO;
  validateUpdatePayment(data: unknown): UpdatePaymentDTO;
  validateRefund(data: unknown): RefundDTO;
  validateFilters(data: unknown): PaymentFilters;
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/** Create payment schema */
export const createPaymentSchema = z
  .object({
    orderId: z.string().uuid("Invalid order ID"),
    payerId: z.string().uuid("Invalid payer ID"),
    payeeId: z.string().uuid("Invalid payee ID"),
    amount: z.number().positive("Amount must be positive"),
    currency: z.enum(["BRL", "USD", "EUR", "GBP"]).default("BRL"),
    paymentMethod: z.enum([
      "credit_card",
      "debit_card",
      "pix",
      "boleto",
      "wallet",
      "bank_transfer",
    ]),
    gateway: z.enum(["stripe", "pagarme", "mercadopago", "internal"]),
    externalId: z.string().max(255).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((data) => data.payerId !== data.payeeId, {
    message: "Payer and payee cannot be the same",
    path: ["payeeId"],
  });

/** Update payment schema */
export const updatePaymentSchema = z.object({
  status: z
    .enum([
      "pending",
      "processing",
      "completed",
      "failed",
      "refunded",
      "cancelled",
    ])
    .optional(),
  externalId: z.string().max(255).optional(),
  gatewayResponse: z.record(z.unknown()).optional(),
  failureReason: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Refund schema */
export const refundSchema = z.object({
  amount: z.number().positive("Refund amount must be positive").optional(),
  reason: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Payment filters schema */
export const paymentFiltersSchema = z
  .object({
    orderId: z.string().uuid().optional(),
    payerId: z.string().uuid().optional(),
    payeeId: z.string().uuid().optional(),
    status: z
      .union([
        z.enum([
          "pending",
          "processing",
          "completed",
          "failed",
          "refunded",
          "cancelled",
        ]),
        z.array(
          z.enum([
            "pending",
            "processing",
            "completed",
            "failed",
            "refunded",
            "cancelled",
          ]),
        ),
      ])
      .optional(),
    paymentMethod: z
      .union([
        z.enum([
          "credit_card",
          "debit_card",
          "pix",
          "boleto",
          "wallet",
          "bank_transfer",
        ]),
        z.array(
          z.enum([
            "credit_card",
            "debit_card",
            "pix",
            "boleto",
            "wallet",
            "bank_transfer",
          ]),
        ),
      ])
      .optional(),
    gateway: z
      .union([
        z.enum(["stripe", "pagarme", "mercadopago", "internal"]),
        z.array(z.enum(["stripe", "pagarme", "mercadopago", "internal"])),
      ])
      .optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().positive().optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    { message: "dateFrom must be before dateTo", path: ["dateTo"] },
  )
  .refine(
    (data) => {
      if (data.minAmount !== undefined && data.maxAmount !== undefined) {
        return data.minAmount <= data.maxAmount;
      }
      return true;
    },
    { message: "minAmount must be less than maxAmount", path: ["maxAmount"] },
  );

// =============================================================================
// VALIDATION CLASS
// =============================================================================

/**
 * Payments validation implementation using Zod schemas.
 */
export class PaymentsValidation implements IPaymentsValidation {
  /**
   * Validate create payment data
   */
  validateCreatePayment(data: unknown): CreatePaymentDTO {
    return createPaymentSchema.parse(data);
  }

  /**
   * Validate update payment data
   */
  validateUpdatePayment(data: unknown): UpdatePaymentDTO {
    return updatePaymentSchema.parse(data);
  }

  /**
   * Validate refund data
   */
  validateRefund(data: unknown): RefundDTO {
    return refundSchema.parse(data);
  }

  /**
   * Validate filter parameters
   */
  validateFilters(data: unknown): PaymentFilters {
    return paymentFiltersSchema.parse(data) as PaymentFilters;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate payment creation data
 * @throws ZodError if validation fails
 */
export function validateCreatePayment(data: unknown): CreatePaymentDTO {
  return createPaymentSchema.parse(data);
}

/**
 * Validate payment update data
 * @throws ZodError if validation fails
 */
export function validateUpdatePayment(data: unknown): UpdatePaymentDTO {
  return updatePaymentSchema.parse(data);
}

/**
 * Validate refund data
 * @throws ZodError if validation fails
 */
export function validateRefund(data: unknown): RefundDTO {
  return refundSchema.parse(data);
}

/**
 * Validate payment filters
 * @throws ZodError if validation fails
 */
export function validateFilters(data: unknown): PaymentFilters {
  return paymentFiltersSchema.parse(data) as PaymentFilters;
}

/**
 * Safe validation (returns result instead of throwing)
 */
export function safeValidateCreatePayment(data: unknown) {
  return createPaymentSchema.safeParse(data);
}

export function safeValidateUpdatePayment(data: unknown) {
  return updatePaymentSchema.safeParse(data);
}

export function safeValidateRefund(data: unknown) {
  return refundSchema.safeParse(data);
}

export function safeValidateFilters(data: unknown) {
  return paymentFiltersSchema.safeParse(data);
}
