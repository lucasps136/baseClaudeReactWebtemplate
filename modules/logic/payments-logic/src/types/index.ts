/**
 * Payments Logic Module - Type Definitions
 * Bebarter Modular Architecture
 *
 * Domain types for payment management following SOLID principles.
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

/** Payment status enum */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

/** Payment method enum */
export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "pix"
  | "boleto"
  | "wallet"
  | "bank_transfer";

/** Payment gateway enum */
export type PaymentGateway = "stripe" | "pagarme" | "mercadopago" | "internal";

/** Currency type */
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

/** Valid payment status transitions */
export const PAYMENT_STATUS_TRANSITIONS: Record<
  PaymentStatus,
  PaymentStatus[]
> = {
  pending: ["processing", "failed", "cancelled"],
  processing: ["completed", "failed"],
  completed: ["refunded"],
  failed: ["pending"],
  refunded: [],
  cancelled: [],
};

// =============================================================================
// INTERFACES
// =============================================================================

/** Payment entity */
export interface Payment {
  id: string;
  orderId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  externalId: string | null;
  gateway: PaymentGateway;
  gatewayResponse: Record<string, unknown>;
  failureReason: string | null;
  metadata: Record<string, unknown>;
  paidAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Create payment DTO */
export interface CreatePaymentDTO {
  orderId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency?: Currency;
  paymentMethod: PaymentMethod;
  gateway: PaymentGateway;
  externalId?: string;
  metadata?: Record<string, unknown>;
}

/** Update payment DTO */
export interface UpdatePaymentDTO {
  status?: PaymentStatus;
  externalId?: string;
  gatewayResponse?: Record<string, unknown>;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

/** Refund DTO */
export interface RefundDTO {
  amount?: number; // Partial refund amount, full refund if not specified
  reason?: string;
  metadata?: Record<string, unknown>;
}

/** Payment filters for queries */
export interface PaymentFilters {
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
  limit?: number;
  offset?: number;
  sortBy?: keyof Payment;
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

/** Payment statistics */
export interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalAmount: number;
  averageAmount: number;
  byMethod: Record<PaymentMethod, number>;
  byGateway: Record<PaymentGateway, number>;
}
