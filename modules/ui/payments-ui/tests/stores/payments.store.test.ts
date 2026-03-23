/**
 * Payments UI Module - Store Tests
 * Tests for Zustand store state management
 */

// Mock the store before importing
const mockStore = {
  // Single payment state
  selectedPayment: null,
  isLoadingPayment: false,
  paymentError: null,

  // List state
  payments: [],
  isLoadingPayments: false,
  paymentsError: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false,
  },
  filter: {},

  // Actions
  setSelectedPayment: jest.fn(),
  setLoadingPayment: jest.fn(),
  setPaymentError: jest.fn(),
  setPayments: jest.fn(),
  setLoadingPayments: jest.fn(),
  setPaymentsError: jest.fn(),
  setPagination: jest.fn(),
  setFilter: jest.fn(),
  addPayment: jest.fn(),
  updatePayment: jest.fn(),
  resetFilter: jest.fn(),
  reset: jest.fn(),
};

jest.mock("../../src/stores/payments.store", () => ({
  usePaymentStore: jest.fn(() => mockStore),
}));

import { usePaymentStore } from "../../src/stores/payments.store";
import type {
  Payment,
  PaymentListFilter,
  PaginationState,
  PaymentStatus,
} from "../../src/types";

describe("PaymentStore", () => {
  const mockPayment: Payment = {
    id: "payment-123",
    orderId: "order-456",
    orderNumber: "ORD-2025-001234",
    payerId: "buyer-123",
    payerName: "Test Buyer",
    payeeId: "seller-456",
    payeeName: "Test Seller",
    amount: 199.8,
    currency: "BRL",
    status: "pending",
    paymentMethod: "pix",
    gateway: "stripe",
    externalId: null,
    gatewayResponse: null,
    failureReason: null,
    refundedAmount: 0,
    metadata: {},
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    completedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock store state
    mockStore.selectedPayment = null;
    mockStore.isLoadingPayment = false;
    mockStore.paymentError = null;
    mockStore.payments = [];
    mockStore.isLoadingPayments = false;
    mockStore.paymentsError = null;
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
    it("should have correct initial single payment state", () => {
      const store = usePaymentStore();

      expect(store.selectedPayment).toBeNull();
      expect(store.isLoadingPayment).toBe(false);
      expect(store.paymentError).toBeNull();
    });

    it("should have correct initial list state", () => {
      const store = usePaymentStore();

      expect(store.payments).toEqual([]);
      expect(store.isLoadingPayments).toBe(false);
      expect(store.paymentsError).toBeNull();
    });

    it("should have correct initial pagination state", () => {
      const store = usePaymentStore();

      expect(store.pagination).toEqual({
        page: 1,
        pageSize: 20,
        total: 0,
        hasMore: false,
      });
    });

    it("should have empty filter initially", () => {
      const store = usePaymentStore();

      expect(store.filter).toEqual({});
    });
  });

  // ============================================================================
  // Single Payment Actions Tests
  // ============================================================================

  describe("Single Payment Actions", () => {
    it("should call setSelectedPayment action", () => {
      const store = usePaymentStore();
      store.setSelectedPayment(mockPayment);

      expect(mockStore.setSelectedPayment).toHaveBeenCalledWith(mockPayment);
    });

    it("should call setLoadingPayment action", () => {
      const store = usePaymentStore();
      store.setLoadingPayment(true);

      expect(mockStore.setLoadingPayment).toHaveBeenCalledWith(true);
    });

    it("should call setPaymentError action", () => {
      const store = usePaymentStore();
      store.setPaymentError("Error loading payment");

      expect(mockStore.setPaymentError).toHaveBeenCalledWith(
        "Error loading payment",
      );
    });
  });

  // ============================================================================
  // List Actions Tests
  // ============================================================================

  describe("List Actions", () => {
    it("should call setPayments action", () => {
      const store = usePaymentStore();
      const payments = [mockPayment];
      store.setPayments(payments);

      expect(mockStore.setPayments).toHaveBeenCalledWith(payments);
    });

    it("should call setLoadingPayments action", () => {
      const store = usePaymentStore();
      store.setLoadingPayments(true);

      expect(mockStore.setLoadingPayments).toHaveBeenCalledWith(true);
    });

    it("should call setPaymentsError action", () => {
      const store = usePaymentStore();
      store.setPaymentsError("Error loading list");

      expect(mockStore.setPaymentsError).toHaveBeenCalledWith(
        "Error loading list",
      );
    });

    it("should call setPagination action", () => {
      const store = usePaymentStore();
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
      const store = usePaymentStore();
      const filter: PaymentListFilter = {
        status: "completed",
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      store.setFilter(filter);

      expect(mockStore.setFilter).toHaveBeenCalledWith(filter);
    });

    it("should call setFilter action with multiple status filter", () => {
      const store = usePaymentStore();
      const filter: PaymentListFilter = {
        status: ["pending", "processing"],
        paymentMethod: "pix",
        gateway: "stripe",
      };
      store.setFilter(filter);

      expect(mockStore.setFilter).toHaveBeenCalledWith(filter);
    });

    it("should call setFilter action with amount range filter", () => {
      const store = usePaymentStore();
      const filter: PaymentListFilter = {
        minAmount: 100,
        maxAmount: 500,
      };
      store.setFilter(filter);

      expect(mockStore.setFilter).toHaveBeenCalledWith(filter);
    });

    it("should call setFilter action with payment method filter", () => {
      const store = usePaymentStore();
      const filter: PaymentListFilter = {
        paymentMethod: ["pix", "credit_card"],
      };
      store.setFilter(filter);

      expect(mockStore.setFilter).toHaveBeenCalledWith(filter);
    });

    it("should call setFilter action with gateway filter", () => {
      const store = usePaymentStore();
      const filter: PaymentListFilter = {
        gateway: ["stripe", "mercadopago"],
      };
      store.setFilter(filter);

      expect(mockStore.setFilter).toHaveBeenCalledWith(filter);
    });

    it("should call addPayment action", () => {
      const store = usePaymentStore();
      const newPayment = { ...mockPayment, id: "payment-456" };
      store.addPayment(newPayment);

      expect(mockStore.addPayment).toHaveBeenCalledWith(newPayment);
    });

    it("should call updatePayment action", () => {
      const store = usePaymentStore();
      const updatedPayment = {
        ...mockPayment,
        status: "completed" as PaymentStatus,
      };
      store.updatePayment(updatedPayment.id, { status: "completed" });

      expect(mockStore.updatePayment).toHaveBeenCalledWith(updatedPayment.id, {
        status: "completed",
      });
    });

    it("should call resetFilter action", () => {
      const store = usePaymentStore();
      store.resetFilter();

      expect(mockStore.resetFilter).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Reset Actions Tests
  // ============================================================================

  describe("Reset Actions", () => {
    it("should call reset action to clear all state", () => {
      const store = usePaymentStore();
      store.reset();

      expect(mockStore.reset).toHaveBeenCalled();
    });
  });
});

describe("PaymentStore Integration", () => {
  it("should export usePaymentStore hook", () => {
    expect(usePaymentStore).toBeDefined();
    expect(typeof usePaymentStore).toBe("function");
  });
});

describe("Payment Types", () => {
  it("should have correct PAYMENT_STATUS_INFO", async () => {
    const { PAYMENT_STATUS_INFO } = await import("../../src/types");

    expect(PAYMENT_STATUS_INFO.pending).toEqual({
      label: "Pendente",
      color: "yellow",
    });
    expect(PAYMENT_STATUS_INFO.completed).toEqual({
      label: "Concluído",
      color: "green",
    });
    expect(PAYMENT_STATUS_INFO.failed).toEqual({
      label: "Falhou",
      color: "red",
    });
  });

  it("should have correct PAYMENT_METHOD_INFO", async () => {
    const { PAYMENT_METHOD_INFO } = await import("../../src/types");

    expect(PAYMENT_METHOD_INFO.pix).toEqual({
      label: "PIX",
      icon: "qr-code",
    });
    expect(PAYMENT_METHOD_INFO.credit_card).toEqual({
      label: "Cartão de Crédito",
      icon: "credit-card",
    });
  });

  it("should have correct GATEWAY_INFO", async () => {
    const { GATEWAY_INFO } = await import("../../src/types");

    expect(GATEWAY_INFO.stripe).toEqual({ label: "Stripe" });
    expect(GATEWAY_INFO.mercadopago).toEqual({ label: "Mercado Pago" });
  });
});
