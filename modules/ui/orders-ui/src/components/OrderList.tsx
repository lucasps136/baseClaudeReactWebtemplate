/**
 * OrderList Component
 * Bebarter Modular Architecture
 *
 * List component for displaying orders with loading, error, and empty states.
 */

import { useEffect, useState } from "react";
import { useOrders } from "../hooks/useOrders";
import { OrderCard } from "./OrderCard";
import type { Order, OrderStatus } from "../types";
import { ORDER_STATUS_INFO } from "../types";

interface OrderListProps {
  onOrderView?: (order: Order) => void;
  onOrderCancel?: (order: Order) => void;
  initialStatus?: OrderStatus | OrderStatus[];
  className?: string;
}

// Loading skeleton component
const OrderCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg border bg-card">
    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
    </div>
    <div className="p-4">
      <div className="mb-4 flex gap-3">
        <div className="h-16 w-16 animate-pulse rounded-md bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  </div>
);

// Error display component
const ErrorDisplay = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-4 h-12 w-12 text-destructive"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <h3 className="mb-2 text-lg font-semibold text-destructive">
      Error loading orders
    </h3>
    <p className="mb-4 text-sm text-muted-foreground">{error}</p>
    <button
      onClick={onRetry}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Try Again
    </button>
  </div>
);

// Empty state component
const EmptyState = ({ hasFilter }: { hasFilter: boolean }) => (
  <div className="rounded-lg border-2 border-dashed p-12 text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-4 h-16 w-16 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
    <h3 className="mb-2 text-lg font-semibold">
      {hasFilter ? "No orders match your filter" : "No orders yet"}
    </h3>
    <p className="text-sm text-muted-foreground">
      {hasFilter
        ? "Try adjusting your filter criteria."
        : "Your orders will appear here once you make a purchase."}
    </p>
  </div>
);

// Status filter tabs
const StatusFilters = ({
  activeStatus,
  onStatusChange,
}: {
  activeStatus: OrderStatus | OrderStatus[] | undefined;
  onStatusChange: (status: OrderStatus | undefined) => void;
}) => {
  const statuses: (OrderStatus | "all")[] = [
    "all",
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const isActive = (status: OrderStatus | "all") => {
    if (status === "all") return !activeStatus;
    if (Array.isArray(activeStatus)) return activeStatus.includes(status);
    return activeStatus === status;
  };

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {statuses.map((status) => {
        const info =
          status === "all"
            ? { label: "All", color: "gray" }
            : ORDER_STATUS_INFO[status];
        return (
          <button
            key={status}
            onClick={() =>
              onStatusChange(status === "all" ? undefined : status)
            }
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive(status)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {info.label}
          </button>
        );
      })}
    </div>
  );
};

export const OrderList = ({
  onOrderView,
  onOrderCancel,
  initialStatus,
  className = "",
}: OrderListProps) => {
  const {
    orders,
    isLoading,
    error,
    filter,
    pagination,
    fetchOrders,
    setFilter,
    loadMore,
  } = useOrders({ status: initialStatus });

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (status: OrderStatus | undefined) => {
    await setFilter({ status });
  };

  const handleCancel = async (order: Order) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel order #${order.orderNumber}?`,
      )
    ) {
      return;
    }

    try {
      setCancellingId(order.id);
      onOrderCancel?.(order);
    } finally {
      setCancellingId(null);
    }
  };

  const handleRetry = () => {
    fetchOrders();
  };

  const hasFilter = !!filter.status || !!filter.search;

  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Orders</h2>
          <p className="text-sm text-muted-foreground">
            Track your order history
          </p>
        </div>
        <StatusFilters
          activeStatus={filter.status}
          onStatusChange={handleStatusChange}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Orders</h2>
        </div>
        <ErrorDisplay error={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Orders</h2>
          <p className="text-sm text-muted-foreground">
            Track your order history
          </p>
        </div>
        <StatusFilters
          activeStatus={filter.status}
          onStatusChange={handleStatusChange}
        />
        <EmptyState hasFilter={hasFilter} />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <p className="text-sm text-muted-foreground">
          {pagination.total} {pagination.total === 1 ? "order" : "orders"} found
        </p>
      </div>

      {/* Status Filters */}
      <StatusFilters
        activeStatus={filter.status}
        onStatusChange={handleStatusChange}
      />

      {/* Order Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onView={onOrderView}
            onCancel={handleCancel}
            className={cancellingId === order.id ? "opacity-50" : ""}
          />
        ))}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};
