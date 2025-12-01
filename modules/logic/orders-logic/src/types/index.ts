// OrdersLogic domain types
export interface OrdersLogicItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrdersLogicInput {
  name: string;
}

export interface UpdateOrdersLogicInput {
  name?: string;
}
