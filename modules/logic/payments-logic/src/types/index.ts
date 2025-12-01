// PaymentsLogic domain types
export interface PaymentsLogicItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentsLogicInput {
  name: string;
}

export interface UpdatePaymentsLogicInput {
  name?: string;
}
