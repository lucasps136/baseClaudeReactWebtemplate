import { z } from "zod";
import type {
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters,
} from "../types";

/**
 * Validation interface for product operations
 * Implementations can use Zod, Yup, or custom validation
 */
export interface IProductsValidation {
  validateCreateInput(input: CreateProductDTO): Promise<void>;
  validateUpdateInput(input: UpdateProductDTO): Promise<void>;
  validateFilters(filters: ProductFilters): Promise<void>;
}

/**
 * Zod schema for product creation
 * Enforces database constraints and business rules
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  description: z.string().optional(),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(99999999.99, "Price is too large"),
  currency: z.enum(["BRL", "USD", "EUR", "GBP"]).default("BRL"),
  stockQuantity: z
    .number()
    .int("Stock quantity must be an integer")
    .nonnegative("Stock quantity cannot be negative")
    .default(0),
  categoryId: z.string().uuid("Invalid category ID format").optional(),
  sellerId: z.string().uuid("Invalid seller ID format"),
  status: z.enum(["draft", "active", "sold", "archived"]).default("draft"),
  images: z.array(z.string().url("Invalid image URL")).default([]),
  metadata: z.record(z.unknown()).default({}),
});

/**
 * Zod schema for product updates
 * All fields are optional for partial updates
 */
export const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .optional(),
  description: z.string().optional(),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(99999999.99, "Price is too large")
    .optional(),
  currency: z.enum(["BRL", "USD", "EUR", "GBP"]).optional(),
  stockQuantity: z
    .number()
    .int("Stock quantity must be an integer")
    .nonnegative("Stock quantity cannot be negative")
    .optional(),
  categoryId: z.string().uuid("Invalid category ID format").optional(),
  status: z.enum(["draft", "active", "sold", "archived"]).optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Zod schema for product filters
 * Validates filter parameters for listing products
 */
export const productFiltersSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID format").optional(),
  sellerId: z.string().uuid("Invalid seller ID format").optional(),
  status: z.enum(["draft", "active", "sold", "archived"]).optional(),
  minPrice: z
    .number()
    .nonnegative("Minimum price cannot be negative")
    .optional(),
  maxPrice: z
    .number()
    .positive("Maximum price must be greater than 0")
    .optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "price", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z
    .number()
    .int("Limit must be an integer")
    .positive("Limit must be greater than 0")
    .max(100, "Limit cannot exceed 100")
    .optional(),
  offset: z
    .number()
    .int("Offset must be an integer")
    .nonnegative("Offset cannot be negative")
    .optional(),
});

/**
 * Default validation implementation using Zod
 * Can be replaced with custom implementation following IProductsValidation interface
 */
export class ProductsValidation implements IProductsValidation {
  /**
   * Validate product creation input
   * @param input Product creation data
   * @throws Error if validation fails
   */
  async validateCreateInput(input: CreateProductDTO): Promise<void> {
    try {
      createProductSchema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`,
        );
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }
      throw error;
    }
  }

  /**
   * Validate product update input
   * @param input Product update data
   * @throws Error if validation fails
   */
  async validateUpdateInput(input: UpdateProductDTO): Promise<void> {
    try {
      updateProductSchema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`,
        );
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }
      throw error;
    }
  }

  /**
   * Validate product filters
   * @param filters Filter options
   * @throws Error if validation fails
   */
  async validateFilters(filters: ProductFilters): Promise<void> {
    try {
      productFiltersSchema.parse(filters);

      // Additional business rule: maxPrice must be greater than minPrice
      if (
        filters.minPrice &&
        filters.maxPrice &&
        filters.minPrice >= filters.maxPrice
      ) {
        throw new Error("Maximum price must be greater than minimum price");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`,
        );
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }
      throw error;
    }
  }
}

/**
 * Helper function to validate product creation
 * @param input Product creation data
 * @throws Error if validation fails
 */
export async function validateProduct(input: CreateProductDTO): Promise<void> {
  const validator = new ProductsValidation();
  await validator.validateCreateInput(input);
}

/**
 * Helper function to validate product filters
 * @param filters Filter options
 * @throws Error if validation fails
 */
export async function validateFilters(filters: ProductFilters): Promise<void> {
  const validator = new ProductsValidation();
  await validator.validateFilters(filters);
}
