import type {
  PaymentsLogicItem,
  CreatePaymentsLogicInput,
  UpdatePaymentsLogicInput,
} from "../types";

/**
 * Repository interface for PaymentsLogic data access
 */
export interface IPaymentsLogicRepository {
  findById(id: string): Promise<PaymentsLogicItem | null>;
  findMany(): Promise<PaymentsLogicItem[]>;
  create(input: CreatePaymentsLogicInput): Promise<PaymentsLogicItem>;
  update(
    id: string,
    input: UpdatePaymentsLogicInput,
  ): Promise<PaymentsLogicItem>;
  delete(id: string): Promise<void>;
}
