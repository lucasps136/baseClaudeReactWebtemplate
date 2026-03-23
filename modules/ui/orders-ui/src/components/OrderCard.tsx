/**
 * OrderCard Component
 * Bebarter Modular Architecture
 *
 * Card component for displaying order summary.
 */

import type { Order } from "../types";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";

interface OrderCardProps {
  order: Order;
  onView?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  showActions?: boolean;
  className?: string;
}

export const OrderCard = ({
  order,
  onView,
  onCancel,
  showActions = true,
  className = "",
}: OrderCardProps) => {
  const handleView = () => {
    onView?.(order);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel?.(order);
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

  const canCancel = order.status === "pending" || order.status === "confirmed";

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
      aria-label={`Order ${order.orderNumber}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-primary">
            #{order.orderNumber}
          </span>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
        <PaymentStatusBadge status={order.paymentStatus} size="sm" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Info */}
        <div className="mb-4 flex gap-3">
          {order.productImage ? (
            <img
              src={order.productImage}
              alt={order.productName || "Product"}
              className="h-16 w-16 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <h3 className="truncate font-medium">
              {order.productName || "Product"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Qty: {order.quantity} ×{" "}
              {formatPrice(order.unitPrice, order.currency)}
            </p>
            {order.sellerName && (
              <p className="truncate text-xs text-muted-foreground">
                Seller: {order.sellerName}
              </p>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">
              {formatPrice(order.totalPrice, order.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && canCancel && onCancel && (
          <div className="border-t pt-3">
            <button
              onClick={handleCancel}
              className="w-full rounded-md border border-destructive bg-background px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
              aria-label={`Cancel order ${order.orderNumber}`}
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
