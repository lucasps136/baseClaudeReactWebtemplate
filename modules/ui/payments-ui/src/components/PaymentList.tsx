/**
 * PaymentList Component
 * Bebarter Modular Architecture
 *
 * List component for displaying payments with loading, error, and empty states.
 */

import { useEffect, useState } from "react";
import { usePayments } from "../hooks/usePayments";
import { PaymentCard } from "./PaymentCard";
import type { Payment, PaymentStatus, PaymentMethod } from "../types";
import { PAYMENT_STATUS_INFO, PAYMENT_METHOD_INFO } from "../types";

interface PaymentListProps {
  onPaymentView?: (payment: Payment) => void;
  onPaymentRefund?: (payment: Payment) => void;
  onPaymentRetry?: (payment: Payment) => void;
  initialStatus?: PaymentStatus | PaymentStatus[];
  className?: string;
}

// Loading skeleton component
const PaymentCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg border bg-card">
    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
      <div className="h-5 w-32 animate-pulse rounded-full bg-muted" />
      <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
    </div>
    <div className="p-4">
      <div className="mb-4">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-8 w-32 animate-pulse rounded bg-muted" />
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
      Error loading payments
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
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
    <h3 className="mb-2 text-lg font-semibold">
      {hasFilter ? "No payments match your filter" : "No payments yet"}
    </h3>
    <p className="text-sm text-muted-foreground">
      {hasFilter
        ? "Try adjusting your filter criteria."
        : "Your payment history will appear here."}
    </p>
  </div>
);

// Status filter tabs
const StatusFilters = ({
  activeStatus,
  onStatusChange,
}: {
  activeStatus: PaymentStatus | PaymentStatus[] | undefined;
  onStatusChange: (status: PaymentStatus | undefined) => void;
}) => {
  const statuses: (PaymentStatus | "all")[] = [
    "all",
    "pending",
    "processing",
    "completed",
    "failed",
    "refunded",
  ];

  const isActive = (status: PaymentStatus | "all") => {
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
            : PAYMENT_STATUS_INFO[status];
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

export const PaymentList = ({
  onPaymentView,
  onPaymentRefund,
  onPaymentRetry,
  initialStatus,
  className = "",
}: PaymentListProps) => {
  const {
    payments,
    isLoading,
    error,
    filter,
    pagination,
    fetchPayments,
    filterByStatus,
    loadMore,
  } = usePayments({ status: initialStatus });

  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleStatusChange = async (status: PaymentStatus | undefined) => {
    await filterByStatus(status);
  };

  const handleRefund = async (payment: Payment) => {
    if (
      !window.confirm(
        `Are you sure you want to refund this payment of ${payment.amount}?`,
      )
    ) {
      return;
    }

    try {
      setProcessingId(payment.id);
      onPaymentRefund?.(payment);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRetry = async (payment: Payment) => {
    try {
      setProcessingId(payment.id);
      onPaymentRetry?.(payment);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRetryFetch = () => {
    fetchPayments();
  };

  const hasFilter =
    !!filter.status || !!filter.paymentMethod || !!filter.orderId;

  // Loading state
  if (isLoading && payments.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="text-sm text-muted-foreground">Your payment history</p>
        </div>
        <StatusFilters
          activeStatus={filter.status}
          onStatusChange={handleStatusChange}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PaymentCardSkeleton key={i} />
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
          <h2 className="text-2xl font-bold">Payments</h2>
        </div>
        <ErrorDisplay error={error} onRetry={handleRetryFetch} />
      </div>
    );
  }

  // Empty state
  if (payments.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="text-sm text-muted-foreground">Your payment history</p>
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
        <h2 className="text-2xl font-bold">Payments</h2>
        <p className="text-sm text-muted-foreground">
          {pagination.total} {pagination.total === 1 ? "payment" : "payments"}{" "}
          found
        </p>
      </div>

      {/* Status Filters */}
      <StatusFilters
        activeStatus={filter.status}
        onStatusChange={handleStatusChange}
      />

      {/* Payment Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {payments.map((payment) => (
          <PaymentCard
            key={payment.id}
            payment={payment}
            onView={onPaymentView}
            onRefund={handleRefund}
            onRetry={handleRetry}
            className={processingId === payment.id ? "opacity-50" : ""}
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
