// ProductsLogic Logic Module

// Services
export { ProductsLogicService } from "./src/services/products-logic.service";

// Repositories
export type { IProductsLogicRepository } from "./src/repositories/products-logic.repository.interface";

// Validations
export { ProductsLogicValidation } from "./src/validations/products-logic.validation";
export type { IProductsLogicValidation } from "./src/validations/products-logic.validation";

// Types
export type {
  ProductsLogicItem,
  CreateProductsLogicInput,
  UpdateProductsLogicInput,
} from "./src/types";
