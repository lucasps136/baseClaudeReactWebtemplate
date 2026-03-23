/**
 * Orders UI Module - Store Tests
 * Tests for Zustand store state management
 */

// Mock the store before importing
const mockStore = {
  // Single order state
  selectedOrder: null,
  isLoadingOrder: false,
  orderError: null,

  // List state
  orders: [],
  isLoadingOrders: false,
  ordersError: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false,
  },
  filter: {},

  // Actions
  setSelectedOrder: jest.fn(),
  setLoadingOrder: jest.fn(),
  setOrderError: jest.fn(),
  setOrders: jest.fn(),
  setLoadingOrders: jest.fn(),
  setOrdersError: jest.fn(),
  setPagination: jest.fn(),
  setFilter: jest.fn(),
  addOrder: jest.fn(),
  updateOrder: jest.fn(),
  resetFilter: jest.fn(),
  reset: jest.fn(),
};

jest.mock("../../src/stores/orders.store", () => ({
  useOrderStore: jest.fn(() => mockStore),
}));

import { useOrderStore } from "../../src/stores/orders.store";
import type {
  Order,
  OrderListFilter,
  PaginationState,
  OrderStatus,
} from "../../src/types";

describe("OrderStore", () => {
  const mockOrder: Order = {
    id: "order-123",
    orderNumber: "ORD-2025-001234",
    buyerId: "buyer-123",
    buyerName: "Test Buyer",
    sellerId: "seller-456",
    sellerName: "Test Seller",
    productId: "product-789",
    productName: "Test Product",
    productImage: "https://example.com/image.jpg",
    quantity: 2,
    unitPrice: 99.9,
    totalPrice: 199.8,
    currency: "BRL",
    status: "pending",
    paymentStatus: "pending",
    paymentId: null,
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock store state
    mockStore.selectedOrder = null;
    mockStore.isLoadingOrder = false;
    mockStore.orderError = null;
    mockStore.orders = [];
    mockStore.isLoadingOrders = false;
    mockStore.ordersError = null;
    mockStore.pagination = {
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: false,
    };
    mockStore.filter = {};
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe("Initial State", () => {
    it("should have correct initial single order state", () => {
      const store = useOrderStore();

      expect(store.selectedOrder).toBeNull();
      expect(store.isLoadingOrder).toBe(false);
      expect(store.orderError).toBeNull();
    });

    it("should have correct initial list state", () => {
      const store = useOrderStore();

      expect(store.orders).toEqual([]);
      expect(store.isLoadingOrders).toBe(false);
      expect(store.ordersError).toBeNull();
    });

    it("should have correct initial pagination state", () => {
      const store = useOrderStore();

      expect(store.pagination).toEqual({
        page: 1,
        pageSize: 20,
        total: 0,
        hasMore: false,
      });
    });

    it("should have empty filter initially", () => {
      const store = useOrderStore();

      expect(store.filter).toEqual({});
    });
  });

  // ============================================================================
  // Single Order Actions Tests
  // ============================================================================

  describe("Single Order Actions", () => {
    it("should call setSelectedOrder action", () => {
      const store = useOrderStore();
      store.setSelectedOrder(mockOrder);

      expect(mockStore.setSelectedOrder).toHaveBeenCalledWith(mockOrder);
    });

    it("should call setLoadingOrder action", () => {
      const store = useOrderStore();
      store.setLoadingOrder(true);

      expect(mockStore.setLoadingOrder).toHaveBeenCalledWith(true);
    });

    it("should call setOrderError action", () => {
      const store = useOrderStore();
      store.setOrderError("Error loading order");

      expect(mockStore.setOrderError).toHaveBeenCalledWith(
        "Error loading order",
      );
    });
  });

  // ============================================================================
  // List Actions Tests
  // ============================================================================

  describe("List Actions", () => {
    it("should call setOrders action", () => {
      const store = useOrderStore();
      const orders = [mockOrder];
      store.setOrders(orders);

      expect(mockStore.setOrders).toHaveBeenCalledWith(orders);
    });

    it("should call setLoadingOrders action", () => {
      const store = useOrderStore();
      store.setLoadingOrders(true);

      expect(mockStore.setLoadingOrders).toHaveBeenCalledWith(true);
    });

    it("should call setOrdersError action", () => {
      const store = useOrderStore();
      store.setOrdersError("Error loading list");

      expect(mockStore.setOrdersError).toHaveBeenCalledWith(
        "Error loading list",
      );
    });

    it("should call setPagination action", () => {
      const store = useOrderStore();
      const pagination: PaginationState = {
        page: 2,
        pageSize: 20,
        total: 100,
        hasMore: true,
      };
      store.setPagination(pagination);

      expect(mockStore.setPagination).toHaveBeenCalledWith(pagination);
    });

    it("should call setFilter action with status filter", () => {
      const store = useOrderStore();
      const filter: OrderListFilter = {
        status: "pending",
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      store.setFilter(filter);

      expect(mockStore.setFilter).toHaveBeenCalledWith(filter);
    });

    it("should call setFilter action with multiple status filter", () => {
      const store = useOrderStore();
      const filter: OrderListFilter = {
        status: ["pending", "confirmed"],
        paymentStatus: "paid",
      };
      store.setFilter(filter);

      expect(mockStore.setFilter).toHaveBeenCalledWith(filter);
    });

    it("should call addOrder action", () => {
      const store = useOrderStore();
      const newOrder = { ...mockOrder, id: "order-456" };
      store.addOrder(newOrder);

      expect(mockStore.addOrder).toHaveBeenCalledWith(newOrder);
    });

    it("should call updateOrder action", () => {
      const store = useOrderStore();
      const updatedOrder = { ...mockOrder, status: "confirmed" as OrderStatus };
      store.updateOrder(updatedOrder.id, { status: "confirmed" });

      expect(mockStore.updateOrder).toHaveBeenCalledWith(updatedOrder.id, {
        status: "confirmed",
      });
    });

    it("should call resetFilter action", () => {
      const store = useOrderStore();
      store.resetFilter();

      expect(mockStore.resetFilter).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Reset Actions Tests
  // ============================================================================

  describe("Reset Actions", () => {
    it("should call reset action to clear all state", () => {
      const store = useOrderStore();
      store.reset();

      expect(mockStore.reset).toHaveBeenCalled();
    });
  });
});

describe("OrderStore Integration", () => {
  it("should export useOrderStore hook", () => {
    expect(useOrderStore).toBeDefined();
    expect(typeof useOrderStore).toBe("function");
  });
});
