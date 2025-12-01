import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PaymentsUiItem } from "../types";

interface PaymentsUiState {
  items: PaymentsUiItem[];
  isLoading: boolean;
  error: string | null;
}

interface PaymentsUiActions {
  setItems: (items: PaymentsUiItem[]) => void;
  addItem: (item: PaymentsUiItem) => void;
  updateItem: (id: string, updates: Partial<PaymentsUiItem>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type PaymentsUiStore = PaymentsUiState & PaymentsUiActions;

const initialState: PaymentsUiState = {
  items: [],
  isLoading: false,
  error: null,
};

export const usePaymentsUiStore = create<PaymentsUiStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setItems: (items) =>
        set({ items, error: null }, false, "paymentsUi/setItems"),

      addItem: (item) =>
        set(
          (state) => ({ items: [...state.items, item] }),
          false,
          "paymentsUi/addItem",
        ),

      updateItem: (id, updates) =>
        set(
          (state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item,
            ),
          }),
          false,
          "paymentsUi/updateItem",
        ),

      removeItem: (id) =>
        set(
          (state) => ({ items: state.items.filter((item) => item.id !== id) }),
          false,
          "paymentsUi/removeItem",
        ),

      setLoading: (isLoading) =>
        set({ isLoading }, false, "paymentsUi/setLoading"),

      setError: (error) => set({ error }, false, "paymentsUi/setError"),

      reset: () => set(initialState, false, "paymentsUi/reset"),
    }),
    { name: "paymentsUi-store" },
  ),
);
