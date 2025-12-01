import { useCallback } from "react";
import { useProductsUiStore } from "../stores/products-ui.store";
import type { CreateProductsUiInput, UpdateProductsUiInput } from "../types";

export const useProductsUi = () => {
  const {
    items,
    isLoading,
    error,
    setItems,
    addItem,
    updateItem,
    removeItem,
    setLoading,
    setError,
  } = useProductsUiStore();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implement service call
      // const service = getProductsUiService()
      // const result = await service.getItems()

      const result: any[] = []; // Mock

      setItems(result);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch items",
      );
    } finally {
      setLoading(false);
    }
  }, [setItems, setLoading, setError]);

  const createItem = useCallback(
    async (input: CreateProductsUiInput) => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Implement service call
        const newItem = {
          id: crypto.randomUUID(),
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addItem(newItem);
        return newItem;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create item";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [addItem, setLoading, setError],
  );

  const updateItemById = useCallback(
    async (id: string, input: UpdateProductsUiInput) => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Implement service call
        const updates = { ...input, updatedAt: new Date() };

        updateItem(id, updates);
        return updates;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update item";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [updateItem, setLoading, setError],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Implement service call
        removeItem(id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete item";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [removeItem, setLoading, setError],
  );

  return {
    items,
    isLoading,
    error,
    fetchItems,
    createItem,
    updateItem: updateItemById,
    deleteItem,
  };
};
