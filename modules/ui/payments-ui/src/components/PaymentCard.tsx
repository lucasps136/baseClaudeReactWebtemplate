/**
 * PaymentCard Component
 * Bebarter Modular Architecture
 *
 * Card component for displaying payment summary.
 */

import type { Payment } from "../types";
import { PaymentStatusBadge, PaymentMethodBadge } from "./PaymentStatusBadge";

interface PaymentCardProps {
  payment: Payment;
  onView?: (payment: Payment) => void;
  onRefund?: (payment: Payment) => void;
  onRetry?: (payment: Payment) => void;
  showActions?: boolean;
  className?: string;
}

export const PaymentCard = ({
  payment,
  onView,
  onRefund,
  onRetry,
  showActions = true,
  className = "",
}: PaymentCardProps) => {
  const handleView = () => {
    onView?.(payment);
  };

  const handleRefund = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRefund?.(payment);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRetry?.(payment);
  };

  const formatPrice = (price: number, currency: string) => {
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    });
    return formatter.format(price);
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

  const canRefund = payment.status === "completed";
  const canRetry = payment.status === "failed";

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md ${
        onView ? "cursor-pointer" : ""
      } ${className}`}
      onClick={handleView}
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
      onKeyDown={(e) => {
        if (onView && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleView();
        }
      }}
      aria-label={`Payment ${payment.id.substring(0, 8)}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <PaymentMethodBadge method={payment.paymentMethod} size="sm" />
        </div>
        <PaymentStatusBadge status={payment.status} size="sm" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Amount */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(payment.amount, payment.currency)}
          </p>
          {payment.refundedAmount > 0 && (
            <p className="text-sm text-orange-600">
              Refunded: {formatPrice(payment.refundedAmount, payment.currency)}
            </p>
          )}
        </div>

        {/* Order Info */}
        {payment.orderNumber && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">Order</p>
            <p className="font-mono text-sm">#{payment.orderNumber}</p>
          </div>
        )}

        {/* Details */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{formatDate(payment.createdAt)}</span>
          </div>
          {payment.gateway && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gateway</span>
              <span className="capitalize">{payment.gateway}</span>
            </div>
          )}
          {payment.completedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span>{formatDate(payment.completedAt)}</span>
            </div>
          )}
        </div>

        {/* Failure Reason */}
        {payment.failureReason && (
          <div className="mt-3 rounded-md bg-red-50 p-2 dark:bg-red-900/20">
            <p className="text-xs text-red-600 dark:text-red-400">
              {payment.failureReason}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-2 border-t pt-3">
            {canRefund && onRefund && (
              <button
                onClick={handleRefund}
                className="flex-1 rounded-md border border-orange-500 bg-background px-3 py-2 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-500 hover:text-white"
                aria-label="Refund payment"
              >
                Refund
              </button>
            )}
            {canRetry && onRetry && (
              <button
                onClick={handleRetry}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                aria-label="Retry payment"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
