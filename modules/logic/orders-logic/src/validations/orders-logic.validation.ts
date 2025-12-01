import type { CreateOrdersLogicInput, UpdateOrdersLogicInput } from "../types";

export interface IOrdersLogicValidation {
  validateCreateInput(input: CreateOrdersLogicInput): Promise<void>;
  validateUpdateInput(input: UpdateOrdersLogicInput): Promise<void>;
}

export class OrdersLogicValidation implements IOrdersLogicValidation {
  async validateCreateInput(input: CreateOrdersLogicInput): Promise<void> {
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

  async validateUpdateInput(input: UpdateOrdersLogicInput): Promise<void> {
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
