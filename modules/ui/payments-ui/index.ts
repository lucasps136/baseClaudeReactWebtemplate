/**
 * Payments UI Module
 * Bebarter Modular Architecture
 *
 * Public API for payment-related UI components, hooks, and stores.
 */

// Components
export { PaymentCard } from "./src/components/PaymentCard";
export { PaymentList } from "./src/components/PaymentList";
export { PaymentDetail } from "./src/components/PaymentDetail";
export {
  PaymentStatusBadge,
  PaymentMethodBadge,
} from "./src/components/PaymentStatusBadge";

// Hooks
export { usePayment } from "./src/hooks/usePayment";
export { usePayments } from "./src/hooks/usePayments";

// Store
export { usePaymentStore } from "./src/stores/payments.store";

// Types
export type {
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentGateway,
  Currency,
  CreatePaymentInput,
  UpdatePaymentInput,
  RefundInput,
  PaymentListFilter,
  PaginationState,
  PaymentListResponse,
} from "./src/types";

export {
  PAYMENT_STATUS_INFO,
  PAYMENT_METHOD_INFO,
  GATEWAY_INFO,
} from "./src/types";
