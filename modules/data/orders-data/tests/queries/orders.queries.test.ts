/**
 * Orders Data Module - Query Tests
 * Tests for Supabase query functions with mock client
 */

import {
  getOrderById,
  getOrderByNumber,
  listOrders,
  getOrdersByBuyer,
  getOrdersBySeller,
  getOrdersByProduct,
  countOrders,
  getOrderStats,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  orderExists,
  canUserAccessOrder,
  Order,
  OrderInsert,
  OrderFilters,
} from "../../queries/orders.queries";

// Mock Supabase client
const createMockSupabase = () => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };

  return {
    from: jest.fn(() => mockQuery),
    _query: mockQuery,
  };
};

describe("Orders Data Queries", () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  const mockOrder: Order = {
    id: "order-123",
    order_number: "ORD-2025-001234",
    buyer_id: "buyer-123",
    seller_id: "seller-456",
    product_id: "product-789",
    quantity: 2,
    unit_price: 99.9,
    total_price: 199.8,
    currency: "BRL",
    status: "pending",
    payment_status: "pending",
    payment_id: null,
    shipping_address: {
      street: "Rua Test",
      number: "123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      country: "Brasil",
    },
    notes: null,
    metadata: {},
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    jest.clearAllMocks();
  });

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  describe("getOrderById", () => {
    it("should get order by ID successfully", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: mockOrder,
        error: null,
      });

      const result = await getOrderById(mockSupabase as any, "order-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("orders");
      expect(mockSupabase._query.select).toHaveBeenCalledWith("*");
      expect(mockSupabase._query.eq).toHaveBeenCalledWith("id", "order-123");
      expect(result).toEqual(mockOrder);
    });

    it("should return null when order not found (PGRST116)", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      const result = await getOrderById(mockSupabase as any, "nonexistent");

      expect(result).toBeNull();
    });

    it("should throw error on database error", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: null,
        error: { code: "OTHER", message: "Database error" },
      });

      await expect(
        getOrderById(mockSupabase as any, "order-123"),
      ).rejects.toEqual({ code: "OTHER", message: "Database error" });
    });
  });

  describe("getOrderByNumber", () => {
    it("should get order by order number", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: mockOrder,
        error: null,
      });

      const result = await getOrderByNumber(
        mockSupabase as any,
        "ORD-2025-001234",
      );

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "order_number",
        "ORD-2025-001234",
      );
      expect(result).toEqual(mockOrder);
    });

    it("should return null when order number not found", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      const result = await getOrderByNumber(mockSupabase as any, "INVALID");

      expect(result).toBeNull();
    });
  });

  describe("listOrders", () => {
    it("should list orders with default parameters", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        count: 1,
        error: null,
      });

      const result = await listOrders(mockSupabase as any);

      expect(mockSupabase.from).toHaveBeenCalledWith("orders");
      expect(mockSupabase._query.select).toHaveBeenCalledWith("*", {
        count: "exact",
      });
      expect(mockSupabase._query.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual([mockOrder]);
      expect(result.count).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it("should apply buyerId filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        count: 1,
        error: null,
      });

      const filters: OrderFilters = { buyerId: "buyer-123" };
      await listOrders(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "buyer_id",
        "buyer-123",
      );
    });

    it("should apply sellerId filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        count: 1,
        error: null,
      });

      const filters: OrderFilters = { sellerId: "seller-456" };
      await listOrders(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "seller_id",
        "seller-456",
      );
    });

    it("should apply single status filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        count: 1,
        error: null,
      });

      const filters: OrderFilters = { status: "pending" };
      await listOrders(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith("status", "pending");
    });

    it("should apply multiple status filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        count: 1,
        error: null,
      });

      const filters: OrderFilters = { status: ["pending", "confirmed"] };
      await listOrders(mockSupabase as any, filters);

      expect(mockSupabase._query.in).toHaveBeenCalledWith("status", [
        "pending",
        "confirmed",
      ]);
    });

    it("should apply date range filters", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        count: 1,
        error: null,
      });

      const filters: OrderFilters = {
        dateFrom: "2025-01-01",
        dateTo: "2025-12-31",
      };
      await listOrders(mockSupabase as any, filters);

      expect(mockSupabase._query.gte).toHaveBeenCalledWith(
        "created_at",
        "2025-01-01",
      );
      expect(mockSupabase._query.lte).toHaveBeenCalledWith(
        "created_at",
        "2025-12-31",
      );
    });

    it("should apply search filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        count: 1,
        error: null,
      });

      const filters: OrderFilters = { search: "ORD-2025" };
      await listOrders(mockSupabase as any, filters);

      expect(mockSupabase._query.ilike).toHaveBeenCalledWith(
        "order_number",
        "%ORD-2025%",
      );
    });

    it("should calculate hasMore correctly", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: Array(20).fill(mockOrder),
        count: 50,
        error: null,
      });

      const result = await listOrders(mockSupabase as any, { limit: 20 });

      expect(result.hasMore).toBe(true);
    });
  });

  describe("getOrdersByBuyer", () => {
    it("should get orders by buyer ID", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        error: null,
      });

      const result = await getOrdersByBuyer(mockSupabase as any, "buyer-123");

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "buyer_id",
        "buyer-123",
      );
      expect(result).toEqual([mockOrder]);
    });
  });

  describe("getOrdersBySeller", () => {
    it("should get orders by seller ID", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        error: null,
      });

      const result = await getOrdersBySeller(mockSupabase as any, "seller-456");

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "seller_id",
        "seller-456",
      );
      expect(result).toEqual([mockOrder]);
    });
  });

  describe("getOrdersByProduct", () => {
    it("should get orders by product ID", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockOrder],
        error: null,
      });

      const result = await getOrdersByProduct(
        mockSupabase as any,
        "product-789",
      );

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "product_id",
        "product-789",
      );
      expect(result).toEqual([mockOrder]);
    });
  });

  describe("countOrders", () => {
    it("should count orders with filters", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        count: 42,
        error: null,
      });

      const result = await countOrders(mockSupabase as any, {
        status: "pending",
      });

      expect(mockSupabase._query.select).toHaveBeenCalledWith("id", {
        count: "exact",
        head: true,
      });
      expect(result).toBe(42);
    });
  });

  describe("getOrderStats", () => {
    it("should return order statistics", async () => {
      const orders = [
        { status: "pending", total_price: 100 },
        { status: "delivered", total_price: 200 },
        { status: "delivered", total_price: 300 },
        { status: "cancelled", total_price: 50 },
      ];

      mockSupabase._query.eq.mockResolvedValue({
        data: orders,
        error: null,
      });

      const result = await getOrderStats(mockSupabase as any, "seller-456");

      expect(result.totalOrders).toBe(4);
      expect(result.pendingOrders).toBe(1);
      expect(result.completedOrders).toBe(2);
      expect(result.cancelledOrders).toBe(1);
      expect(result.totalRevenue).toBe(500);
      expect(result.averageOrderValue).toBe(250);
    });
  });

  // ============================================================================
  // CREATE OPERATIONS
  // ============================================================================

  describe("createOrder", () => {
    it("should create order successfully", async () => {
      const newOrder: OrderInsert = {
        buyer_id: "buyer-123",
        seller_id: "seller-456",
        product_id: "product-789",
        unit_price: 99.9,
        total_price: 199.8,
      };

      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockOrder, ...newOrder },
        error: null,
      });

      const result = await createOrder(mockSupabase as any, newOrder);

      expect(mockSupabase.from).toHaveBeenCalledWith("orders");
      expect(mockSupabase._query.insert).toHaveBeenCalledWith(newOrder);
      expect(result.buyer_id).toBe("buyer-123");
    });
  });

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  describe("updateOrder", () => {
    it("should update order successfully", async () => {
      const updates = { notes: "Updated notes" };

      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockOrder, ...updates },
        error: null,
      });

      const result = await updateOrder(
        mockSupabase as any,
        "order-123",
        updates,
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith(updates);
      expect(mockSupabase._query.eq).toHaveBeenCalledWith("id", "order-123");
      expect(result.notes).toBe("Updated notes");
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockOrder, status: "confirmed" },
        error: null,
      });

      const result = await updateOrderStatus(
        mockSupabase as any,
        "order-123",
        "confirmed",
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        status: "confirmed",
      });
      expect(result.status).toBe("confirmed");
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockOrder, payment_status: "paid", payment_id: "pay-123" },
        error: null,
      });

      const result = await updatePaymentStatus(
        mockSupabase as any,
        "order-123",
        "paid",
        "pay-123",
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        payment_status: "paid",
        payment_id: "pay-123",
      });
      expect(result.payment_status).toBe("paid");
    });
  });

  describe("Convenience Status Methods", () => {
    it("cancelOrder should set status to cancelled", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockOrder, status: "cancelled" },
        error: null,
      });

      const result = await cancelOrder(mockSupabase as any, "order-123");

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        status: "cancelled",
      });
      expect(result.status).toBe("cancelled");
    });

    it("confirmOrder should set status to confirmed", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockOrder, status: "confirmed" },
        error: null,
      });

      const result = await confirmOrder(mockSupabase as any, "order-123");

      expect(result.status).toBe("confirmed");
    });

    it("shipOrder should set status to shipped", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockOrder, status: "shipped" },
        error: null,
      });

      const result = await shipOrder(mockSupabase as any, "order-123");

      expect(result.status).toBe("shipped");
    });

    it("deliverOrder should set status to delivered", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockOrder, status: "delivered" },
        error: null,
      });

      const result = await deliverOrder(mockSupabase as any, "order-123");

      expect(result.status).toBe("delivered");
    });
  });

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  describe("orderExists", () => {
    it("should return true if order exists", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        count: 1,
        error: null,
      });

      const result = await orderExists(mockSupabase as any, "order-123");

      expect(result).toBe(true);
    });

    it("should return false if order does not exist", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        count: 0,
        error: null,
      });

      const result = await orderExists(mockSupabase as any, "nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("canUserAccessOrder", () => {
    it("should return true if user is buyer or seller", async () => {
      mockSupabase._query.or.mockResolvedValue({
        count: 1,
        error: null,
      });

      const result = await canUserAccessOrder(
        mockSupabase as any,
        "buyer-123",
        "order-123",
      );

      expect(mockSupabase._query.or).toHaveBeenCalledWith(
        "buyer_id.eq.buyer-123,seller_id.eq.buyer-123",
      );
      expect(result).toBe(true);
    });

    it("should return false if user has no access", async () => {
      mockSupabase._query.or.mockResolvedValue({
        count: 0,
        error: null,
      });

      const result = await canUserAccessOrder(
        mockSupabase as any,
        "other-user",
        "order-123",
      );

      expect(result).toBe(false);
    });
  });
});
