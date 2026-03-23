/**
 * Orders Logic Module - Type Definitions
 * Bebarter Modular Architecture
 *
 * Domain types for order management following SOLID principles.
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

/** Order status enum */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/** Payment status enum */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** Currency type */
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

/** Valid order status transitions */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

// =============================================================================
// INTERFACES
// =============================================================================

/** Shipping address structure */
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

/** Order entity */
export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  productId: string;
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

/** Create order DTO */
export interface CreateOrderDTO {
  buyerId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  currency?: Currency;
  shippingAddress?: ShippingAddress;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/** Update order DTO */
export interface UpdateOrderDTO {
  quantity?: number;
  shippingAddress?: ShippingAddress;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/** Update order status DTO */
export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  notes?: string;
}

/** Order filters for queries */
export interface OrderFilters {
  buyerId?: string;
  sellerId?: string;
  productId?: string;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: keyof Order;
  sortOrder?: "asc" | "desc";
}

/** Paginated result wrapper */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

/** Order statistics */
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}
