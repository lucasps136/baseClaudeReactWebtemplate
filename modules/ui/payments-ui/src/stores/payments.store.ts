/**
 * Payments Store
 * Bebarter Modular Architecture
 *
 * Zustand store for payment state management.
 * Separates single-payment state from list state (Single Responsibility).
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Payment, PaymentListFilter, PaginationState } from "../types";

// =============================================================================
// STORE STATE
// =============================================================================

interface PaymentsState {
  // Single payment state
  selectedPayment: Payment | null;
  isLoadingPayment: boolean;
  paymentError: string | null;

  // List state
  payments: Payment[];
  isLoadingPayments: boolean;
  paymentsError: string | null;

  // Filter and pagination
  filter: PaymentListFilter;
  pagination: PaginationState;

  // Single payment actions
  setSelectedPayment: (payment: Payment | null) => void;
  setLoadingPayment: (loading: boolean) => void;
  setPaymentError: (error: string | null) => void;

  // List actions
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  removePayment: (id: string) => void;
  setLoadingPayments: (loading: boolean) => void;
  setPaymentsError: (error: string | null) => void;

  // Filter and pagination actions
  setFilter: (filter: Partial<PaymentListFilter>) => void;
  resetFilter: () => void;
  setPagination: (pagination: Partial<PaginationState>) => void;

  // Reset
  reset: () => void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const defaultFilter: PaymentListFilter = {
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

export const usePaymentStore = create<PaymentsState>()(
  devtools(
    (set) => ({
      // Initial state
      selectedPayment: null,
      isLoadingPayment: false,
      paymentError: null,
      payments: [],
      isLoadingPayments: false,
      paymentsError: null,
      filter: defaultFilter,
      pagination: defaultPagination,

      // Single payment actions
      setSelectedPayment: (payment) =>
        set({ selectedPayment: payment }, false, "setSelectedPayment"),

      setLoadingPayment: (loading) =>
        set({ isLoadingPayment: loading }, false, "setLoadingPayment"),

      setPaymentError: (error) =>
        set({ paymentError: error }, false, "setPaymentError"),

      // List actions
      setPayments: (payments) => set({ payments }, false, "setPayments"),

      addPayment: (payment) =>
        set(
          (state) => ({ payments: [payment, ...state.payments] }),
          false,
          "addPayment",
        ),

      updatePayment: (id, updates) =>
        set(
          (state) => ({
            payments: state.payments.map((p) =>
              p.id === id ? { ...p, ...updates } : p,
            ),
            selectedPayment:
              state.selectedPayment?.id === id
                ? { ...state.selectedPayment, ...updates }
                : state.selectedPayment,
          }),
          false,
          "updatePayment",
        ),

      removePayment: (id) =>
        set(
          (state) => ({
            payments: state.payments.filter((p) => p.id !== id),
            selectedPayment:
              state.selectedPayment?.id === id ? null : state.selectedPayment,
          }),
          false,
          "removePayment",
        ),

      setLoadingPayments: (loading) =>
        set({ isLoadingPayments: loading }, false, "setLoadingPayments"),

      setPaymentsError: (error) =>
        set({ paymentsError: error }, false, "setPaymentsError"),

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
            selectedPayment: null,
            isLoadingPayment: false,
            paymentError: null,
            payments: [],
            isLoadingPayments: false,
            paymentsError: null,
            filter: defaultFilter,
            pagination: defaultPagination,
          },
          false,
          "reset",
        ),
    }),
    { name: "payments-store" },
  ),
);
