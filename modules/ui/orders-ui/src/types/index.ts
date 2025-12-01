// OrdersUi types
export interface OrdersUiItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrdersUiInput {
  name: string;
}

export interface UpdateOrdersUiInput {
  name?: string;
}
