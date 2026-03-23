/**
 * Orders UI Module - Type Definitions
 * Bebarter Modular Architecture
 */

// =============================================================================
// ENUMS
// =============================================================================

/** Order status */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/** Payment status */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** Currency */
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

// =============================================================================
// INTERFACES
// =============================================================================

/** Shipping address */
export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/** Order entity for UI */
export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  sellerName?: string;
  productId: string;
  productName?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  shippingAddress: ShippingAddress | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/** Create order input */
export interface CreateOrderInput {
  productId: string;
  quantity: number;
  shippingAddress?: ShippingAddress;
  notes?: string;
}

/** Update order input */
export interface UpdateOrderInput {
  status?: OrderStatus;
  shippingAddress?: ShippingAddress;
  notes?: string;
}

/** Order list filter */
export interface OrderListFilter {
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "createdAt" | "totalPrice" | "status";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/** Pagination state */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/** Order list response */
export interface OrderListResponse {
  orders: Order[];
  pagination: PaginationState;
}

// =============================================================================
// STATUS HELPERS
// =============================================================================

/** Order status display info */
export const ORDER_STATUS_INFO: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pendente", color: "yellow" },
  confirmed: { label: "Confirmado", color: "blue" },
  processing: { label: "Processando", color: "purple" },
  shipped: { label: "Enviado", color: "indigo" },
  delivered: { label: "Entregue", color: "green" },
  cancelled: { label: "Cancelado", color: "gray" },
  refunded: { label: "Reembolsado", color: "orange" },
};

/** Payment status display info */
export const PAYMENT_STATUS_INFO: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  pending: { label: "Aguardando", color: "yellow" },
  paid: { label: "Pago", color: "green" },
  failed: { label: "Falhou", color: "red" },
  refunded: { label: "Reembolsado", color: "gray" },
};
