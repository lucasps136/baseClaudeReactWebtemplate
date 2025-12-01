import type {
  CreateProductsLogicInput,
  UpdateProductsLogicInput,
} from "../types";

export interface IProductsLogicValidation {
  validateCreateInput(input: CreateProductsLogicInput): Promise<void>;
  validateUpdateInput(input: UpdateProductsLogicInput): Promise<void>;
}

export class ProductsLogicValidation implements IProductsLogicValidation {
  async validateCreateInput(input: CreateProductsLogicInput): Promise<void> {
    const errors: string[] = [];

    if (!input.name) {
      errors.push("Name is required");
    } else if (input.name.length < 2) {
      errors.push("Name must be at least 2 characters");
    } else if (input.name.length > 100) {
      errors.push("Name must be less than 100 characters");
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  }

  async validateUpdateInput(input: UpdateProductsLogicInput): Promise<void> {
    const errors: string[] = [];

    if (input.name !== undefined) {
      if (input.name.length < 2) {
        errors.push("Name must be at least 2 characters");
      } else if (input.name.length > 100) {
        errors.push("Name must be less than 100 characters");
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  }
}
