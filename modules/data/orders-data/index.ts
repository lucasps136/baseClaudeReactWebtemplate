/**
 * Orders Data Module
 * Bebarter Modular Architecture
 *
 * Provides database schemas, queries, and types for order management.
 */

// Types
export type {
  Order,
  OrderInsert,
  OrderUpdate,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
  Currency,
  ShippingAddress,
  PaginationParams,
  PaginatedResult,
  OrderStats,
} from "./queries/orders.queries";

// Query functions - Read
export {
  getOrderById,
  getOrderByNumber,
  listOrders,
  getOrdersByBuyer,
  getOrdersBySeller,
  getOrdersByProduct,
  countOrders,
  getOrderStats,
} from "./queries/orders.queries";

// Query functions - Create
export { createOrder } from "./queries/orders.queries";

// Query functions - Update
export {
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
} from "./queries/orders.queries";

// Query functions - Utility
export { orderExists, canUserAccessOrder } from "./queries/orders.queries";
