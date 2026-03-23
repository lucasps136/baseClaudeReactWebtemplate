import { OrdersService } from "../../src/services/orders.service";
import type { IOrdersRepository } from "../../src/repositories/orders.repository.interface";
import type { IOrdersValidation } from "../../src/validations/orders.validation";
import type {
  Order,
  CreateOrderDTO,
  UpdateOrderDTO,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
  PaginatedResult,
  OrderStats,
} from "../../src/types";

describe("OrdersService", () => {
  let ordersService: OrdersService;
  let mockRepository: jest.Mocked<IOrdersRepository>;
  let mockValidation: jest.Mocked<IOrdersValidation>;

  // Mock data
  const mockOrder: Order = {
    id: "order-123",
    orderNumber: "ORD-2025-001234",
    buyerId: "buyer-123",
    sellerId: "seller-456",
    productId: "product-789",
    quantity: 2,
    unitPrice: 99.9,
    totalPrice: 199.8,
    currency: "BRL",
    status: "pending",
    paymentStatus: "pending",
    shippingAddress: {
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
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    paymentId: null,
  };

  const mockOrderList: PaginatedResult<Order> = {
    data: [mockOrder],
    total: 1,
    hasMore: false,
    page: 1,
    pageSize: 20,
  };

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findByOrderNumber: jest.fn(),
      findMany: jest.fn(),
      findByBuyer: jest.fn(),
      findBySeller: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      updatePaymentStatus: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
      exists: jest.fn(),
    } as any;

    // Create mock validation
    mockValidation = {
      validateCreateOrderOrder: jest.fn(),
      validateUpdateOrderOrder: jest.fn(),
      validateUpdateOrderStatus: jest.fn(),
      validateFilters: jest.fn(),
      validateShippingAddress: jest.fn(),
    } as any;

    // Create service instance with mocks
    ordersService = new OrdersService(mockRepository, mockValidation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Constructor Tests
  // ============================================================================

  describe("Constructor", () => {
    it("should initialize with repository and validation dependencies", () => {
      expect(ordersService).toBeInstanceOf(OrdersService);
      expect(mockRepository).toBeDefined();
      expect(mockValidation).toBeDefined();
    });
  });

  // ============================================================================
  // getOrder Tests
  // ============================================================================

  describe("getOrder", () => {
    it("should get order by id successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockOrder);

      const result = await ordersService.getOrder("order-123");

      expect(mockRepository.findById).toHaveBeenCalledWith("order-123");
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockOrder);
    });

    it("should return null when order not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await ordersService.getOrder("nonexistent");

      expect(mockRepository.findById).toHaveBeenCalledWith("nonexistent");
      expect(result).toBeNull();
    });

    it("should throw error when id is empty", async () => {
      await expect(ordersService.getOrder("")).rejects.toThrow(
        "Order ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // getOrderByNumber Tests
  // ============================================================================

  describe("getOrderByNumber", () => {
    it("should get order by number successfully", async () => {
      mockRepository.findByOrderNumber.mockResolvedValue(mockOrder);

      const result = await ordersService.getOrderByNumber("ORD-2025-001234");

      expect(mockRepository.findByOrderNumber).toHaveBeenCalledWith(
        "ORD-2025-001234",
      );
      expect(result).toEqual(mockOrder);
    });

    it("should return null when order number not found", async () => {
      mockRepository.findByOrderNumber.mockResolvedValue(null);

      const result = await ordersService.getOrderByNumber("INVALID");

      expect(result).toBeNull();
    });
  });

  // ============================================================================
  // listOrders Tests
  // ============================================================================

  describe("listOrders", () => {
    it("should list orders with default filters", async () => {
      mockValidation.validateFilters.mockReturnValue({});
      mockRepository.findMany.mockResolvedValue(mockOrderList);

      const result = await ordersService.listOrders();

      expect(mockValidation.validateFilters).toHaveBeenCalled();
      expect(mockRepository.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockOrderList);
    });

    it("should list orders with custom filters", async () => {
      const filters: OrderFilters = {
        status: "pending",
        buyerId: "buyer-123",
        limit: 10,
      };

      mockValidation.validateFilters.mockReturnValue(filters);
      mockRepository.findMany.mockResolvedValue(mockOrderList);

      const result = await ordersService.listOrders(filters);

      expect(mockValidation.validateFilters).toHaveBeenCalledWith(filters);
      expect(mockRepository.findMany).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockOrderList);
    });

    it("should handle empty result set", async () => {
      const emptyResult: PaginatedResult<Order> = {
        data: [],
        total: 0,
        hasMore: false,
        page: 1,
        pageSize: 20,
      };
      mockValidation.validateFilters.mockReturnValue({});
      mockRepository.findMany.mockResolvedValue(emptyResult);

      const result = await ordersService.listOrders();

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ============================================================================
  // createOrder Tests
  // ============================================================================

  describe("createOrder", () => {
    const validInput: CreateOrderDTO = {
      buyerId: "buyer-123",
      sellerId: "seller-456",
      productId: "product-789",
      quantity: 2,
      unitPrice: 99.9,
      currency: "BRL",
      shippingAddress: mockOrder.shippingAddress || undefined,
    };

    it("should create order successfully", async () => {
      mockValidation.validateCreateOrder.mockReturnValue(validInput);
      mockRepository.create.mockResolvedValue(mockOrder);

      const result = await ordersService.createOrder(validInput);

      expect(mockValidation.validateCreateOrder).toHaveBeenCalledWith(
        validInput,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(validInput);
      expect(result).toEqual(mockOrder);
    });

    it("should validate input before creating", async () => {
      const callOrder: string[] = [];

      mockValidation.validateCreateOrder.mockImplementation((data) => {
        callOrder.push("validate");
        return data as CreateOrderDTO;
      });
      mockRepository.create.mockImplementation(async () => {
        callOrder.push("create");
        return mockOrder;
      });

      await ordersService.createOrder(validInput);

      expect(callOrder).toEqual(["validate", "create"]);
    });

    it("should throw error when validation fails", async () => {
      mockValidation.validateCreateOrder.mockImplementation(() => {
        throw new Error("Validation failed: buyerId is required");
      });

      await expect(ordersService.createOrder(validInput)).rejects.toThrow(
        "Validation failed",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // updateOrder Tests
  // ============================================================================

  describe("updateOrder", () => {
    const validUpdate: UpdateOrderDTO = {
      notes: "Updated notes",
      metadata: { priority: "high" },
    };

    it("should update order successfully", async () => {
      mockRepository.exists.mockResolvedValue(true);
      mockValidation.validateUpdateOrder.mockReturnValue(validUpdate);
      const updatedOrder = { ...mockOrder, ...validUpdate };
      mockRepository.update.mockResolvedValue(updatedOrder);

      const result = await ordersService.updateOrder("order-123", validUpdate);

      expect(mockRepository.findById).toHaveBeenCalledWith("order-123");
      expect(mockValidation.validateUpdateOrder).toHaveBeenCalledWith(
        validUpdate,
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        "order-123",
        validUpdate,
      );
      expect(result).toEqual(updatedOrder);
    });

    it("should throw error when order not found", async () => {
      mockRepository.exists.mockResolvedValue(false);

      await expect(
        ordersService.updateOrder("nonexistent", validUpdate),
      ).rejects.toThrow("Order not found");

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // updateOrderStatus Tests
  // ============================================================================

  describe("updateOrderStatus", () => {
    it("should update status successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockOrder);
      // Removed transition validation
      const updatedOrder = { ...mockOrder, status: "confirmed" as OrderStatus };
      mockRepository.updateStatus.mockResolvedValue(updatedOrder);

      const result = await ordersService.updateOrderStatus(
        "order-123",
        "confirmed",
      );

      expect(mockRepository.findById).toHaveBeenCalledWith("order-123");
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        "order-123",
        "confirmed",
      );
      expect(result.status).toBe("confirmed");
    });

    it("should allow transition from pending to cancelled", async () => {
      mockRepository.findById.mockResolvedValue(mockOrder);
      // Removed transition validation
      const cancelledOrder = {
        ...mockOrder,
        status: "cancelled" as OrderStatus,
      };
      mockRepository.updateStatus.mockResolvedValue(cancelledOrder);

      const result = await ordersService.updateOrderStatus(
        "order-123",
        "cancelled",
      );

      expect(result.status).toBe("cancelled");
    });
  });

  // ============================================================================
  // Convenience Methods Tests
  // ============================================================================

  describe("Convenience Methods", () => {
    describe("confirmOrder", () => {
      it("should confirm order successfully", async () => {
        mockRepository.findById.mockResolvedValue(mockOrder);
        // Removed transition validation
        mockRepository.updateStatus.mockResolvedValue({
          ...mockOrder,
          status: "confirmed" as OrderStatus,
        });

        const result = await ordersService.confirmOrder("order-123");

        expect(result.status).toBe("confirmed");
      });
    });

    describe("shipOrder", () => {
      it("should ship confirmed order", async () => {
        const confirmedOrder = {
          ...mockOrder,
          status: "confirmed" as OrderStatus,
        };
        mockRepository.findById.mockResolvedValue(confirmedOrder);
        // Removed transition validation
        mockRepository.updateStatus.mockResolvedValue({
          ...confirmedOrder,
          status: "shipped" as OrderStatus,
        });

        const result = await ordersService.shipOrder("order-123");

        expect(result.status).toBe("shipped");
      });
    });

    describe("deliverOrder", () => {
      it("should mark shipped order as delivered", async () => {
        const shippedOrder = { ...mockOrder, status: "shipped" as OrderStatus };
        mockRepository.findById.mockResolvedValue(shippedOrder);
        // Removed transition validation
        mockRepository.updateStatus.mockResolvedValue({
          ...shippedOrder,
          status: "delivered" as OrderStatus,
        });

        const result = await ordersService.deliverOrder("order-123");

        expect(result.status).toBe("delivered");
      });
    });

    describe("cancelOrder", () => {
      it("should cancel pending order", async () => {
        mockRepository.findById.mockResolvedValue(mockOrder);
        // Removed transition validation
        mockRepository.updateStatus.mockResolvedValue({
          ...mockOrder,
          status: "cancelled" as OrderStatus,
        });

        const result = await ordersService.cancelOrder("order-123");

        expect(result.status).toBe("cancelled");
      });
    });
  });

  // ============================================================================
  // getOrdersByBuyer Tests
  // ============================================================================

  describe("getOrdersByBuyer", () => {
    it("should get buyer orders successfully", async () => {
      mockRepository.findMany.mockResolvedValue(mockOrderList);

      const result = await ordersService.getOrdersByBuyer("buyer-123");

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ buyerId: "buyer-123" }),
      );
      expect(result).toEqual(mockOrderList);
    });

    it("should throw error when buyerId is empty", async () => {
      await expect(ordersService.getOrdersByBuyer("")).rejects.toThrow(
        "Buyer ID is required",
      );
    });
  });

  // ============================================================================
  // getOrdersBySeller Tests
  // ============================================================================

  describe("getOrdersBySeller", () => {
    it("should get seller orders successfully", async () => {
      mockRepository.findMany.mockResolvedValue(mockOrderList);

      const result = await ordersService.getOrdersBySeller("seller-456");

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ sellerId: "seller-456" }),
      );
      expect(result).toEqual(mockOrderList);
    });

    it("should filter seller orders by status", async () => {
      const filters: OrderFilters = { status: "pending" };
      mockRepository.findMany.mockResolvedValue(mockOrderList);

      await ordersService.getOrdersBySeller("seller-456", filters);

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ sellerId: "seller-456", ...filters }),
      );
    });
  });

  // ============================================================================
  // getOrderStats Tests
  // ============================================================================

  describe("getOrderStats", () => {
    it("should get order statistics", async () => {
      const mockStats: OrderStats = {
        totalOrders: 100,
        pendingOrders: 20,
        completedOrders: 70,
        cancelledOrders: 10,
        totalRevenue: 15000.0,
        averageOrderValue: 150.0,
      };
      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await ordersService.getOrderStats("seller-456");

      expect(mockRepository.getStats).toHaveBeenCalledWith("seller-456");
      expect(result).toEqual(mockStats);
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe("Integration Scenarios", () => {
    it("should handle complete order flow", async () => {
      const createInput: CreateOrderDTO = {
        buyerId: "buyer-123",
        sellerId: "seller-456",
        productId: "product-789",
        quantity: 1,
        unitPrice: 100.0,
        currency: "BRL",
        shippingAddress: mockOrder.shippingAddress || undefined,
      };

      // Create
      mockValidation.validateCreateOrder.mockReturnValue(createInput);
      mockRepository.create.mockResolvedValue(mockOrder);
      const created = await ordersService.createOrder(createInput);
      expect(created.status).toBe("pending");

      // Confirm
      mockRepository.findById.mockResolvedValue(mockOrder);
      // Removed transition validation
      const confirmed = { ...mockOrder, status: "confirmed" as OrderStatus };
      mockRepository.updateStatus.mockResolvedValue(confirmed);
      const confirmedResult = await ordersService.confirmOrder(mockOrder.id);
      expect(confirmedResult.status).toBe("confirmed");

      // Ship
      mockRepository.findById.mockResolvedValue(confirmed);
      const shipped = { ...confirmed, status: "shipped" as OrderStatus };
      mockRepository.updateStatus.mockResolvedValue(shipped);
      const shippedResult = await ordersService.shipOrder(mockOrder.id);
      expect(shippedResult.status).toBe("shipped");

      // Deliver
      mockRepository.findById.mockResolvedValue(shipped);
      const delivered = { ...shipped, status: "delivered" as OrderStatus };
      mockRepository.updateStatus.mockResolvedValue(delivered);
      const deliveredResult = await ordersService.deliverOrder(mockOrder.id);
      expect(deliveredResult.status).toBe("delivered");
    });
  });
});
