/**
 * Orders Validation Module
 * Bebarter Modular Architecture
 *
 * Zod schemas and validation helpers for order operations.
 * Follows Interface Segregation Principle with specific validation contracts.
 */

import { z } from "zod";
import type {
  CreateOrderDTO,
  UpdateOrderDTO,
  UpdateOrderStatusDTO,
  OrderFilters,
  ShippingAddress,
} from "../types";

// =============================================================================
// VALIDATION INTERFACE
// =============================================================================

/**
 * Interface for order validation operations.
 * Allows custom validation implementations.
 */
export interface IOrdersValidation {
  validateCreateOrder(data: unknown): CreateOrderDTO;
  validateUpdateOrder(data: unknown): UpdateOrderDTO;
  validateUpdateStatus(data: unknown): UpdateOrderStatusDTO;
  validateFilters(data: unknown): OrderFilters;
  validateShippingAddress(data: unknown): ShippingAddress;
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/** Shipping address schema */
export const shippingAddressSchema = z.object({
  street: z.string().min(3, "Street must have at least 3 characters").max(255),
  number: z.string().min(1, "Number is required").max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(2, "Neighborhood is required").max(100),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(50),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "Invalid ZIP code format"),
  country: z.string().min(2).max(50).default("Brasil"),
});

/** Create order schema */
export const createOrderSchema = z
  .object({
    buyerId: z.string().uuid("Invalid buyer ID"),
    sellerId: z.string().uuid("Invalid seller ID"),
    productId: z.string().uuid("Invalid product ID"),
    quantity: z.number().int().positive("Quantity must be positive").default(1),
    unitPrice: z.number().positive("Unit price must be positive"),
    currency: z.enum(["BRL", "USD", "EUR", "GBP"]).default("BRL"),
    shippingAddress: shippingAddressSchema.optional(),
    notes: z.string().max(1000).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((data) => data.buyerId !== data.sellerId, {
    message: "Buyer and seller cannot be the same",
    path: ["sellerId"],
  });

/** Update order schema */
export const updateOrderSchema = z.object({
  quantity: z.number().int().positive("Quantity must be positive").optional(),
  shippingAddress: shippingAddressSchema.optional(),
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Update order status schema */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  notes: z.string().max(500).optional(),
});

/** Order filters schema */
export const orderFiltersSchema = z
  .object({
    buyerId: z.string().uuid().optional(),
    sellerId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    status: z
      .union([
        z.enum([
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ]),
        z.array(
          z.enum([
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
          ]),
        ),
      ])
      .optional(),
    paymentStatus: z
      .union([
        z.enum(["pending", "paid", "failed", "refunded"]),
        z.array(z.enum(["pending", "paid", "failed", "refunded"])),
      ])
      .optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    search: z.string().max(100).optional(),
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
  );

// =============================================================================
// VALIDATION CLASS
// =============================================================================

/**
 * Orders validation implementation using Zod schemas.
 */
export class OrdersValidation implements IOrdersValidation {
  /**
   * Validate create order data
   */
  validateCreateOrder(data: unknown): CreateOrderDTO {
    return createOrderSchema.parse(data);
  }

  /**
   * Validate update order data
   */
  validateUpdateOrder(data: unknown): UpdateOrderDTO {
    return updateOrderSchema.parse(data);
  }

  /**
   * Validate update status data
   */
  validateUpdateStatus(data: unknown): UpdateOrderStatusDTO {
    return updateOrderStatusSchema.parse(data);
  }

  /**
   * Validate filter parameters
   */
  validateFilters(data: unknown): OrderFilters {
    return orderFiltersSchema.parse(data) as OrderFilters;
  }

  /**
   * Validate shipping address
   */
  validateShippingAddress(data: unknown): ShippingAddress {
    return shippingAddressSchema.parse(data);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate order creation data
 * @throws ZodError if validation fails
 */
export function validateCreateOrder(data: unknown): CreateOrderDTO {
  return createOrderSchema.parse(data);
}

/**
 * Validate order update data
 * @throws ZodError if validation fails
 */
export function validateUpdateOrder(data: unknown): UpdateOrderDTO {
  return updateOrderSchema.parse(data);
}

/**
 * Validate order status update
 * @throws ZodError if validation fails
 */
export function validateUpdateStatus(data: unknown): UpdateOrderStatusDTO {
  return updateOrderStatusSchema.parse(data);
}

/**
 * Validate order filters
 * @throws ZodError if validation fails
 */
export function validateFilters(data: unknown): OrderFilters {
  return orderFiltersSchema.parse(data) as OrderFilters;
}

/**
 * Safe validation (returns result instead of throwing)
 */
export function safeValidateCreateOrder(data: unknown) {
  return createOrderSchema.safeParse(data);
}

export function safeValidateUpdateOrder(data: unknown) {
  return updateOrderSchema.safeParse(data);
}

export function safeValidateFilters(data: unknown) {
  return orderFiltersSchema.safeParse(data);
}
