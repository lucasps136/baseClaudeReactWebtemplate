// PaymentsUi types
export interface PaymentsUiItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentsUiInput {
  name: string;
}

export interface UpdatePaymentsUiInput {
  name?: string;
}
