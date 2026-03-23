import { useCallback } from "react";
import { useProductStore } from "../stores/products-ui.store";
import type {
  ProductListFilter,
  CreateProductInput,
  UpdateProductInput,
} from "../types";

// Custom hook following Single Responsibility
// Only handles product list operations
export const useProducts = () => {
  const {
    products,
    isLoadingProducts,
    productsError,
    filter,
    pagination,
    setProducts,
    addProduct,
    updateProduct,
    removeProduct,
    setProductsLoading,
    setProductsError,
    setFilter,
    setPagination,
  } = useProductStore();

  const fetchProducts = useCallback(
    async (newFilter?: Partial<ProductListFilter>) => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        if (newFilter) {
          setFilter(newFilter);
        }

        // TODO: Replace with actual service call when product-logic module is integrated
        // import { productService } from '@/modules/logic/product-logic'
        // const result = await productService.getProducts({ ...filter, ...newFilter })

        // Mock implementation for now
        const result = {
          products: [],
          total: 0,
          hasMore: false,
        };

        setProducts(result.products);
        setPagination({
          total: result.total,
          hasMore: result.hasMore,
        });
      } catch (error) {
        setProductsError(
          error instanceof Error ? error.message : "Failed to fetch products",
        );
      } finally {
        setProductsLoading(false);
      }
    },
    [
      filter,
      setProducts,
      setProductsLoading,
      setProductsError,
      setFilter,
      setPagination,
    ],
  );

  const searchProducts = useCallback(
    async (search: string) => {
      await fetchProducts({ search, offset: 0 });
    },
    [fetchProducts],
  );

  const createProduct = useCallback(
    async (input: CreateProductInput) => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        // TODO: Replace with actual service call when product-logic module is integrated
        // import { productService } from '@/modules/logic/product-logic'
        // const newProduct = await productService.createProduct(input)

        // Mock implementation
        const newProduct = {
          id: crypto.randomUUID(),
          active: input.active ?? true,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addProduct(newProduct);
        return newProduct;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create product";
        setProductsError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setProductsLoading(false);
      }
    },
    [addProduct, setProductsLoading, setProductsError],
  );

  const updateProductById = useCallback(
    async (id: string, input: UpdateProductInput) => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        // TODO: Replace with actual service call when product-logic module is integrated
        // import { productService } from '@/modules/logic/product-logic'
        // const updatedProduct = await productService.updateProduct(id, input)

        // Mock implementation
        const updates = { ...input, updatedAt: new Date() };

        updateProduct(id, updates);
        return updates;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update product";
        setProductsError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setProductsLoading(false);
      }
    },
    [updateProduct, setProductsLoading, setProductsError],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        // TODO: Replace with actual service call when product-logic module is integrated
        // import { productService } from '@/modules/logic/product-logic'
        // await productService.deleteProduct(id)

        removeProduct(id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete product";
        setProductsError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setProductsLoading(false);
      }
    },
    [removeProduct, setProductsLoading, setProductsError],
  );

  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || isLoadingProducts) return;

    const nextOffset = products.length;
    await fetchProducts({ ...filter, offset: nextOffset });
  }, [
    pagination.hasMore,
    isLoadingProducts,
    products.length,
    filter,
    fetchProducts,
  ]);

  return {
    // State
    products,
    isLoadingProducts,
    productsError,
    filter,
    pagination,

    // Actions
    fetchProducts,
    searchProducts,
    createProduct,
    updateProduct: updateProductById,
    deleteProduct,
    loadMore,
    setFilter,
  };
};
