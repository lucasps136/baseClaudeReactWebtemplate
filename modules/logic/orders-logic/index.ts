/**
 * Orders Logic Module
 * Bebarter Modular Architecture
 *
 * Business logic layer for order management.
 * Provides SOLID-compliant services, validations, and types.
 */

// Services
export {
  OrdersService,
  OrderNotFoundError,
  InvalidStatusTransitionError,
  OrderValidationError,
} from "./src/services/orders.service";

// Repository Interface
export type { IOrdersRepository } from "./src/repositories/orders.repository.interface";

// Validations
export {
  OrdersValidation,
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  orderFiltersSchema,
  shippingAddressSchema,
  validateCreateOrder,
  validateUpdateOrder,
  validateUpdateStatus,
  validateFilters,
  safeValidateCreateOrder,
  safeValidateUpdateOrder,
  safeValidateFilters,
} from "./src/validations/orders.validation";
export type { IOrdersValidation } from "./src/validations/orders.validation";

// Types
export type {
  Order,
  OrderStatus,
  PaymentStatus,
  Currency,
  ShippingAddress,
  CreateOrderDTO,
  UpdateOrderDTO,
  UpdateOrderStatusDTO,
  OrderFilters,
  PaginatedResult,
  OrderStats,
} from "./src/types";

export { ORDER_STATUS_TRANSITIONS } from "./src/types";
