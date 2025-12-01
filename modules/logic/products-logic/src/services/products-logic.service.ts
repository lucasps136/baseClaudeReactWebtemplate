import type {
  ProductsLogicItem,
  CreateProductsLogicInput,
  UpdateProductsLogicInput,
} from "../types";
import type { IProductsLogicRepository } from "../repositories/products-logic.repository.interface";
import type { IProductsLogicValidation } from "../validations/products-logic.validation";

/**
 * ProductsLogicService - Business logic following SOLID principles
 */
export class ProductsLogicService {
  constructor(
    private repository: IProductsLogicRepository,
    private validation: IProductsLogicValidation,
  ) {}

  async getById(id: string): Promise<ProductsLogicItem | null> {
    if (!id) throw new Error("ID is required");
    return this.repository.findById(id);
  }

  async getAll(): Promise<ProductsLogicItem[]> {
    return this.repository.findMany();
  }

  async create(input: CreateProductsLogicInput): Promise<ProductsLogicItem> {
    await this.validation.validateCreateInput(input);
    return this.repository.create(input);
  }

  async update(
    id: string,
    input: UpdateProductsLogicInput,
  ): Promise<ProductsLogicItem> {
    if (!id) throw new Error("ID is required");

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Item not found");
    }

    await this.validation.validateUpdateInput(input);
    return this.repository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error("ID is required");

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Item not found");
    }

    await this.repository.delete(id);
  }
}
