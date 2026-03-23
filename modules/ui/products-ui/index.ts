// Products UI Module

// Components
export { ProductList } from "./src/components/ProductsUiList";
export { ProductCard } from "./src/components/ProductCard";
export { ProductDetail } from "./src/components/ProductDetail";

// Hooks
export { useProduct } from "./src/hooks/useProduct";
export { useProducts } from "./src/hooks/useProductsUi";

// Store
export { useProductStore } from "./src/stores/products-ui.store";
export type { ProductStore } from "./src/stores/products-ui.store";

// Types
export type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductListFilter,
  PaginationState,
  ProductListResponse,
} from "./src/types";
