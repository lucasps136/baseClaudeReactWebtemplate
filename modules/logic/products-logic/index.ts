// Products Logic Module
// Business logic layer for product management following SOLID principles

// Services
export { ProductsService } from "./src/services/products.service";

// Repository Interfaces
export type { IProductsRepository } from "./src/repositories/products.repository.interface";

// Validation
export {
  ProductsValidation,
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
  validateProduct,
  validateFilters,
} from "./src/validations/products.validation";
export type { IProductsValidation } from "./src/validations/products.validation";

// Types
export type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters,
  PaginatedResult,
  ProductStatus,
  Currency,
} from "./src/types";
