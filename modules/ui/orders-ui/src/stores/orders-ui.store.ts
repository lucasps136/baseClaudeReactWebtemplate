import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { OrdersUiItem } from "../types";

interface OrdersUiState {
  items: OrdersUiItem[];
  isLoading: boolean;
  error: string | null;
}

interface OrdersUiActions {
  setItems: (items: OrdersUiItem[]) => void;
  addItem: (item: OrdersUiItem) => void;
  updateItem: (id: string, updates: Partial<OrdersUiItem>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type OrdersUiStore = OrdersUiState & OrdersUiActions;

const initialState: OrdersUiState = {
  items: [],
  isLoading: false,
  error: null,
};

export const useOrdersUiStore = create<OrdersUiStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setItems: (items) =>
        set({ items, error: null }, false, "ordersUi/setItems"),

      addItem: (item) =>
        set(
          (state) => ({ items: [...state.items, item] }),
          false,
          "ordersUi/addItem",
        ),

      updateItem: (id, updates) =>
        set(
          (state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item,
            ),
          }),
          false,
          "ordersUi/updateItem",
        ),

      removeItem: (id) =>
        set(
          (state) => ({ items: state.items.filter((item) => item.id !== id) }),
          false,
          "ordersUi/removeItem",
        ),

      setLoading: (isLoading) =>
        set({ isLoading }, false, "ordersUi/setLoading"),

      setError: (error) => set({ error }, false, "ordersUi/setError"),

      reset: () => set(initialState, false, "ordersUi/reset"),
    }),
    { name: "ordersUi-store" },
  ),
);
