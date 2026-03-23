/**
 * Orders Store
 * Bebarter Modular Architecture
 *
 * Zustand store for order state management.
 * Separates single-order state from list state (Single Responsibility).
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Order, OrderListFilter, PaginationState } from "../types";

// =============================================================================
// STORE STATE
// =============================================================================

interface OrdersState {
  // Single order state
  selectedOrder: Order | null;
  isLoadingOrder: boolean;
  orderError: string | null;

  // List state
  orders: Order[];
  isLoadingOrders: boolean;
  ordersError: string | null;

  // Filter and pagination
  filter: OrderListFilter;
  pagination: PaginationState;

  // Single order actions
  setSelectedOrder: (order: Order | null) => void;
  setLoadingOrder: (loading: boolean) => void;
  setOrderError: (error: string | null) => void;

  // List actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  removeOrder: (id: string) => void;
  setLoadingOrders: (loading: boolean) => void;
  setOrdersError: (error: string | null) => void;

  // Filter and pagination actions
  setFilter: (filter: Partial<OrderListFilter>) => void;
  resetFilter: () => void;
  setPagination: (pagination: Partial<PaginationState>) => void;

  // Reset
  reset: () => void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const defaultFilter: OrderListFilter = {
  sortBy: "createdAt",
  sortOrder: "desc",
  limit: 20,
  offset: 0,
};

const defaultPagination: PaginationState = {
  page: 1,
  pageSize: 20,
  total: 0,
  hasMore: false,
};

// =============================================================================
// STORE
// =============================================================================

export const useOrderStore = create<OrdersState>()(
  devtools(
    (set) => ({
      // Initial state
      selectedOrder: null,
      isLoadingOrder: false,
      orderError: null,
      orders: [],
      isLoadingOrders: false,
      ordersError: null,
      filter: defaultFilter,
      pagination: defaultPagination,

      // Single order actions
      setSelectedOrder: (order) =>
        set({ selectedOrder: order }, false, "setSelectedOrder"),

      setLoadingOrder: (loading) =>
        set({ isLoadingOrder: loading }, false, "setLoadingOrder"),

      setOrderError: (error) =>
        set({ orderError: error }, false, "setOrderError"),

      // List actions
      setOrders: (orders) => set({ orders }, false, "setOrders"),

      addOrder: (order) =>
        set(
          (state) => ({ orders: [order, ...state.orders] }),
          false,
          "addOrder",
        ),

      updateOrder: (id, updates) =>
        set(
          (state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, ...updates } : o,
            ),
            selectedOrder:
              state.selectedOrder?.id === id
                ? { ...state.selectedOrder, ...updates }
                : state.selectedOrder,
          }),
          false,
          "updateOrder",
        ),

      removeOrder: (id) =>
        set(
          (state) => ({
            orders: state.orders.filter((o) => o.id !== id),
            selectedOrder:
              state.selectedOrder?.id === id ? null : state.selectedOrder,
          }),
          false,
          "removeOrder",
        ),

      setLoadingOrders: (loading) =>
        set({ isLoadingOrders: loading }, false, "setLoadingOrders"),

      setOrdersError: (error) =>
        set({ ordersError: error }, false, "setOrdersError"),

      // Filter and pagination actions
      setFilter: (filter) =>
        set(
          (state) => ({ filter: { ...state.filter, ...filter } }),
          false,
          "setFilter",
        ),

      resetFilter: () => set({ filter: defaultFilter }, false, "resetFilter"),

      setPagination: (pagination) =>
        set(
          (state) => ({ pagination: { ...state.pagination, ...pagination } }),
          false,
          "setPagination",
        ),

      // Reset
      reset: () =>
        set(
          {
            selectedOrder: null,
            isLoadingOrder: false,
            orderError: null,
            orders: [],
            isLoadingOrders: false,
            ordersError: null,
            filter: defaultFilter,
            pagination: defaultPagination,
          },
          false,
          "reset",
        ),
    }),
    { name: "orders-store" },
  ),
);
