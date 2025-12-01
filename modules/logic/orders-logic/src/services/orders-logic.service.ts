import type {
  OrdersLogicItem,
  CreateOrdersLogicInput,
  UpdateOrdersLogicInput,
} from "../types";
import type { IOrdersLogicRepository } from "../repositories/orders-logic.repository.interface";
import type { IOrdersLogicValidation } from "../validations/orders-logic.validation";

/**
 * OrdersLogicService - Business logic following SOLID principles
 */
export class OrdersLogicService {
  constructor(
    private repository: IOrdersLogicRepository,
    private validation: IOrdersLogicValidation,
  ) {}

  async getById(id: string): Promise<OrdersLogicItem | null> {
    if (!id) throw new Error("ID is required");
    return this.repository.findById(id);
  }

  async getAll(): Promise<OrdersLogicItem[]> {
    return this.repository.findMany();
  }

  async create(input: CreateOrdersLogicInput): Promise<OrdersLogicItem> {
    await this.validation.validateCreateInput(input);
    return this.repository.create(input);
  }

  async update(
    id: string,
    input: UpdateOrdersLogicInput,
  ): Promise<OrdersLogicItem> {
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
