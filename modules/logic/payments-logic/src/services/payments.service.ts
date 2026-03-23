/**
 * Payments Service
 * Bebarter Modular Architecture
 *
 * Business logic for payment management following SOLID principles.
 * - Single Responsibility: Handles payment business logic only
 * - Open/Closed: Extensible via interfaces
 * - Dependency Inversion: Depends on abstractions (IPaymentsRepository, IPaymentsValidation)
 */

import type { IPaymentsRepository } from "../repositories/payments.repository.interface";
import type { IPaymentsValidation } from "../validations/payments.validation";
import type {
  Payment,
  CreatePaymentDTO,
  UpdatePaymentDTO,
  RefundDTO,
  PaymentFilters,
  PaymentStatus,
  PaginatedResult,
  PaymentStats,
} from "../types";

/**
 * Payment service error types
 */
export class PaymentNotFoundError extends Error {
  constructor(id: string) {
    super(`Payment not found: ${id}`);
    this.name = "PaymentNotFoundError";
  }
}

export class InvalidPaymentStatusError extends Error {
  constructor(from: PaymentStatus, to: PaymentStatus) {
    super(`Invalid status transition from '${from}' to '${to}'`);
    this.name = "InvalidPaymentStatusError";
  }
}

export class PaymentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentValidationError";
  }
}

export class RefundNotAllowedError extends Error {
  constructor(paymentId: string, reason: string) {
    super(`Refund not allowed for payment ${paymentId}: ${reason}`);
    this.name = "RefundNotAllowedError";
  }
}

/**
 * Payments Service - Business Logic Layer
 *
 * @example
 * ```typescript
 * const service = new PaymentsService(repository, validation);
 * const payment = await service.createPayment({
 *   orderId: 'order-uuid',
 *   payerId: 'buyer-uuid',
 *   payeeId: 'seller-uuid',
 *   amount: 150.00,
 *   paymentMethod: 'pix',
 *   gateway: 'stripe'
 * });
 * ```
 */
export class PaymentsService {
  /**
   * Create PaymentsService with dependency injection
   * @param repository - Data access layer
   * @param validation - Validation layer
   */
  constructor(
    private readonly repository: IPaymentsRepository,
    private readonly validation: IPaymentsValidation,
  ) {}

  /**
   * List payments with filtering and pagination
   *
   * @param filters - Query filters (payer, payee, status, method, etc.)
   * @returns Paginated list of payments
   *
   * @example
   * ```typescript
   * const result = await service.listPayments({
   *   payeeId: 'seller-uuid',
   *   status: 'completed',
   *   limit: 10
   * });
   * ```
   */
  async listPayments(
    filters: PaymentFilters = {},
  ): Promise<PaginatedResult<Payment>> {
    const validatedFilters = this.validation.validateFilters(filters);
    return this.repository.findMany(validatedFilters);
  }

  /**
   * Get single payment by ID
   *
   * @param id - Payment unique identifier
   * @returns Payment or null if not found
   */
  async getPayment(id: string): Promise<Payment | null> {
    return this.repository.findById(id);
  }

  /**
   * Get payment by external gateway ID
   *
   * @param externalId - Gateway transaction ID (e.g., Stripe payment intent ID)
   * @returns Payment or null if not found
   */
  async getPaymentByExternalId(externalId: string): Promise<Payment | null> {
    return this.repository.findByExternalId(externalId);
  }

  /**
   * Create a new payment
   *
   * @param data - Payment creation data
   * @returns Created payment
   * @throws PaymentValidationError if validation fails
   *
   * @example
   * ```typescript
   * const payment = await service.createPayment({
   *   orderId: 'order-uuid',
   *   payerId: 'buyer-uuid',
   *   payeeId: 'seller-uuid',
   *   amount: 99.90,
   *   paymentMethod: 'credit_card',
   *   gateway: 'stripe'
   * });
   * ```
   */
  async createPayment(data: CreatePaymentDTO): Promise<Payment> {
    const validatedData = this.validation.validateCreatePayment(data);
    return this.repository.create(validatedData);
  }

