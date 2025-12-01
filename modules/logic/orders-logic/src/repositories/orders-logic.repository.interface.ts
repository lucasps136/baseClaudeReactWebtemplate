import type {
  OrdersLogicItem,
  CreateOrdersLogicInput,
  UpdateOrdersLogicInput,
} from "../types";

/**
 * Repository interface for OrdersLogic data access
 */
export interface IOrdersLogicRepository {
  findById(id: string): Promise<OrdersLogicItem | null>;
  findMany(): Promise<OrdersLogicItem[]>;
  create(input: CreateOrdersLogicInput): Promise<OrdersLogicItem>;
  update(id: string, input: UpdateOrdersLogicInput): Promise<OrdersLogicItem>;
  delete(id: string): Promise<void>;
}
