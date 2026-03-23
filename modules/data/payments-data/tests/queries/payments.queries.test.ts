/**
 * Payments Data Module - Query Tests
 * Tests for Supabase query functions with mock client
 */

import {
  getPaymentById,
  getPaymentByExternalId,
  listPayments,
  getPaymentsByOrder,
  getPaymentsByPayer,
  getPaymentsByPayee,
  countPayments,
  getPaymentStats,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  markAsPaid,
  markAsFailed,
  markAsRefunded,
  updateGatewayResponse,
  paymentExists,
  canUserAccessPayment,
  Payment,
  PaymentInsert,
  PaymentFilters,
} from "../../queries/payments.queries";

// Mock Supabase client
const createMockSupabase = () => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
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

describe("Payments Data Queries", () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  const mockPayment: Payment = {
    id: "payment-123",
    order_id: "order-456",
    payer_id: "buyer-123",
    payee_id: "seller-456",
    amount: 199.8,
    currency: "BRL",
    payment_method: "pix",
    status: "pending",
    external_id: null,
    gateway: "stripe",
    gateway_response: {},
    failure_reason: null,
    metadata: {},
    paid_at: null,
    refunded_at: null,
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

  describe("getPaymentById", () => {
    it("should get payment by ID successfully", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: mockPayment,
        error: null,
      });

      const result = await getPaymentById(mockSupabase as any, "payment-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase._query.select).toHaveBeenCalledWith("*");
      expect(mockSupabase._query.eq).toHaveBeenCalledWith("id", "payment-123");
      expect(result).toEqual(mockPayment);
    });

    it("should return null when payment not found (PGRST116)", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      const result = await getPaymentById(mockSupabase as any, "nonexistent");

      expect(result).toBeNull();
    });

    it("should throw error on database error", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: null,
        error: { code: "OTHER", message: "Database error" },
      });

      await expect(
        getPaymentById(mockSupabase as any, "payment-123"),
      ).rejects.toEqual({ code: "OTHER", message: "Database error" });
    });
  });

  describe("getPaymentByExternalId", () => {
    it("should get payment by external ID (gateway transaction ID)", async () => {
      const paymentWithExternalId = {
        ...mockPayment,
        external_id: "pi_1234567890",
      };
      mockSupabase._query.single.mockResolvedValue({
        data: paymentWithExternalId,
        error: null,
      });

      const result = await getPaymentByExternalId(
        mockSupabase as any,
        "pi_1234567890",
      );

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "external_id",
        "pi_1234567890",
      );
      expect(result?.external_id).toBe("pi_1234567890");
    });

    it("should return null when external ID not found", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      const result = await getPaymentByExternalId(
        mockSupabase as any,
        "invalid_external",
      );

      expect(result).toBeNull();
    });
  });

  describe("listPayments", () => {
    it("should list payments with default parameters", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const result = await listPayments(mockSupabase as any);

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase._query.select).toHaveBeenCalledWith("*", {
        count: "exact",
      });
      expect(mockSupabase._query.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual([mockPayment]);
      expect(result.count).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it("should apply orderId filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = { orderId: "order-456" };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "order_id",
        "order-456",
      );
    });

    it("should apply payerId filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = { payerId: "buyer-123" };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "payer_id",
        "buyer-123",
      );
    });

    it("should apply payeeId filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = { payeeId: "seller-456" };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "payee_id",
        "seller-456",
      );
    });

    it("should apply single status filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = { status: "pending" };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith("status", "pending");
    });

    it("should apply multiple status filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = { status: ["pending", "processing"] };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.in).toHaveBeenCalledWith("status", [
        "pending",
        "processing",
      ]);
    });

    it("should apply payment method filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = { paymentMethod: "pix" };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "payment_method",
        "pix",
      );
    });

    it("should apply multiple payment method filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = { paymentMethod: ["pix", "credit_card"] };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.in).toHaveBeenCalledWith("payment_method", [
        "pix",
        "credit_card",
      ]);
    });

    it("should apply gateway filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = { gateway: "stripe" };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith("gateway", "stripe");
    });

    it("should apply date range filters", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = {
        dateFrom: "2025-01-01",
        dateTo: "2025-12-31",
      };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.gte).toHaveBeenCalledWith(
        "created_at",
        "2025-01-01",
      );
      expect(mockSupabase._query.lte).toHaveBeenCalledWith(
        "created_at",
        "2025-12-31",
      );
    });

    it("should apply amount range filters", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        count: 1,
        error: null,
      });

      const filters: PaymentFilters = { minAmount: 100, maxAmount: 500 };
      await listPayments(mockSupabase as any, filters);

      expect(mockSupabase._query.gte).toHaveBeenCalledWith("amount", 100);
      expect(mockSupabase._query.lte).toHaveBeenCalledWith("amount", 500);
    });

    it("should calculate hasMore correctly", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: Array(20).fill(mockPayment),
        count: 50,
        error: null,
      });

      const result = await listPayments(mockSupabase as any, { limit: 20 });

      expect(result.hasMore).toBe(true);
    });
  });

  describe("getPaymentsByOrder", () => {
    it("should get payments by order ID", async () => {
      mockSupabase._query.order.mockResolvedValue({
        data: [mockPayment],
        error: null,
      });

      const result = await getPaymentsByOrder(mockSupabase as any, "order-456");

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "order_id",
        "order-456",
      );
      expect(result).toEqual([mockPayment]);
    });
  });

  describe("getPaymentsByPayer", () => {
    it("should get payments by payer ID", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        error: null,
      });

      const result = await getPaymentsByPayer(mockSupabase as any, "buyer-123");

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "payer_id",
        "buyer-123",
      );
      expect(result).toEqual([mockPayment]);
    });
  });

  describe("getPaymentsByPayee", () => {
    it("should get payments by payee ID", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockPayment],
        error: null,
      });

      const result = await getPaymentsByPayee(
        mockSupabase as any,
        "seller-456",
      );

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "payee_id",
        "seller-456",
      );
      expect(result).toEqual([mockPayment]);
    });
  });

  describe("countPayments", () => {
    it("should count payments with filters", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        count: 42,
        error: null,
      });

      const result = await countPayments(mockSupabase as any, {
        status: "completed",
      });

      expect(mockSupabase._query.select).toHaveBeenCalledWith("id", {
        count: "exact",
        head: true,
      });
      expect(result).toBe(42);
    });
  });

  describe("getPaymentStats", () => {
    it("should return payment statistics for payee", async () => {
      const payments = [
        {
          status: "pending",
          amount: 100,
          payment_method: "pix",
          gateway: "stripe",
        },
        {
          status: "completed",
          amount: 200,
          payment_method: "credit_card",
          gateway: "stripe",
        },
        {
          status: "completed",
          amount: 300,
          payment_method: "pix",
          gateway: "mercadopago",
        },
        {
          status: "failed",
          amount: 50,
          payment_method: "boleto",
          gateway: "pagarme",
        },
        {
          status: "refunded",
          amount: 150,
          payment_method: "pix",
          gateway: "stripe",
        },
      ];

      mockSupabase._query.eq.mockResolvedValue({
        data: payments,
        error: null,
      });

      const result = await getPaymentStats(
        mockSupabase as any,
        "seller-456",
        "payee",
      );

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "payee_id",
        "seller-456",
      );
      expect(result.totalPayments).toBe(5);
      expect(result.pendingPayments).toBe(1);
      expect(result.completedPayments).toBe(2);
      expect(result.failedPayments).toBe(1);
      expect(result.refundedPayments).toBe(1);
      expect(result.totalAmount).toBe(500); // Only completed
      expect(result.averageAmount).toBe(250);
      expect(result.byMethod.pix).toBe(3);
      expect(result.byGateway.stripe).toBe(3);
    });

    it("should return payment statistics for payer", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        data: [mockPayment],
        error: null,
      });

      await getPaymentStats(mockSupabase as any, "buyer-123", "payer");

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "payer_id",
        "buyer-123",
      );
    });
  });

  // ============================================================================
  // CREATE OPERATIONS
  // ============================================================================

  describe("createPayment", () => {
    it("should create payment successfully", async () => {
      const newPayment: PaymentInsert = {
        order_id: "order-456",
        payer_id: "buyer-123",
        payee_id: "seller-456",
        amount: 199.8,
        payment_method: "pix",
        gateway: "stripe",
      };

      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockPayment, ...newPayment },
        error: null,
      });

      const result = await createPayment(mockSupabase as any, newPayment);

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase._query.insert).toHaveBeenCalledWith(newPayment);
      expect(result.order_id).toBe("order-456");
    });
  });

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  describe("updatePayment", () => {
    it("should update payment successfully", async () => {
      const updates = { status: "processing" as const };

      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockPayment, ...updates },
        error: null,
      });

      const result = await updatePayment(
        mockSupabase as any,
        "payment-123",
        updates,
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith(updates);
      expect(mockSupabase._query.eq).toHaveBeenCalledWith("id", "payment-123");
      expect(result.status).toBe("processing");
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockPayment, status: "completed" },
        error: null,
      });

      const result = await updatePaymentStatus(
        mockSupabase as any,
        "payment-123",
        "completed",
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        status: "completed",
      });
      expect(result.status).toBe("completed");
    });
  });

  describe("markAsPaid", () => {
    it("should mark payment as paid with external ID", async () => {
      const paidPayment = {
        ...mockPayment,
        status: "completed",
        external_id: "pi_1234567890",
        paid_at: "2025-01-01T12:00:00Z",
      };

      mockSupabase._query.single.mockResolvedValue({
        data: paidPayment,
        error: null,
      });

      const result = await markAsPaid(
        mockSupabase as any,
        "payment-123",
        "pi_1234567890",
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "completed",
          external_id: "pi_1234567890",
          paid_at: expect.any(String),
        }),
      );
      expect(result.status).toBe("completed");
    });

    it("should mark payment as paid without external ID", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockPayment, status: "completed" },
        error: null,
      });

      await markAsPaid(mockSupabase as any, "payment-123");

      expect(mockSupabase._query.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "completed",
          paid_at: expect.any(String),
        }),
      );
    });
  });

  describe("markAsFailed", () => {
    it("should mark payment as failed with reason", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: {
          ...mockPayment,
          status: "failed",
          failure_reason: "Card declined",
        },
        error: null,
      });

      const result = await markAsFailed(
        mockSupabase as any,
        "payment-123",
        "Card declined",
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        status: "failed",
        failure_reason: "Card declined",
      });
      expect(result.status).toBe("failed");
      expect(result.failure_reason).toBe("Card declined");
    });

    it("should mark payment as failed without reason", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockPayment, status: "failed" },
        error: null,
      });

      await markAsFailed(mockSupabase as any, "payment-123");

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        status: "failed",
      });
    });
  });

  describe("markAsRefunded", () => {
    it("should mark payment as refunded", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: {
          ...mockPayment,
          status: "refunded",
          refunded_at: "2025-01-02T00:00:00Z",
        },
        error: null,
      });

      const result = await markAsRefunded(mockSupabase as any, "payment-123");

      expect(mockSupabase._query.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "refunded",
          refunded_at: expect.any(String),
        }),
      );
      expect(result.status).toBe("refunded");
    });
  });

  describe("updateGatewayResponse", () => {
    it("should update gateway response", async () => {
      const gatewayResponse = { transaction_id: "txn_123", status: "success" };

      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockPayment, gateway_response: gatewayResponse },
        error: null,
      });

      const result = await updateGatewayResponse(
        mockSupabase as any,
        "payment-123",
        gatewayResponse,
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        gateway_response: gatewayResponse,
      });
      expect(result.gateway_response).toEqual(gatewayResponse);
    });
  });

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  describe("paymentExists", () => {
    it("should return true if payment exists", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        count: 1,
        error: null,
      });

      const result = await paymentExists(mockSupabase as any, "payment-123");

      expect(result).toBe(true);
    });

    it("should return false if payment does not exist", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        count: 0,
        error: null,
      });

      const result = await paymentExists(mockSupabase as any, "nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("canUserAccessPayment", () => {
    it("should return true if user is payer or payee", async () => {
      mockSupabase._query.or.mockResolvedValue({
        count: 1,
        error: null,
      });

      const result = await canUserAccessPayment(
        mockSupabase as any,
        "buyer-123",
        "payment-123",
      );

      expect(mockSupabase._query.or).toHaveBeenCalledWith(
        "payer_id.eq.buyer-123,payee_id.eq.buyer-123",
      );
      expect(result).toBe(true);
    });

    it("should return false if user has no access", async () => {
      mockSupabase._query.or.mockResolvedValue({
        count: 0,
        error: null,
      });

      const result = await canUserAccessPayment(
        mockSupabase as any,
        "other-user",
        "payment-123",
      );

      expect(result).toBe(false);
    });
  });
});