  /**
   * Update payment details
   *
   * @param id - Payment ID
   * @param data - Update data
   * @returns Updated payment
   * @throws PaymentNotFoundError if payment doesn't exist
   */
  async updatePayment(id: string, data: UpdatePaymentDTO): Promise<Payment> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new PaymentNotFoundError(id);
    }

    const validatedData = this.validation.validateUpdatePayment(data);
    return this.repository.update(id, validatedData);
  }

  /**
   * Process payment (move to processing status)
   *
   * @param id - Payment ID
   * @returns Updated payment
   */
  async processPayment(id: string): Promise<Payment> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new PaymentNotFoundError(id);
    }

    if (payment.status !== "pending") {
      throw new InvalidPaymentStatusError(payment.status, "processing");
    }

    return this.repository.updateStatus(id, "processing");
  }

  /**
   * Complete payment successfully
   *
   * @param id - Payment ID
   * @param externalId - Optional gateway transaction ID
   * @returns Completed payment
   */
  async completePayment(id: string, externalId?: string): Promise<Payment> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new PaymentNotFoundError(id);
    }

    if (!["pending", "processing"].includes(payment.status)) {
      throw new InvalidPaymentStatusError(payment.status, "completed");
    }

    return this.repository.markAsCompleted(id, externalId);
  }

  /**
   * Fail payment
   *
   * @param id - Payment ID
   * @param reason - Failure reason
   * @returns Failed payment
   */
  async failPayment(id: string, reason?: string): Promise<Payment> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new PaymentNotFoundError(id);
    }

    if (!["pending", "processing"].includes(payment.status)) {
      throw new InvalidPaymentStatusError(payment.status, "failed");
    }

    return this.repository.markAsFailed(id, reason);
  }

  /**
   * Refund a completed payment
   *
   * @param id - Payment ID
   * @param refundData - Refund details
   * @returns Refunded payment
   * @throws RefundNotAllowedError if payment cannot be refunded
   */
  async refundPayment(id: string, refundData?: RefundDTO): Promise<Payment> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new PaymentNotFoundError(id);
    }

    if (payment.status !== "completed") {
      throw new RefundNotAllowedError(
        id,
        `Payment status is '${payment.status}', must be 'completed'`,
      );
    }

    if (refundData) {
      const validatedRefund = this.validation.validateRefund(refundData);

      // Validate partial refund amount
      if (validatedRefund.amount && validatedRefund.amount > payment.amount) {
        throw new RefundNotAllowedError(
          id,
          "Refund amount exceeds payment amount",
        );
      }
    }

    return this.repository.markAsRefunded(id);
  }

  /**
   * Cancel a pending payment
   *
   * @param id - Payment ID
   * @returns Cancelled payment
   */
  async cancelPayment(id: string): Promise<Payment> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new PaymentNotFoundError(id);
    }

    if (payment.status !== "pending") {
      throw new InvalidPaymentStatusError(payment.status, "cancelled");
    }

    return this.repository.updateStatus(id, "cancelled");
  }

  /**
   * Get payments for an order
   *
   * @param orderId - Order ID
   * @returns Array of payments
   */
  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return this.repository.findByOrder(orderId);
  }

  /**
   * Get payments made by a payer
   *
   * @param payerId - Payer user ID
   * @param filters - Optional additional filters
   * @returns Paginated payer payments
   */
  async getPaymentsByPayer(
    payerId: string,
    filters: Omit<PaymentFilters, "payerId"> = {},
  ): Promise<PaginatedResult<Payment>> {
    return this.listPayments({ ...filters, payerId });
  }

  /**
   * Get payments received by a payee
   *
   * @param payeeId - Payee user ID
   * @param filters - Optional additional filters
   * @returns Paginated payee payments
   */
  async getPaymentsByPayee(
    payeeId: string,
    filters: Omit<PaymentFilters, "payeeId"> = {},
  ): Promise<PaginatedResult<Payment>> {
    return this.listPayments({ ...filters, payeeId });
  }

  /**
   * Get payment statistics for dashboard
   *
   * @param userId - Optional user filter
   * @param role - User role (payer or payee)
   * @returns Payment statistics
   */
  async getPaymentStats(
    userId?: string,
    role?: "payer" | "payee",
  ): Promise<PaymentStats> {
    return this.repository.getStats(userId, role);
  }
}
