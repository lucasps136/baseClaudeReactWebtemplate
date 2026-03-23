import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Product, ProductListFilter, PaginationState } from "../types";

interface ProductState {
  // Single product state
  selectedProduct: Product | null;
  isLoadingProduct: boolean;
  productError: string | null;

  // List state
  products: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;
  filter: ProductListFilter;
  pagination: PaginationState;
}

interface ProductActions {
  // Single product actions
  setSelectedProduct: (product: Product | null) => void;
  setProductLoading: (loading: boolean) => void;
  setProductError: (error: string | null) => void;

  // List actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setProductsLoading: (loading: boolean) => void;
  setProductsError: (error: string | null) => void;
  setFilter: (filter: Partial<ProductListFilter>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;

  // Utility actions
  reset: () => void;
}

export type ProductStore = ProductState & ProductActions;

const initialState: ProductState = {
  selectedProduct: null,
  isLoadingProduct: false,
  productError: null,
  products: [],
  isLoadingProducts: false,
  productsError: null,
  filter: {
    limit: 20,
    offset: 0,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  pagination: {
    hasMore: false,
    total: 0,
    currentPage: 1,
    pageSize: 20,
  },
};

export const useProductStore = create<ProductStore>()(
  devtools(
    (set) => ({
      ...initialState,

      // Single product actions
      setSelectedProduct: (selectedProduct) =>
        set(
          { selectedProduct, productError: null },
          false,
          "product/setSelectedProduct",
        ),

      setProductLoading: (isLoadingProduct) =>
        set({ isLoadingProduct }, false, "product/setProductLoading"),

      setProductError: (productError) =>
        set({ productError }, false, "product/setProductError"),

      // List actions
      setProducts: (products) =>
        set({ products, productsError: null }, false, "product/setProducts"),

      addProduct: (product) =>
        set(
          (state) => ({ products: [...state.products, product] }),
          false,
          "product/addProduct",
        ),

      updateProduct: (id, updates) =>
        set(
          (state) => ({
            products: state.products.map((product) =>
              product.id === id ? { ...product, ...updates } : product,
            ),
            selectedProduct:
              state.selectedProduct?.id === id
                ? { ...state.selectedProduct, ...updates }
                : state.selectedProduct,
          }),
          false,
          "product/updateProduct",
        ),

      removeProduct: (id) =>
        set(
          (state) => ({
            products: state.products.filter((product) => product.id !== id),
            selectedProduct:
              state.selectedProduct?.id === id ? null : state.selectedProduct,
          }),
          false,
          "product/removeProduct",
        ),

      setProductsLoading: (isLoadingProducts) =>
        set({ isLoadingProducts }, false, "product/setProductsLoading"),

      setProductsError: (productsError) =>
        set({ productsError }, false, "product/setProductsError"),

      setFilter: (filterUpdates) =>
        set(
          (state) => ({ filter: { ...state.filter, ...filterUpdates } }),
          false,
          "product/setFilter",
        ),

      setPagination: (paginationUpdates) =>
        set(
          (state) => ({
            pagination: { ...state.pagination, ...paginationUpdates },
          }),
          false,
          "product/setPagination",
        ),

      reset: () => set(initialState, false, "product/reset"),
    }),
    {
      name: "product-store",
    },
  ),
);
