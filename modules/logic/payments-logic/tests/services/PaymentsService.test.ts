import { PaymentsService } from "../../src/services/payments.service";
import type { IPaymentsRepository } from "../../src/repositories/payments.repository.interface";
import type { IPaymentsValidation } from "../../src/validations/payments.validation";
import type {
  Payment,
  CreatePaymentDTO,
  UpdatePaymentDTO,
  RefundDTO,
  PaymentFilters,
  PaymentStatus,
  PaginatedResult,
  PaymentStats,
} from "../../src/types";

describe("PaymentsService", () => {
  let paymentsService: PaymentsService;
  let mockRepository: jest.Mocked<IPaymentsRepository>;
  let mockValidation: jest.Mocked<IPaymentsValidation>;

  // Mock data
  const mockPayment: Payment = {
    id: "payment-123",
    orderId: "order-456",
    payerId: "buyer-123",
    payeeId: "seller-456",
    amount: 199.8,
    currency: "BRL",
    status: "pending",
    paymentMethod: "pix",
    gateway: "stripe",
    externalId: null,
    gatewayResponse: {},
    failureReason: null,
    metadata: {},
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    paidAt: null,
    refundedAt: null,
  };

  const mockPaymentList: PaginatedResult<Payment> = {
    data: [mockPayment],
    total: 1,
    hasMore: false,
    page: 1,
    pageSize: 20,
  };

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findByExternalId: jest.fn(),
      findMany: jest.fn(),
      findByOrder: jest.fn(),
      findByPayer: jest.fn(),
      findByPayee: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      markAsCompleted: jest.fn(),
      markAsFailed: jest.fn(),
      markAsRefunded: jest.fn(),
      exists: jest.fn(),
      getStats: jest.fn(),
    } as any;

    // Create mock validation
    mockValidation = {
      validateCreatePayment: jest.fn(),
      validateUpdatePayment: jest.fn(),
      validateRefund: jest.fn(),
      validateFilters: jest.fn(),
    } as any;

    // Create service instance with mocks
    paymentsService = new PaymentsService(mockRepository, mockValidation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Constructor Tests
  // ============================================================================

  describe("Constructor", () => {
    it("should initialize with repository and validation dependencies", () => {
      expect(paymentsService).toBeInstanceOf(PaymentsService);
      expect(mockRepository).toBeDefined();
      expect(mockValidation).toBeDefined();
    });
  });

  // ============================================================================
  // getPayment Tests
  // ============================================================================

  describe("getPayment", () => {
    it("should get payment by id successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockPayment);

      const result = await paymentsService.getPayment("payment-123");

      expect(mockRepository.findById).toHaveBeenCalledWith("payment-123");
      expect(result).toEqual(mockPayment);
    });

    it("should return null when payment not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await paymentsService.getPayment("nonexistent");

      expect(result).toBeNull();
    });

    it("should throw error when id is empty", async () => {
      await expect(paymentsService.getPayment("")).rejects.toThrow(
        "Payment ID is required",
      );
    });
  });

  // ============================================================================
  // getPaymentByExternalId Tests
  // ============================================================================

  describe("getPaymentByExternalId", () => {
    it("should get payment by external id successfully", async () => {
      const paymentWithExternal = { ...mockPayment, externalId: "pi_123456" };
      mockRepository.findByExternalId.mockResolvedValue(paymentWithExternal);

      const result = await paymentsService.getPaymentByExternalId("pi_123456");

      expect(mockRepository.findByExternalId).toHaveBeenCalledWith("pi_123456");
      expect(result).toEqual(paymentWithExternal);
    });

    it("should return null when external id not found", async () => {
      mockRepository.findByExternalId.mockResolvedValue(null);

      const result = await paymentsService.getPaymentByExternalId("invalid");

      expect(result).toBeNull();
    });
  });

  // ============================================================================
  // listPayments Tests
  // ============================================================================

  describe("listPayments", () => {
    it("should list payments with default filters", async () => {
      mockValidation.validateFilters.mockReturnValue({});
      mockRepository.findMany.mockResolvedValue(mockPaymentList);

      const result = await paymentsService.listPayments();

      expect(mockValidation.validateFilters).toHaveBeenCalled();
      expect(mockRepository.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockPaymentList);
    });

    it("should list payments with custom filters", async () => {
      const filters: PaymentFilters = {
        status: "completed",
        gateway: "stripe",
        limit: 10,
      };

      mockValidation.validateFilters.mockReturnValue(filters);
      mockRepository.findMany.mockResolvedValue(mockPaymentList);

      const result = await paymentsService.listPayments(filters);

      expect(mockValidation.validateFilters).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockPaymentList);
    });

    it("should filter by payment method", async () => {
      const filters: PaymentFilters = { paymentMethod: "pix" };
      mockValidation.validateFilters.mockReturnValue(filters);
      mockRepository.findMany.mockResolvedValue(mockPaymentList);

      await paymentsService.listPayments(filters);

      expect(mockRepository.findMany).toHaveBeenCalledWith(filters);
    });
  });

  // ============================================================================
  // createPayment Tests
  // ============================================================================

  describe("createPayment", () => {
    const validInput: CreatePaymentDTO = {
      orderId: "order-456",
      payerId: "buyer-123",
      payeeId: "seller-456",
      amount: 199.8,
      currency: "BRL",
      paymentMethod: "pix",
      gateway: "stripe",
    };

    it("should create payment successfully", async () => {
      mockValidation.validateCreatePayment.mockReturnValue(validInput);
      mockRepository.create.mockResolvedValue(mockPayment);

      const result = await paymentsService.createPayment(validInput);

      expect(mockValidation.validateCreatePayment).toHaveBeenCalledWith(
        validInput,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(validInput);
      expect(result).toEqual(mockPayment);
      expect(result.status).toBe("pending");
    });

    it("should validate input before creating", async () => {
      const callOrder: string[] = [];

      mockValidation.validateCreatePayment.mockImplementation((data: any) => {
        callOrder.push("validate");
        return data as CreatePaymentDTO;
      });
      mockRepository.create.mockImplementation(async () => {
        callOrder.push("create");
        return mockPayment;
      });

      await paymentsService.createPayment(validInput);

      expect(callOrder).toEqual(["validate", "create"]);
    });

    it("should throw error when validation fails", async () => {
      mockValidation.validateCreatePayment.mockImplementation(() => {
        throw new Error("Validation failed: amount must be positive");
      });

      await expect(paymentsService.createPayment(validInput)).rejects.toThrow(
        "Validation failed",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // processPayment Tests
  // ============================================================================

  describe("processPayment", () => {
    it("should mark payment as processing", async () => {
      mockRepository.findById.mockResolvedValue(mockPayment);
      const processingPayment = {
        ...mockPayment,
        status: "processing" as PaymentStatus,
      };
      mockRepository.updateStatus.mockResolvedValue(processingPayment);

      const result = await paymentsService.processPayment("payment-123");

      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        "payment-123",
        "processing",
      );
      expect(result.status).toBe("processing");
    });

    it("should throw error if payment not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(paymentsService.processPayment("invalid")).rejects.toThrow(
        "Payment not found",
      );
    });

    it("should not process already completed payment", async () => {
      const completedPayment = {
        ...mockPayment,
        status: "completed" as PaymentStatus,
      };
      mockRepository.findById.mockResolvedValue(completedPayment);

      await expect(
        paymentsService.processPayment("payment-123"),
      ).rejects.toThrow("Cannot process payment with status: completed");
    });
  });

  // ============================================================================
  // completePayment Tests
  // ============================================================================

  describe("completePayment", () => {
    it("should complete payment successfully", async () => {
      const processingPayment = {
        ...mockPayment,
        status: "processing" as PaymentStatus,
      };
      mockRepository.findById.mockResolvedValue(processingPayment);
      const completedPayment = {
        ...processingPayment,
        status: "completed" as PaymentStatus,
        externalId: "pi_123456",
        paidAt: new Date(),
      };
      mockRepository.markAsCompleted.mockResolvedValue(completedPayment);

      const result = await paymentsService.completePayment(
        "payment-123",
        "pi_123456",
      );

      expect(result.status).toBe("completed");
      expect(result.externalId).toBe("pi_123456");
    });
  });

  // ============================================================================
  // failPayment Tests
  // ============================================================================

  describe("failPayment", () => {
    it("should mark payment as failed with reason", async () => {
      mockRepository.findById.mockResolvedValue(mockPayment);
      const failedPayment = {
        ...mockPayment,
        status: "failed" as PaymentStatus,
        failureReason: "Card declined",
      };
      mockRepository.markAsFailed.mockResolvedValue(failedPayment);

      const result = await paymentsService.failPayment(
        "payment-123",
        "Card declined",
      );

      expect(result.status).toBe("failed");
      expect(result.failureReason).toBe("Card declined");
    });

    it("should not fail already completed payment", async () => {
      const completedPayment = {
        ...mockPayment,
        status: "completed" as PaymentStatus,
      };
      mockRepository.findById.mockResolvedValue(completedPayment);

      await expect(
        paymentsService.failPayment("payment-123", "Error"),
      ).rejects.toThrow("Cannot fail payment with status: completed");
    });
  });

  // ============================================================================
  // refundPayment Tests
  // ============================================================================

  describe("refundPayment", () => {
    const completedPayment = {
      ...mockPayment,
      status: "completed" as PaymentStatus,
      paidAt: new Date(),
    };

    it("should process full refund", async () => {
      mockRepository.findById.mockResolvedValue(completedPayment);
      mockValidation.validateRefund.mockReturnValue({ amount: 199.8 });
      const refundedPayment = {
        ...completedPayment,
        status: "refunded" as PaymentStatus,
        refundedAmount: 199.8,
      };
      mockRepository.markAsRefunded.mockResolvedValue(refundedPayment);

      const result = await paymentsService.refundPayment("payment-123");

      expect(result.status).toBe("refunded");
    });

    it("should process partial refund", async () => {
      const refundDTO: RefundDTO = { amount: 50.0, reason: "Partial refund" };
      mockRepository.findById.mockResolvedValue(completedPayment);
      mockValidation.validateRefund.mockReturnValue(refundDTO);
      const partialRefund = {
        ...completedPayment,
        refundedAmount: 50.0,
      };
      mockRepository.markAsRefunded.mockResolvedValue(partialRefund);

      const result = await paymentsService.refundPayment(
        "payment-123",
        refundDTO,
      );
    });

    it("should reject refund exceeding amount", async () => {
      const refundDTO: RefundDTO = { amount: 500.0 };
      mockRepository.findById.mockResolvedValue(completedPayment);
      mockValidation.validateRefund.mockImplementation(() => {
        throw new Error("Refund amount exceeds payment amount");
      });

      await expect(
        paymentsService.refundPayment("payment-123", refundDTO),
      ).rejects.toThrow("Refund amount exceeds payment amount");
    });

    it("should not refund pending payment", async () => {
      mockRepository.findById.mockResolvedValue(mockPayment); // status: pending

      await expect(
        paymentsService.refundPayment("payment-123"),
      ).rejects.toThrow("Cannot refund payment with status: pending");
    });
  });

  // ============================================================================
  // getPaymentsByOrder Tests
  // ============================================================================

  describe("getPaymentsByOrder", () => {
    it("should get payments for order", async () => {
      mockRepository.findByOrder.mockResolvedValue([mockPayment]);

      const result = await paymentsService.getPaymentsByOrder("order-456");

      expect(mockRepository.findByOrder).toHaveBeenCalledWith("order-456");
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no payments", async () => {
      mockRepository.findByOrder.mockResolvedValue([]);

      const result = await paymentsService.getPaymentsByOrder("order-999");

      expect(result).toHaveLength(0);
    });
  });

  // ============================================================================
  // getPaymentsByPayer/Payee Tests
  // ============================================================================

  describe("getPaymentsByPayer", () => {
    it("should get payer payments", async () => {
      mockRepository.findMany.mockResolvedValue(mockPaymentList);

      const result = await paymentsService.getPaymentsByPayer("buyer-123");

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ payerId: "buyer-123" }),
      );
      expect(result).toEqual(mockPaymentList);
    });
  });

  describe("getPaymentsByPayee", () => {
    it("should get payee payments", async () => {
      mockRepository.findMany.mockResolvedValue(mockPaymentList);

      const result = await paymentsService.getPaymentsByPayee("seller-456");

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ payeeId: "seller-456" }),
      );
      expect(result).toEqual(mockPaymentList);
    });

    it("should filter payee payments by status", async () => {
      const filters: PaymentFilters = { status: "completed" };
      mockRepository.findMany.mockResolvedValue(mockPaymentList);

      await paymentsService.getPaymentsByPayee("seller-456", filters);

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ payeeId: "seller-456", ...filters }),
      );
    });
  });

  // ============================================================================
  // getPaymentStats Tests
  // ============================================================================

  describe("getPaymentStats", () => {
    it("should get payment statistics", async () => {
      const mockStats: PaymentStats = {
        totalPayments: 50,
        completedPayments: 40,
        failedPayments: 5,
        refundedPayments: 5,
        pendingPayments: 0,
        totalAmount: 10000.0,
        averageAmount: 200.0,
        byMethod: {
          credit_card: 35,
          debit_card: 5,
          pix: 10,
          boleto: 0,
          wallet: 0,
          bank_transfer: 0,
        },
        byGateway: { stripe: 35, pagarme: 15, mercadopago: 0, internal: 0 },
      };
      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await paymentsService.getPaymentStats(
        "seller-456",
        "payee",
      );

      expect(mockRepository.getStats).toHaveBeenCalledWith(
        "seller-456",
        "payee",
      );
      expect(result).toEqual(mockStats);
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe("Integration Scenarios", () => {
    it("should handle complete payment flow", async () => {
      const createInput: CreatePaymentDTO = {
        orderId: "order-456",
        payerId: "buyer-123",
        payeeId: "seller-456",
        amount: 100.0,
        currency: "BRL",
        paymentMethod: "credit_card",
        gateway: "stripe",
      };

      // Create
      mockValidation.validateCreatePayment.mockReturnValue(createInput);
      mockRepository.create.mockResolvedValue(mockPayment);
      const created = await paymentsService.createPayment(createInput);
      expect(created.status).toBe("pending");

      // Process
      mockRepository.findById.mockResolvedValue(mockPayment);
      const processingPayment = {
        ...mockPayment,
        status: "processing" as PaymentStatus,
      };
      mockRepository.updateStatus.mockResolvedValue(processingPayment);
      const processing = await paymentsService.processPayment(mockPayment.id);
      expect(processing.status).toBe("processing");

      // Complete
      mockRepository.findById.mockResolvedValue(processingPayment);
      const completedPayment = {
        ...processingPayment,
        status: "completed" as PaymentStatus,
        externalId: "pi_123",
        paidAt: new Date(),
      };
      mockRepository.markAsCompleted.mockResolvedValue(completedPayment);
      const completed = await paymentsService.completePayment(
        mockPayment.id,
        "pi_123",
      );
      expect(completed.status).toBe("completed");
    });

    it("should handle payment failure and retry", async () => {
      // First attempt fails
      mockRepository.findById.mockResolvedValue(mockPayment);
      const failedPayment = {
        ...mockPayment,
        status: "failed" as PaymentStatus,
        failureReason: "Card declined",
      };
      mockRepository.markAsFailed.mockResolvedValue(failedPayment);
      const failed = await paymentsService.failPayment(
        mockPayment.id,
        "Card declined",
      );
      expect(failed.status).toBe("failed");

      // Retry creates new payment
      const retryInput: CreatePaymentDTO = {
        orderId: mockPayment.orderId,
        payerId: mockPayment.payerId,
        payeeId: mockPayment.payeeId,
        amount: mockPayment.amount,
        currency: mockPayment.currency,
        paymentMethod: "pix", // Different method
        gateway: "stripe",
      };
      mockValidation.validateCreatePayment.mockReturnValue(retryInput);
      const newPayment = {
        ...mockPayment,
        id: "payment-456",
        paymentMethod: "pix" as const,
      };
      mockRepository.create.mockResolvedValue(newPayment);
      const retry = await paymentsService.createPayment(retryInput);
      expect(retry.paymentMethod).toBe("pix");
    });
  });
});
