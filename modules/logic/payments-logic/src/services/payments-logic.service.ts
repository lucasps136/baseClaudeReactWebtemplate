import type {
  PaymentsLogicItem,
  CreatePaymentsLogicInput,
  UpdatePaymentsLogicInput,
} from "../types";
import type { IPaymentsLogicRepository } from "../repositories/payments-logic.repository.interface";
import type { IPaymentsLogicValidation } from "../validations/payments-logic.validation";

/**
 * PaymentsLogicService - Business logic following SOLID principles
 */
export class PaymentsLogicService {
  constructor(
    private repository: IPaymentsLogicRepository,
    private validation: IPaymentsLogicValidation,
  ) {}

  async getById(id: string): Promise<PaymentsLogicItem | null> {
    if (!id) throw new Error("ID is required");
    return this.repository.findById(id);
  }

  async getAll(): Promise<PaymentsLogicItem[]> {
    return this.repository.findMany();
  }

  async create(input: CreatePaymentsLogicInput): Promise<PaymentsLogicItem> {
    await this.validation.validateCreateInput(input);
    return this.repository.create(input);
  }

  async update(
    id: string,
    input: UpdatePaymentsLogicInput,
  ): Promise<PaymentsLogicItem> {
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
