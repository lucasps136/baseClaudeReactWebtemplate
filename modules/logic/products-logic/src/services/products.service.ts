// Products service following SOLID principles
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters,
  PaginatedResult,
} from "../types";
import type { IProductsRepository } from "../repositories/products.repository.interface";
import type { IProductsValidation } from "../validations/products.validation";

/**
 * ProductsService - Single Responsibility Principle
 * Handles only product business logic, delegates data access to repository
 * and validation to validation service
 *
 * Dependency Inversion Principle:
 * Depends on IProductsRepository and IProductsValidation abstractions,
 * not on concrete implementations
 *
 * Open/Closed Principle:
 * Open for extension (via repository/validation interfaces),
 * closed for modification
 *
 * @example
 * ```typescript
 * const productsService = new ProductsService(productsRepository, productsValidation);
 * const products = await productsService.listProducts({ status: 'active' });
 * ```
 */
export class ProductsService {
  constructor(
    private productsRepository: IProductsRepository,
    private productsValidation: IProductsValidation,
  ) {}

  /**
   * List products with optional filters and pagination
   * @param filters Filter criteria for products
   * @returns Paginated result with products
   *
   * @example
   * ```typescript
   * const result = await productsService.listProducts({
   *   status: 'active',
   *   categoryId: '123',
   *   limit: 20,
   *   offset: 0
   * });
   * ```
   */
  async listProducts(
    filters: ProductFilters = {},
  ): Promise<PaginatedResult<Product>> {
    // Validate filters
    await this.productsValidation.validateFilters(filters);

    // Set defaults
    const normalizedFilters: ProductFilters = {
      limit: 20,
      offset: 0,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filters,
    };

    return this.productsRepository.findMany(normalizedFilters);
  }

  /**
   * Get product by ID
   * @param id Product ID
   * @returns Product or null if not found
   * @throws Error if ID is empty
   *
   * @example
   * ```typescript
   * const product = await productsService.getProduct('123');
   * if (!product) {
   *   console.log('Product not found');
   * }
   * ```
   */
  async getProduct(id: string): Promise<Product | null> {
    if (!id) throw new Error("Product ID is required");
    return this.productsRepository.findById(id);
  }

  /**
   * Create new product
   * @param data Product creation data
   * @returns Created product
   * @throws Error if validation fails
   *
   * @example
   * ```typescript
   * const product = await productsService.createProduct({
   *   name: 'New Product',
   *   price: 99.99,
   *   sellerId: 'user-123',
   *   status: 'draft'
   * });
   * ```
   */
  async createProduct(data: CreateProductDTO): Promise<Product> {
    // Validate input
    await this.productsValidation.validateCreateInput(data);

    // Create product via repository
    return this.productsRepository.create(data);
  }

  /**
   * Update existing product
   * @param id Product ID
   * @param data Update data
   * @returns Updated product
   * @throws Error if product not found or validation fails
   *
   * @example
   * ```typescript
   * const updated = await productsService.updateProduct('123', {
   *   price: 89.99,
   *   status: 'active'
   * });
   * ```
   */
  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    if (!id) throw new Error("Product ID is required");

    // Check if product exists
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Validate update data
    await this.productsValidation.validateUpdateInput(data);

    // Update product via repository
    return this.productsRepository.update(id, data);
  }

  /**
   * Delete product
   * @param id Product ID
   * @throws Error if product not found
   *
   * @example
   * ```typescript
   * await productsService.deleteProduct('123');
   * ```
   */
  async deleteProduct(id: string): Promise<void> {
    if (!id) throw new Error("Product ID is required");

    // Check if product exists
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Delete product via repository
    await this.productsRepository.delete(id);
  }

  /**
   * Search products by text query
   * Uses full-text search on name and description
   * @param query Search query string
   * @returns Array of matching products
   * @throws Error if query is empty
   *
   * @example
   * ```typescript
   * const results = await productsService.searchProducts('laptop');
   * ```
   */
  async searchProducts(query: string): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    return this.productsRepository.search(query.trim());
  }

  /**
   * Get products by seller
   * Convenience method for filtering by seller ID
   * @param sellerId Seller user ID
   * @param filters Additional filter options
   * @returns Paginated result with seller's products
   *
   * @example
   * ```typescript
   * const myProducts = await productsService.getProductsBySeller('user-123', {
   *   status: 'active',
   *   limit: 10
   * });
   * ```
   */
  async getProductsBySeller(
    sellerId: string,
    filters: ProductFilters = {},
  ): Promise<PaginatedResult<Product>> {
    if (!sellerId) throw new Error("Seller ID is required");

    return this.listProducts({
      ...filters,
      sellerId,
    });
  }

  /**
   * Get products by category
   * Convenience method for filtering by category ID
   * @param categoryId Category ID
   * @param filters Additional filter options
   * @returns Paginated result with category's products
   *
   * @example
   * ```typescript
   * const categoryProducts = await productsService.getProductsByCategory('cat-123', {
   *   status: 'active',
   *   sortBy: 'price',
   *   sortOrder: 'asc'
   * });
   * ```
   */
  async getProductsByCategory(
    categoryId: string,
    filters: ProductFilters = {},
  ): Promise<PaginatedResult<Product>> {
    if (!categoryId) throw new Error("Category ID is required");

    return this.listProducts({
      ...filters,
      categoryId,
    });
  }

  /**
   * Get products by status
   * Convenience method for filtering by status
   * @param status Product status
   * @param filters Additional filter options
   * @returns Paginated result with products of given status
   *
   * @example
   * ```typescript
   * const activeProducts = await productsService.getProductsByStatus('active');
   * ```
   */
  async getProductsByStatus(
    status: "draft" | "active" | "sold" | "archived",
    filters: ProductFilters = {},
  ): Promise<PaginatedResult<Product>> {
    return this.listProducts({
      ...filters,
      status,
    });
  }
}
