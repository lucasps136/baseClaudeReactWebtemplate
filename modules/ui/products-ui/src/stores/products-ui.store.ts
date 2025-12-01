import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ProductsUiItem } from "../types";

interface ProductsUiState {
  items: ProductsUiItem[];
  isLoading: boolean;
  error: string | null;
}

interface ProductsUiActions {
  setItems: (items: ProductsUiItem[]) => void;
  addItem: (item: ProductsUiItem) => void;
  updateItem: (id: string, updates: Partial<ProductsUiItem>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type ProductsUiStore = ProductsUiState & ProductsUiActions;

const initialState: ProductsUiState = {
  items: [],
  isLoading: false,
  error: null,
};

export const useProductsUiStore = create<ProductsUiStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setItems: (items) =>
        set({ items, error: null }, false, "productsUi/setItems"),

      addItem: (item) =>
        set(
          (state) => ({ items: [...state.items, item] }),
          false,
          "productsUi/addItem",
        ),

      updateItem: (id, updates) =>
        set(
          (state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item,
            ),
          }),
          false,
          "productsUi/updateItem",
        ),

      removeItem: (id) =>
        set(
          (state) => ({ items: state.items.filter((item) => item.id !== id) }),
          false,
          "productsUi/removeItem",
        ),

      setLoading: (isLoading) =>
        set({ isLoading }, false, "productsUi/setLoading"),

      setError: (error) => set({ error }, false, "productsUi/setError"),

      reset: () => set(initialState, false, "productsUi/reset"),
    }),
    { name: "productsUi-store" },
  ),
);
