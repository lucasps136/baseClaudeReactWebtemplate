// Product domain types - business logic layer
// Aligned with products data module schema

/**
 * Product status enumeration
 * Matches database constraint: draft | active | sold | archived
 */
export type ProductStatus = "draft" | "active" | "sold" | "archived";

/**
 * Supported currency codes
 * Matches database constraint: BRL | USD | EUR | GBP
 */
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

/**
 * Product domain entity
 * Represents a product in the marketplace
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  stockQuantity: number;
  categoryId?: string;
  sellerId: string;
  status: ProductStatus;
  images: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new product
 * Required fields for product creation
 */
export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  currency?: Currency;
  stockQuantity?: number;
  categoryId?: string;
  sellerId: string;
  status?: ProductStatus;
  images?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating an existing product
 * All fields are optional for partial updates
 */
export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  currency?: Currency;
  stockQuantity?: number;
  categoryId?: string;
  status?: ProductStatus;
  images?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Filter options for product listing
 * Supports filtering by category, seller, status, and price range
 */
export interface ProductFilters {
  categoryId?: string;
  sellerId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Paginated result wrapper
 * Generic type for paginated responses
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
