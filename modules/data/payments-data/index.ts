/**
 * Payments Data Module
 * Bebarter Modular Architecture
 *
 * Provides database schemas, queries, and types for payment management.
 */

// Types
export type {
  Payment,
  PaymentInsert,
  PaymentUpdate,
  PaymentFilters,
  PaymentStatus,
  PaymentMethod,
  PaymentGateway,
  Currency,
  PaginationParams,
  PaginatedResult,
  PaymentStats,
} from "./queries/payments.queries";

// Query functions - Read
export {
  getPaymentById,
  getPaymentByExternalId,
  listPayments,
  getPaymentsByOrder,
  getPaymentsByPayer,
  getPaymentsByPayee,
  countPayments,
  getPaymentStats,
} from "./queries/payments.queries";

// Query functions - Create
export { createPayment } from "./queries/payments.queries";

// Query functions - Update
export {
  updatePayment,
  updatePaymentStatus,
  markAsPaid,
  markAsFailed,
  markAsRefunded,
  updateGatewayResponse,
} from "./queries/payments.queries";

// Query functions - Utility
export {
  paymentExists,
  canUserAccessPayment,
} from "./queries/payments.queries";
