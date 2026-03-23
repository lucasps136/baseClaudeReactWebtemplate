/**
 * Orders UI Module
 * Bebarter Modular Architecture
 *
 * Public API for order-related UI components, hooks, and stores.
 */

// Components
export { OrderCard } from "./src/components/OrderCard";
export { OrderList } from "./src/components/OrderList";
export { OrderDetail } from "./src/components/OrderDetail";
export {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./src/components/OrderStatusBadge";

// Hooks
export { useOrder } from "./src/hooks/useOrder";
export { useOrders } from "./src/hooks/useOrders";

// Store
export { useOrderStore } from "./src/stores/orders.store";

// Types
export type {
  Order,
  OrderStatus,
  PaymentStatus,
  Currency,
  ShippingAddress,
  CreateOrderInput,
  UpdateOrderInput,
  OrderListFilter,
  PaginationState,
  OrderListResponse,
} from "./src/types";

export { ORDER_STATUS_INFO, PAYMENT_STATUS_INFO } from "./src/types";
