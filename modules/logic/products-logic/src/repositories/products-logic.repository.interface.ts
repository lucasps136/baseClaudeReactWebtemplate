import type {
  ProductsLogicItem,
  CreateProductsLogicInput,
  UpdateProductsLogicInput,
} from "../types";

/**
 * Repository interface for ProductsLogic data access
 */
export interface IProductsLogicRepository {
  findById(id: string): Promise<ProductsLogicItem | null>;
  findMany(): Promise<ProductsLogicItem[]>;
  create(input: CreateProductsLogicInput): Promise<ProductsLogicItem>;
  update(
    id: string,
    input: UpdateProductsLogicInput,
  ): Promise<ProductsLogicItem>;
  delete(id: string): Promise<void>;
}
