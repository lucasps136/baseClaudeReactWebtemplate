/**
 * Payments UI Module - Type Definitions
 * Bebarter Modular Architecture
 */

// =============================================================================
// ENUMS
// =============================================================================

/** Payment status */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

/** Payment method */
export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "pix"
  | "boleto"
  | "wallet"
  | "bank_transfer";

/** Payment gateway */
export type PaymentGateway = "stripe" | "pagarme" | "mercadopago" | "internal";

/** Currency */
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

// =============================================================================
// INTERFACES
// =============================================================================

/** Payment entity for UI */
export interface Payment {
  id: string;
  orderId: string;
  orderNumber?: string;
  payerId: string;
  payerName?: string;
  payeeId: string;
  payeeName?: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  gateway: PaymentGateway;
  externalId: string | null;
  gatewayResponse: Record<string, unknown> | null;
  failureReason: string | null;
  refundedAmount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

/** Create payment input */
export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  gateway?: PaymentGateway;
}

/** Update payment input */
export interface UpdatePaymentInput {
  status?: PaymentStatus;
  externalId?: string;
  gatewayResponse?: Record<string, unknown>;
  failureReason?: string;
}

/** Refund input */
export interface RefundInput {
  amount?: number;
  reason?: string;
}

/** Payment list filter */
export interface PaymentListFilter {
  orderId?: string;
  payerId?: string;
  payeeId?: string;
  status?: PaymentStatus | PaymentStatus[];
  paymentMethod?: PaymentMethod | PaymentMethod[];
  gateway?: PaymentGateway | PaymentGateway[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "createdAt" | "amount" | "status";
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

/** Payment list response */
export interface PaymentListResponse {
  payments: Payment[];
  pagination: PaginationState;
}

// =============================================================================
// STATUS HELPERS
// =============================================================================

/** Payment status display info */
export const PAYMENT_STATUS_INFO: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pendente", color: "yellow" },
  processing: { label: "Processando", color: "blue" },
  completed: { label: "Concluído", color: "green" },
  failed: { label: "Falhou", color: "red" },
  refunded: { label: "Reembolsado", color: "orange" },
  cancelled: { label: "Cancelado", color: "gray" },
};

/** Payment method display info */
export const PAYMENT_METHOD_INFO: Record<
  PaymentMethod,
  { label: string; icon: string }
> = {
  credit_card: { label: "Cartão de Crédito", icon: "credit-card" },
  debit_card: { label: "Cartão de Débito", icon: "credit-card" },
  pix: { label: "PIX", icon: "qr-code" },
  boleto: { label: "Boleto", icon: "document" },
  wallet: { label: "Carteira Digital", icon: "wallet" },
  bank_transfer: { label: "Transferência", icon: "bank" },
};

/** Gateway display info */
export const GATEWAY_INFO: Record<PaymentGateway, { label: string }> = {
  stripe: { label: "Stripe" },
  pagarme: { label: "Pagar.me" },
  mercadopago: { label: "Mercado Pago" },
  internal: { label: "Interno" },
};
