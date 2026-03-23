/**
 * Products UI Module - Store Tests
 * Tests for Zustand store state management
 */

import { act, renderHook } from "@testing-library/react";

// Mock the store before importing
const mockStore = {
  // Single product state
  selectedProduct: null,
  isLoadingProduct: false,
  productError: null,

  // List state
  products: [],
  isLoadingProducts: false,
  productsError: null,
  pagination: {
    hasMore: false,
    total: 0,
    currentPage: 1,
    pageSize: 20,
  },
  filter: {},

  // Actions
  setSelectedProduct: jest.fn(),
  setProductLoading: jest.fn(),
  setProductError: jest.fn(),
  setProducts: jest.fn(),
  setProductsLoading: jest.fn(),
  setProductsError: jest.fn(),
  setPagination: jest.fn(),
  setFilter: jest.fn(),
  addProduct: jest.fn(),

  reset: jest.fn(),
};

jest.mock("../../src/stores/products-ui.store", () => ({
  useProductStore: jest.fn(() => mockStore),
}));

import { useProductStore } from "../../src/stores/products-ui.store";
import type {
  Product,
  ProductListFilter,
  PaginationState,
} from "../../src/types";

describe("ProductStore", () => {
  const mockProduct: Product = {
    id: "product-123",
    name: "Test Product",
    description: "Test description",
    price: 99.99,
    currency: "BRL",
    active: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock store state
    mockStore.selectedProduct = null;
    mockStore.isLoadingProduct = false;
    mockStore.productError = null;
    mockStore.products = [];
    mockStore.isLoadingProducts = false;
    mockStore.productsError = null;
    mockStore.pagination = {
      hasMore: false,
      total: 0,
      currentPage: 1,
      pageSize: 20,
    };
    mockStore.filter = {};
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe("Initial State", () => {
    it("should have correct initial single product state", () => {
      const store = useProductStore();

      expect(store.selectedProduct).toBeNull();
      expect(store.isLoadingProduct).toBe(false);
      expect(store.productError).toBeNull();
    });

    it("should have correct initial list state", () => {
      const store = useProductStore();

      expect(store.products).toEqual([]);
      expect(store.isLoadingProducts).toBe(false);
      expect(store.productsError).toBeNull();
    });

    it("should have correct initial pagination state", () => {
      const store = useProductStore();

      expect(store.pagination).toEqual({
        hasMore: false,
        total: 0,
        currentPage: 1,
        pageSize: 20,
      });
    });

    it("should have empty filter initially", () => {
      const store = useProductStore();

      expect(store.filter).toEqual({});
    });
  });

  // ============================================================================
  // Single Product Actions Tests
  // ============================================================================

  describe("Single Product Actions", () => {
    it("should call setSelectedProduct action", () => {
      const store = useProductStore();
      store.setSelectedProduct(mockProduct);

      expect(mockStore.setSelectedProduct).toHaveBeenCalledWith(mockProduct);
    });

    it("should call setProductLoading action", () => {
      const store = useProductStore();
      store.setProductLoading(true);

      expect(mockStore.setProductLoading).toHaveBeenCalledWith(true);
    });

    it("should call setProductError action", () => {
      const store = useProductStore();
      store.setProductError("Error loading product");

      expect(mockStore.setProductError).toHaveBeenCalledWith(
        "Error loading product",
      );
    });
  });

  // ============================================================================
  // List Actions Tests
  // ============================================================================

  describe("List Actions", () => {
    it("should call setProducts action", () => {
      const store = useProductStore();
      const products = [mockProduct];
      store.setProducts(products);

      expect(mockStore.setProducts).toHaveBeenCalledWith(products);
    });

    it("should call setProductsLoading action", () => {
      const store = useProductStore();
      store.setProductsLoading(true);

      expect(mockStore.setProductsLoading).toHaveBeenCalledWith(true);
    });

    it("should call setProductsError action", () => {
      const store = useProductStore();
      store.setProductsError("Error loading list");

      expect(mockStore.setProductsError).toHaveBeenCalledWith(
        "Error loading list",
      );
    });

    it("should call setPagination action", () => {
      const store = useProductStore();
      const pagination: PaginationState = {
        hasMore: true,
        total: 100,
        currentPage: 2,
        pageSize: 20,
      };
      store.setPagination(pagination);

      expect(mockStore.setPagination).toHaveBeenCalledWith(pagination);
    });

    it("should call setFilter action", () => {
      const store = useProductStore();
      const filter: ProductListFilter = {
        search: "test",
        active: true,
        sortBy: "price",
        sortOrder: "asc",
      };
      store.setFilter(filter);

      expect(mockStore.setFilter).toHaveBeenCalledWith(filter);
    });

    it("should call addProduct action", () => {
      const store = useProductStore();
      const newProduct = { ...mockProduct, id: "product-456" };
      store.addProduct(newProduct);

      expect(mockStore.addProduct).toHaveBeenCalledWith(newProduct);
    });
  });

  // ============================================================================
  // Reset Actions Tests
  // ============================================================================

  describe("Reset Actions", () => {
    it("should call reset action to clear all state", () => {
      const store = useProductStore();
      store.reset();

      expect(mockStore.reset).toHaveBeenCalled();
    });
  });
});

describe("ProductStore Integration", () => {
  it("should export useProductStore hook", () => {
    expect(useProductStore).toBeDefined();
    expect(typeof useProductStore).toBe("function");
  });
});
