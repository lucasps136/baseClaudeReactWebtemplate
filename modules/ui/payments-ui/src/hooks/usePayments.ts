/**
 * usePayments Hook
 * Bebarter Modular Architecture
 *
 * Hook for payment list operations (Single Responsibility).
 */

import { useCallback } from "react";
import { usePaymentStore } from "../stores/payments.store";
import type { PaymentListFilter, CreatePaymentInput } from "../types";

/**
 * Hook for payment list operations
 *
 * @example
 * ```tsx
 * const { payments, isLoading, error, fetchPayments, setFilter } = usePayments();
 *
 * useEffect(() => {
 *   fetchPayments({ status: 'pending' });
 * }, []);
 * ```
 */
export function usePayments(initialFilter?: Partial<PaymentListFilter>) {
  const {
    payments,
    isLoadingPayments,
    paymentsError,
    filter,
    pagination,
    setPayments,
    addPayment,
    removePayment,
    setLoadingPayments,
    setPaymentsError,
    setFilter,
    resetFilter,
    setPagination,
  } = usePaymentStore();

  /**
   * Fetch payments with optional filter
   */
  const fetchPayments = useCallback(
    async (filterOverride?: Partial<PaymentListFilter>) => {
      setLoadingPayments(true);
      setPaymentsError(null);

      const currentFilter = { ...filter, ...initialFilter, ...filterOverride };

      try {
        // TODO: Replace with actual service call
        // const response = await paymentService.listPayments(currentFilter);
        // setPayments(response.data);
        // setPagination({ total: response.count, hasMore: response.hasMore });

        console.log("Fetching payments with filter:", currentFilter);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch payments";
        setPaymentsError(message);
      } finally {
        setLoadingPayments(false);
      }
    },
    [
      filter,
      initialFilter,
      setLoadingPayments,
      setPaymentsError,
      setPayments,
      setPagination,
    ],
  );

  /**
   * Search payments
   */
  const searchPayments = useCallback(
    async (orderId: string) => {
      setFilter({ orderId, offset: 0 });
      return fetchPayments({ orderId, offset: 0 });
    },
    [setFilter, fetchPayments],
  );

  /**
   * Create new payment
   */
  const createPayment = useCallback(
    async (data: CreatePaymentInput) => {
      setLoadingPayments(true);
      setPaymentsError(null);

      try {
        // TODO: Replace with actual service call
        // const payment = await paymentService.createPayment(data);
        // addPayment(payment);
        // return payment;

        console.log("Creating payment:", data);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create payment";
        setPaymentsError(message);
        throw err;
      } finally {
        setLoadingPayments(false);
      }
    },
    [setLoadingPayments, setPaymentsError, addPayment],
  );

  /**
   * Load more payments (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || isLoadingPayments) return;

    const nextOffset = (filter.offset || 0) + (filter.limit || 20);
    setFilter({ offset: nextOffset });

    try {
      // TODO: Replace with actual service call
      // const response = await paymentService.listPayments({ ...filter, offset: nextOffset });
      // setPayments([...payments, ...response.data]);
      // setPagination({ hasMore: response.hasMore });

      console.log("Loading more payments from offset:", nextOffset);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load more payments";
      setPaymentsError(message);
    }
  }, [
    pagination.hasMore,
    isLoadingPayments,
    filter,
    setFilter,
    setPaymentsError,
  ]);

  /**
   * Update filter and refetch
   */
  const updateFilter = useCallback(
    async (newFilter: Partial<PaymentListFilter>) => {
      setFilter({ ...newFilter, offset: 0 });
      return fetchPayments({ ...newFilter, offset: 0 });
    },
    [setFilter, fetchPayments],
  );

  /**
   * Clear filter and refetch
   */
  const clearFilter = useCallback(async () => {
    resetFilter();
    return fetchPayments({});
  }, [resetFilter, fetchPayments]);

  /**
   * Filter by status
   */
  const filterByStatus = useCallback(
    async (status: PaymentListFilter["status"]) => {
      return updateFilter({ status });
    },
    [updateFilter],
  );

  /**
   * Filter by payment method
   */
  const filterByMethod = useCallback(
    async (paymentMethod: PaymentListFilter["paymentMethod"]) => {
      return updateFilter({ paymentMethod });
    },
    [updateFilter],
  );

  /**
   * Filter by date range
   */
  const filterByDateRange = useCallback(
    async (dateFrom: Date, dateTo: Date) => {
      return updateFilter({ dateFrom, dateTo });
    },
    [updateFilter],
  );

  return {
    // State
    payments,
    isLoading: isLoadingPayments,
    error: paymentsError,
    filter,
    pagination,

    // Actions
    fetchPayments,
    searchPayments,
    createPayment,
    loadMore,
    setFilter: updateFilter,
    clearFilter,
    filterByStatus,
    filterByMethod,
    filterByDateRange,
  };
}
