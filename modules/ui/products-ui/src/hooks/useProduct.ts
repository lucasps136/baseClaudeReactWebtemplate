import { useCallback } from "react";
import { useProductStore } from "../stores/products-ui.store";

// Custom hook following Single Responsibility
// Only handles single product operations
export const useProduct = () => {
  const {
    selectedProduct,
    isLoadingProduct,
    productError,
    setSelectedProduct,
    setProductLoading,
    setProductError,
    updateProduct,
    removeProduct,
  } = useProductStore();

  const fetchProduct = useCallback(
    async (id: string) => {
      if (!id) {
        setProductError("Product ID is required");
        return null;
      }

      try {
        setProductLoading(true);
        setProductError(null);

        // TODO: Replace with actual service call when product-logic module is integrated
        // import { productService } from '@/modules/logic/product-logic'
        // const product = await productService.getProductById(id)

        // Mock implementation for now
        const product = null; // await productService.getProductById(id)

        setSelectedProduct(product);
        return product;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch product";
        setProductError(errorMessage);
        return null;
      } finally {
        setProductLoading(false);
      }
    },
    [setSelectedProduct, setProductLoading, setProductError],
  );

  const updateProductById = useCallback(
    async (id: string, updates: Partial<typeof selectedProduct>) => {
      try {
        setProductLoading(true);
        setProductError(null);

        // TODO: Replace with actual service call when product-logic module is integrated
        // import { productService } from '@/modules/logic/product-logic'
        // const updatedProduct = await productService.updateProduct(id, updates)

        // Mock implementation
        const updatedData = { ...updates, updatedAt: new Date() };

        updateProduct(id, updatedData);
        return updatedData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update product";
        setProductError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setProductLoading(false);
      }
    },
    [updateProduct, setProductLoading, setProductError],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        setProductLoading(true);
        setProductError(null);

        // TODO: Replace with actual service call when product-logic module is integrated
        // import { productService } from '@/modules/logic/product-logic'
        // await productService.deleteProduct(id)

        removeProduct(id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete product";
        setProductError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setProductLoading(false);
      }
    },
    [removeProduct, setProductLoading, setProductError],
  );

  const clearProduct = useCallback(() => {
    setSelectedProduct(null);
    setProductError(null);
  }, [setSelectedProduct, setProductError]);

  return {
    // State
    selectedProduct,
    isLoadingProduct,
    productError,

    // Actions
    fetchProduct,
    updateProduct: updateProductById,
    deleteProduct,
    clearProduct,
  };
};
