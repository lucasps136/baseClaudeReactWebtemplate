/**
 * Payments Logic Module
 * Bebarter Modular Architecture
 *
 * Business logic layer for payment management.
 * Provides SOLID-compliant services, validations, and types.
 */

// Services
export {
  PaymentsService,
  PaymentNotFoundError,
  InvalidPaymentStatusError,
  PaymentValidationError,
  RefundNotAllowedError,
} from "./src/services/payments.service";

// Repository Interface
export type { IPaymentsRepository } from "./src/repositories/payments.repository.interface";

// Validations
export {
  PaymentsValidation,
  createPaymentSchema,
  updatePaymentSchema,
  refundSchema,
  paymentFiltersSchema,
  validateCreatePayment,
  validateUpdatePayment,
  validateRefund,
  validateFilters,
  safeValidateCreatePayment,
  safeValidateUpdatePayment,
  safeValidateRefund,
  safeValidateFilters,
} from "./src/validations/payments.validation";
export type { IPaymentsValidation } from "./src/validations/payments.validation";

// Types
export type {
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentGateway,
  Currency,
  CreatePaymentDTO,
  UpdatePaymentDTO,
  RefundDTO,
  PaymentFilters,
  PaginatedResult,
  PaymentStats,
} from "./src/types";

export { PAYMENT_STATUS_TRANSITIONS } from "./src/types";
