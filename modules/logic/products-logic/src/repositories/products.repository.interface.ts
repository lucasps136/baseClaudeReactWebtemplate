// Interface Segregation - specific interfaces for product data access operations
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters,
  PaginatedResult,
} from "../types";

/**
 * Repository interface for product data access
 * Implementations can be Supabase, Prisma, REST API, etc.
 *
 * Following Dependency Inversion Principle:
 * - ProductsService depends on this abstraction, not on concrete implementations
 *
 * Following Interface Segregation Principle:
 * - Specific interface for product operations only
 */
export interface IProductsRepository {
  /**
   * Find product by ID
   * @param id Product ID
   * @returns Product or null if not found
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Find many products with filters
   * @param filters Filter options for search, sort, pagination
   * @returns Paginated result with products, total count and pagination info
   */
  findMany(filters: ProductFilters): Promise<PaginatedResult<Product>>;

  /**
   * Search products by text query
   * Uses full-text search on name and description
   * @param query Search query string
   * @returns Array of matching products
   */
  search(query: string): Promise<Product[]>;

  /**
   * Create new product
   * @param data Product creation data
   * @returns Created product
   */
  create(data: CreateProductDTO): Promise<Product>;

  /**
   * Update existing product
   * @param id Product ID
   * @param data Update data
   * @returns Updated product
   */
  update(id: string, data: UpdateProductDTO): Promise<Product>;

  /**
   * Delete product
   * @param id Product ID
   */
  delete(id: string): Promise<void>;
}
