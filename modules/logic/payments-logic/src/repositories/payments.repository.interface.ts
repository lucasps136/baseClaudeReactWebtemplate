/**
 * Payments Repository Interface
 * Bebarter Modular Architecture
 *
 * Defines the contract for payment data access following Dependency Inversion Principle.
 * Allows swapping data providers without changing business logic.
 */

import type {
  Payment,
  CreatePaymentDTO,
  UpdatePaymentDTO,
  PaymentFilters,
  PaymentStatus,
  PaginatedResult,
  PaymentStats,
} from "../types";

/**
 * Repository interface for payment data access.
 * Implementations can use Supabase, REST API, or any other data source.
 */
export interface IPaymentsRepository {
  /**
   * Find payment by ID
   * @param id - Payment unique identifier
   * @returns Payment or null if not found
   */
  findById(id: string): Promise<Payment | null>;

  /**
   * Find payment by external gateway ID
   * @param externalId - Gateway transaction ID
   * @returns Payment or null if not found
   */
  findByExternalId(externalId: string): Promise<Payment | null>;

  /**
   * Find payments with filters and pagination
   * @param filters - Query filters
   * @returns Paginated result with payments
   */
  findMany(filters: PaymentFilters): Promise<PaginatedResult<Payment>>;

  /**
   * Find payments by order ID
   * @param orderId - Order ID
   * @returns Array of payments
   */
  findByOrder(orderId: string): Promise<Payment[]>;

  /**
   * Find payments by payer ID
   * @param payerId - Payer user ID
   * @param limit - Max results
   * @returns Array of payments
   */
  findByPayer(payerId: string, limit?: number): Promise<Payment[]>;

  /**
   * Find payments by payee ID
   * @param payeeId - Payee user ID
   * @param limit - Max results
   * @returns Array of payments
   */
  findByPayee(payeeId: string, limit?: number): Promise<Payment[]>;

  /**
   * Create a new payment
   * @param data - Payment creation data
   * @returns Created payment
   */
  create(data: CreatePaymentDTO): Promise<Payment>;

  /**
   * Update an existing payment
   * @param id - Payment ID
   * @param data - Update data
   * @returns Updated payment
   */
  update(id: string, data: UpdatePaymentDTO): Promise<Payment>;

  /**
   * Update payment status
   * @param id - Payment ID
   * @param status - New status
   * @returns Updated payment
   */
  updateStatus(id: string, status: PaymentStatus): Promise<Payment>;

  /**
   * Mark payment as completed
   * @param id - Payment ID
   * @param externalId - Optional gateway transaction ID
   * @returns Updated payment
   */
  markAsCompleted(id: string, externalId?: string): Promise<Payment>;

  /**
   * Mark payment as failed
   * @param id - Payment ID
   * @param reason - Failure reason
   * @returns Updated payment
   */
  markAsFailed(id: string, reason?: string): Promise<Payment>;

  /**
   * Mark payment as refunded
   * @param id - Payment ID
   * @returns Updated payment
   */
  markAsRefunded(id: string): Promise<Payment>;

  /**
   * Check if payment exists
   * @param id - Payment ID
   * @returns True if exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Get payment statistics
   * @param userId - Optional user filter
   * @param role - User role (payer or payee)
   * @returns Payment statistics
   */
  getStats(userId?: string, role?: "payer" | "payee"): Promise<PaymentStats>;
}
