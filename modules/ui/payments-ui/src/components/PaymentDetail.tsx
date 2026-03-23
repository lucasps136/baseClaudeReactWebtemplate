/**
 * PaymentDetail Component
 * Bebarter Modular Architecture
 *
 * Detailed view component for a single payment.
 */

import { useEffect } from "react";
import { usePayment } from "../hooks/usePayment";
import { PaymentStatusBadge, PaymentMethodBadge } from "./PaymentStatusBadge";
import type { Payment, RefundInput } from "../types";
import { GATEWAY_INFO } from "../types";

interface PaymentDetailProps {
  paymentId: string;
  onBack?: () => void;
  onRefund?: (payment: Payment) => void;
  onRetry?: (payment: Payment) => void;
  className?: string;
}

// Loading skeleton
const PaymentDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-4 rounded-lg border p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  </div>
);

// Info row component
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export const PaymentDetail = ({
  paymentId,
  onBack,
  onRefund,
  onRetry,
  className = "",
}: PaymentDetailProps) => {
  const {
    payment,
    isLoading,
    error,
    fetchPayment,
    refundPayment,
    retryPayment,
  } = usePayment();

  useEffect(() => {
    fetchPayment(paymentId);
  }, [paymentId, fetchPayment]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const handleRefund = async () => {
    if (!payment) return;

    const amount = window.prompt(
      `Enter refund amount (max ${formatPrice(payment.amount - payment.refundedAmount, payment.currency)}):`,
      String(payment.amount - payment.refundedAmount),
    );

    if (!amount) return;

    const numAmount = parseFloat(amount);
    if (
      isNaN(numAmount) ||
      numAmount <= 0 ||
      numAmount > payment.amount - payment.refundedAmount
    ) {
      alert("Invalid refund amount");
      return;
    }

    try {
      await refundPayment(payment.id, { amount: numAmount });
      onRefund?.(payment);
    } catch (err) {
      console.error("Failed to refund payment:", err);
    }
  };

  const handleRetry = async () => {
    if (!payment) return;

    try {
      await retryPayment(payment.id);
      onRetry?.(payment);
    } catch (err) {
      console.error("Failed to retry payment:", err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <PaymentDetailSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center ${className}`}
      >
        <h3 className="mb-2 text-lg font-semibold text-destructive">
          Error loading payment
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => fetchPayment(paymentId)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No payment found
  if (!payment) {
    return (
      <div
        className={`rounded-lg border-2 border-dashed p-12 text-center ${className}`}
      >
        <h3 className="mb-2 text-lg font-semibold">Payment not found</h3>
        <p className="text-sm text-muted-foreground">
          The payment you're looking for doesn't exist or has been removed.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  const canRefund =
    payment.status === "completed" && payment.refundedAmount < payment.amount;
  const canRetry = payment.status === "failed";

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-md p-2 hover:bg-muted"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Payment Details</h1>
            <p className="font-mono text-sm text-muted-foreground">
              {payment.id.substring(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <PaymentMethodBadge method={payment.paymentMethod} />
          <PaymentStatusBadge status={payment.status} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Amount Info */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Amount</h2>
          <p className="text-3xl font-bold text-primary">
            {formatPrice(payment.amount, payment.currency)}
          </p>
          {payment.refundedAmount > 0 && (
            <p className="mt-2 text-sm text-orange-600">
              Refunded: {formatPrice(payment.refundedAmount, payment.currency)}
            </p>
          )}
          {payment.refundedAmount > 0 && (
            <p className="text-sm text-muted-foreground">
              Net:{" "}
              {formatPrice(
                payment.amount - payment.refundedAmount,
                payment.currency,
              )}
            </p>
          )}
        </div>

        {/* Payment Details */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Details</h2>
          <div className="divide-y">
            <InfoRow label="Created" value={formatDate(payment.createdAt)} />
            {payment.completedAt && (
              <InfoRow
                label="Completed"
                value={formatDate(payment.completedAt)}
              />
            )}
            <InfoRow
              label="Gateway"
              value={GATEWAY_INFO[payment.gateway]?.label || payment.gateway}
            />
            {payment.externalId && (
              <InfoRow
                label="External ID"
                value={
                  <span className="font-mono text-xs">
                    {payment.externalId}
                  </span>
                }
              />
            )}
          </div>
        </div>

        {/* Order Info */}
        {payment.orderNumber && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Order</h2>
            <p className="font-mono text-lg">#{payment.orderNumber}</p>
          </div>
        )}

        {/* Payer/Payee Info */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Participants</h2>
          <div className="divide-y">
            {payment.payerName && (
              <InfoRow label="Payer" value={payment.payerName} />
            )}
            {payment.payeeName && (
              <InfoRow label="Payee" value={payment.payeeName} />
            )}
          </div>
        </div>

        {/* Failure Reason */}
        {payment.failureReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
              Failure Reason
            </h2>
            <p className="text-red-700 dark:text-red-300">
              {payment.failureReason}
            </p>
          </div>
        )}

        {/* Gateway Response */}
        {payment.gatewayResponse &&
          Object.keys(payment.gatewayResponse).length > 0 && (
            <div className="rounded-lg border bg-card p-6 lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">Gateway Response</h2>
              <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(payment.gatewayResponse, null, 2)}
              </pre>
            </div>
          )}

        {/* Metadata */}
        {payment.metadata && Object.keys(payment.metadata).length > 0 && (
          <div className="rounded-lg border bg-card p-6 lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Metadata</h2>
            <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
              {JSON.stringify(payment.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      {(canRefund || canRetry) && (
        <div className="mt-6 flex gap-4">
          {canRefund && (
            <button
              onClick={handleRefund}
              className="flex-1 rounded-md border border-orange-500 bg-background px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-500 hover:text-white"
            >
              Refund Payment
            </button>
          )}
          {canRetry && (
            <button
              onClick={handleRetry}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Retry Payment
            </button>
          )}
        </div>
      )}
    </div>
  );
};
