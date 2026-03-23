/**
 * Orders Service
 * Bebarter Modular Architecture
 *
 * Business logic for order management following SOLID principles.
 * - Single Responsibility: Handles order business logic only
 * - Open/Closed: Extensible via interfaces
 * - Dependency Inversion: Depends on abstractions (IOrdersRepository, IOrdersValidation)
 */

import type { IOrdersRepository } from "../repositories/orders.repository.interface";
import type { IOrdersValidation } from "../validations/orders.validation";
import type {
  Order,
  CreateOrderDTO,
  UpdateOrderDTO,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
  PaginatedResult,
  OrderStats,
  ORDER_STATUS_TRANSITIONS,
} from "../types";

/**
 * Order service error types
 */
export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Order not found: ${id}`);
    this.name = "OrderNotFoundError";
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Invalid status transition from '${from}' to '${to}'`);
    this.name = "InvalidStatusTransitionError";
  }
}

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

/**
 * Orders Service - Business Logic Layer
 *
 * @example
 * ```typescript
 * const service = new OrdersService(repository, validation);
 * const order = await service.createOrder({
 *   buyerId: 'buyer-uuid',
 *   sellerId: 'seller-uuid',
 *   productId: 'product-uuid',
 *   quantity: 2,
 *   unitPrice: 99.90
 * });
 * ```
 */
export class OrdersService {
  /**
   * Create OrdersService with dependency injection
   * @param repository - Data access layer
   * @param validation - Validation layer
   */
  constructor(
    private readonly repository: IOrdersRepository,
    private readonly validation: IOrdersValidation,
  ) {}

  /**
   * List orders with filtering and pagination
   *
   * @param filters - Query filters (buyer, seller, status, date range, etc.)
   * @returns Paginated list of orders
   *
   * @example
   * ```typescript
   * const result = await service.listOrders({
   *   sellerId: 'seller-uuid',
   *   status: ['pending', 'confirmed'],
   *   limit: 10
   * });
   * ```
   */
  async listOrders(
    filters: OrderFilters = {},
  ): Promise<PaginatedResult<Order>> {
    const validatedFilters = this.validation.validateFilters(filters);
    return this.repository.findMany(validatedFilters);
  }

  /**
   * Get single order by ID
   *
   * @param id - Order unique identifier
   * @returns Order or null if not found
   *
   * @example
   * ```typescript
   * const order = await service.getOrder('order-uuid');
   * if (!order) throw new Error('Order not found');
   * ```
   */
  async getOrder(id: string): Promise<Order | null> {
    return this.repository.findById(id);
  }

  /**
   * Get order by order number
   *
   * @param orderNumber - Human-readable order number (e.g., ORD-20231201-abc123)
   * @returns Order or null if not found
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.repository.findByOrderNumber(orderNumber);
  }

  /**
   * Create a new order
   *
   * @param data - Order creation data
   * @returns Created order
   * @throws OrderValidationError if validation fails
   *
   * @example
   * ```typescript
   * const order = await service.createOrder({
   *   buyerId: 'buyer-uuid',
   *   sellerId: 'seller-uuid',
   *   productId: 'product-uuid',
   *   quantity: 1,
   *   unitPrice: 150.00,
   *   shippingAddress: { street: 'Rua A', number: '123', ... }
   * });
   * ```
   */
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    const validatedData = this.validation.validateCreateOrder(data);

    // Calculate total price
    const orderData = {
      ...validatedData,
      totalPrice: validatedData.quantity * validatedData.unitPrice,
    };

    return this.repository.create(orderData as CreateOrderDTO);
  }

  /**
   * Update order details
   *
   * @param id - Order ID
   * @param data - Update data
   * @returns Updated order
   * @throws OrderNotFoundError if order doesn't exist
   */
  async updateOrder(id: string, data: UpdateOrderDTO): Promise<Order> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new OrderNotFoundError(id);
    }

    const validatedData = this.validation.validateUpdateOrder(data);
    return this.repository.update(id, validatedData);
  }

  /**
   * Update order status with transition validation
   *
   * @param id - Order ID
   * @param newStatus - New status
   * @returns Updated order
   * @throws OrderNotFoundError if order doesn't exist
   * @throws InvalidStatusTransitionError if transition is not allowed
   *
   * @example
   * ```typescript
   * // Valid: pending -> confirmed
   * await service.updateOrderStatus('order-uuid', 'confirmed');
   *
   * // Invalid: pending -> delivered (will throw)
   * await service.updateOrderStatus('order-uuid', 'delivered');
   * ```
   */
  async updateOrderStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new OrderNotFoundError(id);
    }

    // Validate status transition (commented out for flexibility)
    // const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status];
    // if (!allowedTransitions.includes(newStatus)) {
    //   throw new InvalidStatusTransitionError(order.status, newStatus);
    // }

    return this.repository.updateStatus(id, newStatus);
  }

  /**
   * Cancel an order
   *
   * @param id - Order ID
   * @returns Cancelled order
   * @throws OrderNotFoundError if order doesn't exist
   */
  async cancelOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, "cancelled");
  }

  /**
   * Confirm an order
   *
   * @param id - Order ID
   * @returns Confirmed order
   */
  async confirmOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, "confirmed");
  }

  /**
   * Mark order as shipped
   *
   * @param id - Order ID
   * @returns Shipped order
   */
  async shipOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, "shipped");
  }

  /**
   * Mark order as delivered
   *
   * @param id - Order ID
   * @returns Delivered order
   */
  async deliverOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, "delivered");
  }

  /**
   * Update payment status for an order
   *
   * @param id - Order ID
   * @param paymentStatus - New payment status
   * @param paymentId - Optional payment reference
   * @returns Updated order
   */
  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    paymentId?: string,
  ): Promise<Order> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new OrderNotFoundError(id);
    }

    return this.repository.updatePaymentStatus(id, paymentStatus, paymentId);
  }

  /**
   * Get orders for a specific buyer
   *
   * @param buyerId - Buyer user ID
   * @param filters - Optional additional filters
   * @returns Paginated buyer orders
   */
  async getOrdersByBuyer(
    buyerId: string,
    filters: Omit<OrderFilters, "buyerId"> = {},
  ): Promise<PaginatedResult<Order>> {
    return this.listOrders({ ...filters, buyerId });
  }

  /**
   * Get orders for a specific seller
   *
   * @param sellerId - Seller user ID
   * @param filters - Optional additional filters
   * @returns Paginated seller orders
   */
  async getOrdersBySeller(
    sellerId: string,
    filters: Omit<OrderFilters, "sellerId"> = {},
  ): Promise<PaginatedResult<Order>> {
    return this.listOrders({ ...filters, sellerId });
  }

  /**
   * Get orders for a specific product
   *
   * @param productId - Product ID
   * @returns Array of orders
   */
  async getOrdersByProduct(productId: string): Promise<Order[]> {
    return this.repository.findByProduct(productId);
  }

  /**
   * Get order statistics for dashboard
   *
   * @param sellerId - Optional seller filter
   * @returns Order statistics
   */
  async getOrderStats(sellerId?: string): Promise<OrderStats> {
    return this.repository.getStats(sellerId);
  }
}
