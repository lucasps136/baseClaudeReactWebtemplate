/**
 * useOrder Hook
 * Bebarter Modular Architecture
 *
 * Hook for single order operations (Single Responsibility).
 */

import { useCallback } from "react";
import { useOrderStore } from "../stores/orders.store";
import type { Order, OrderStatus, UpdateOrderInput } from "../types";

/**
 * Hook for single order operations
 *
 * @example
 * ```tsx
 * const { order, isLoading, error, fetchOrder, updateStatus, cancelOrder } = useOrder();
 *
 * useEffect(() => {
 *   fetchOrder(orderId);
 * }, [orderId]);
 * ```
 */
export function useOrder() {
  const {
    selectedOrder,
    isLoadingOrder,
    orderError,
    setSelectedOrder,
    setLoadingOrder,
    setOrderError,
    updateOrder: updateOrderInStore,
  } = useOrderStore();

  /**
   * Fetch single order by ID
   */
  const fetchOrder = useCallback(
    async (id: string) => {
      setLoadingOrder(true);
      setOrderError(null);

      try {
        // TODO: Replace with actual service call
        // const order = await orderService.getOrder(id);
        // setSelectedOrder(order);

        // Placeholder - remove when integrating with service
        console.log("Fetching order:", id);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch order";
        setOrderError(message);
      } finally {
        setLoadingOrder(false);
      }
    },
    [setLoadingOrder, setOrderError],
  );

  /**
   * Update order status
   */
  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      setLoadingOrder(true);
      setOrderError(null);

      try {
        // TODO: Replace with actual service call
        // const updated = await orderService.updateOrderStatus(id, status);
        // updateOrderInStore(id, { status });

        console.log("Updating order status:", id, status);
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateOrderInStore(id, { status });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update order status";
        setOrderError(message);
        throw err;
      } finally {
        setLoadingOrder(false);
      }
    },
    [setLoadingOrder, setOrderError, updateOrderInStore],
  );

  /**
   * Update order details
   */
  const updateOrder = useCallback(
    async (id: string, data: UpdateOrderInput) => {
      setLoadingOrder(true);
      setOrderError(null);

      try {
        // TODO: Replace with actual service call
        console.log("Updating order:", id, data);
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateOrderInStore(id, data as Partial<Order>);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update order";
        setOrderError(message);
        throw err;
      } finally {
        setLoadingOrder(false);
      }
    },
    [setLoadingOrder, setOrderError, updateOrderInStore],
  );

  /**
   * Cancel order
   */
  const cancelOrder = useCallback(
    async (id: string) => {
      return updateOrderStatus(id, "cancelled");
    },
    [updateOrderStatus],
  );

  /**
   * Confirm order
   */
  const confirmOrder = useCallback(
    async (id: string) => {
      return updateOrderStatus(id, "confirmed");
    },
    [updateOrderStatus],
  );

  /**
   * Ship order
   */
  const shipOrder = useCallback(
    async (id: string) => {
      return updateOrderStatus(id, "shipped");
    },
    [updateOrderStatus],
  );

  /**
   * Deliver order
   */
  const deliverOrder = useCallback(
    async (id: string) => {
      return updateOrderStatus(id, "delivered");
    },
    [updateOrderStatus],
  );

  /**
   * Clear selected order
   */
  const clearOrder = useCallback(() => {
    setSelectedOrder(null);
    setOrderError(null);
  }, [setSelectedOrder, setOrderError]);

  return {
    // State
    order: selectedOrder,
    isLoading: isLoadingOrder,
    error: orderError,

    // Actions
    fetchOrder,
    updateOrder,
    updateOrderStatus,
    cancelOrder,
    confirmOrder,
    shipOrder,
    deliverOrder,
    clearOrder,
  };
}
