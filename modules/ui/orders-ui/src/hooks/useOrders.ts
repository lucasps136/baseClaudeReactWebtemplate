/**
 * useOrders Hook
 * Bebarter Modular Architecture
 *
 * Hook for order list operations (Single Responsibility).
 */

import { useCallback } from "react";
import { useOrderStore } from "../stores/orders.store";
import type { OrderListFilter, CreateOrderInput } from "../types";

/**
 * Hook for order list operations
 *
 * @example
 * ```tsx
 * const { orders, isLoading, error, fetchOrders, setFilter } = useOrders();
 *
 * useEffect(() => {
 *   fetchOrders({ status: 'pending' });
 * }, []);
 * ```
 */
export function useOrders(initialFilter?: Partial<OrderListFilter>) {
  const {
    orders,
    isLoadingOrders,
    ordersError,
    filter,
    pagination,
    setOrders,
    addOrder,
    removeOrder,
    setLoadingOrders,
    setOrdersError,
    setFilter,
    resetFilter,
    setPagination,
  } = useOrderStore();

  /**
   * Fetch orders with optional filter
   */
  const fetchOrders = useCallback(
    async (filterOverride?: Partial<OrderListFilter>) => {
      setLoadingOrders(true);
      setOrdersError(null);

      const currentFilter = { ...filter, ...initialFilter, ...filterOverride };

      try {
        // TODO: Replace with actual service call
        // const response = await orderService.listOrders(currentFilter);
        // setOrders(response.data);
        // setPagination({ total: response.count, hasMore: response.hasMore });

        console.log("Fetching orders with filter:", currentFilter);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch orders";
        setOrdersError(message);
      } finally {
        setLoadingOrders(false);
      }
    },
    [
      filter,
      initialFilter,
      setLoadingOrders,
      setOrdersError,
      setOrders,
      setPagination,
    ],
  );

  /**
   * Search orders
   */
  const searchOrders = useCallback(
    async (query: string) => {
      setFilter({ search: query, offset: 0 });
      return fetchOrders({ search: query, offset: 0 });
    },
    [setFilter, fetchOrders],
  );

  /**
   * Create new order
   */
  const createOrder = useCallback(
    async (data: CreateOrderInput) => {
      setLoadingOrders(true);
      setOrdersError(null);

      try {
        // TODO: Replace with actual service call
        // const order = await orderService.createOrder(data);
        // addOrder(order);
        // return order;

        console.log("Creating order:", data);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create order";
        setOrdersError(message);
        throw err;
      } finally {
        setLoadingOrders(false);
      }
    },
    [setLoadingOrders, setOrdersError, addOrder],
  );

  /**
   * Delete order
   */
  const deleteOrder = useCallback(
    async (id: string) => {
      setLoadingOrders(true);
      setOrdersError(null);

      try {
        // TODO: Replace with actual service call
        // await orderService.cancelOrder(id);
        removeOrder(id);

        console.log("Deleting order:", id);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete order";
        setOrdersError(message);
        throw err;
      } finally {
        setLoadingOrders(false);
      }
    },
    [setLoadingOrders, setOrdersError, removeOrder],
  );

  /**
   * Load more orders (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || isLoadingOrders) return;

    const nextOffset = (filter.offset || 0) + (filter.limit || 20);
    setFilter({ offset: nextOffset });

    try {
      // TODO: Replace with actual service call
      // const response = await orderService.listOrders({ ...filter, offset: nextOffset });
      // setOrders([...orders, ...response.data]);
      // setPagination({ hasMore: response.hasMore });

      console.log("Loading more orders from offset:", nextOffset);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load more orders";
      setOrdersError(message);
    }
  }, [pagination.hasMore, isLoadingOrders, filter, setFilter, setOrdersError]);

  /**
   * Update filter and refetch
   */
  const updateFilter = useCallback(
    async (newFilter: Partial<OrderListFilter>) => {
      setFilter({ ...newFilter, offset: 0 });
      return fetchOrders({ ...newFilter, offset: 0 });
    },
    [setFilter, fetchOrders],
  );

  /**
   * Clear filter and refetch
   */
  const clearFilter = useCallback(async () => {
    resetFilter();
    return fetchOrders({});
  }, [resetFilter, fetchOrders]);

  return {
    // State
    orders,
    isLoading: isLoadingOrders,
    error: ordersError,
    filter,
    pagination,

    // Actions
    fetchOrders,
    searchOrders,
    createOrder,
    deleteOrder,
    loadMore,
    setFilter: updateFilter,
    clearFilter,
  };
}
