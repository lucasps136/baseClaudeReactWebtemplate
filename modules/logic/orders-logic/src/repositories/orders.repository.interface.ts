/**
 * Orders Repository Interface
 * Bebarter Modular Architecture
 *
 * Defines the contract for order data access following Dependency Inversion Principle.
 * Allows swapping data providers without changing business logic.
 */

import type {
  Order,
  CreateOrderDTO,
  UpdateOrderDTO,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
  PaginatedResult,
  OrderStats,
} from "../types";

/**
 * Repository interface for order data access.
 * Implementations can use Supabase, REST API, or any other data source.
 */
export interface IOrdersRepository {
  /**
   * Find order by ID
   * @param id - Order unique identifier
   * @returns Order or null if not found
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Find order by order number
   * @param orderNumber - Human-readable order number
   * @returns Order or null if not found
   */
  findByOrderNumber(orderNumber: string): Promise<Order | null>;

  /**
   * Find orders with filters and pagination
   * @param filters - Query filters
   * @returns Paginated result with orders
   */
  findMany(filters: OrderFilters): Promise<PaginatedResult<Order>>;

  /**
   * Find orders by buyer ID
   * @param buyerId - Buyer user ID
   * @param limit - Max results
   * @returns Array of orders
   */
  findByBuyer(buyerId: string, limit?: number): Promise<Order[]>;

  /**
   * Find orders by seller ID
   * @param sellerId - Seller user ID
   * @param limit - Max results
   * @returns Array of orders
   */
  findBySeller(sellerId: string, limit?: number): Promise<Order[]>;

  /**
   * Find orders by product ID
   * @param productId - Product ID
   * @param limit - Max results
   * @returns Array of orders
   */
  findByProduct(productId: string, limit?: number): Promise<Order[]>;

  /**
   * Create a new order
   * @param data - Order creation data
   * @returns Created order
   */
  create(data: CreateOrderDTO): Promise<Order>;

  /**
   * Update an existing order
   * @param id - Order ID
   * @param data - Update data
   * @returns Updated order
   */
  update(id: string, data: UpdateOrderDTO): Promise<Order>;

  /**
   * Update order status
   * @param id - Order ID
   * @param status - New status
   * @returns Updated order
   */
  updateStatus(id: string, status: OrderStatus): Promise<Order>;

  /**
   * Update payment status
   * @param id - Order ID
   * @param paymentStatus - New payment status
   * @param paymentId - Optional payment reference
   * @returns Updated order
   */
  updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    paymentId?: string,
  ): Promise<Order>;

  /**
   * Check if order exists
   * @param id - Order ID
   * @returns True if exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Get order statistics
   * @param sellerId - Optional seller filter
   * @returns Order statistics
   */
  getStats(sellerId?: string): Promise<OrderStats>;
}
