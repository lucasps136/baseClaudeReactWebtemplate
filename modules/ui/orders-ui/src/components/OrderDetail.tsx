/**
 * OrderDetail Component
 * Bebarter Modular Architecture
 *
 * Detailed view component for a single order.
 */

import { useEffect } from "react";
import { useOrder } from "../hooks/useOrder";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import type { Order, OrderStatus, ShippingAddress } from "../types";

interface OrderDetailProps {
  orderId: string;
  onBack?: () => void;
  onStatusChange?: (order: Order, newStatus: OrderStatus) => void;
  className?: string;
}

// Loading skeleton
const OrderDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
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

// Address display component
const AddressDisplay = ({ address }: { address: ShippingAddress }) => (
  <div className="text-sm">
    <p>
      {address.street}, {address.number}
      {address.complement && ` - ${address.complement}`}
    </p>
    <p>{address.neighborhood}</p>
    <p>
      {address.city}, {address.state} - {address.zipCode}
    </p>
    <p>{address.country}</p>
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

export const OrderDetail = ({
  orderId,
  onBack,
  onStatusChange,
  className = "",
}: OrderDetailProps) => {
  const {
    order,
    isLoading,
    error,
    fetchOrder,
    confirmOrder,
    shipOrder,
    deliverOrder,
    cancelOrder,
  } = useOrder();

  useEffect(() => {
    fetchOrder(orderId);
  }, [orderId, fetchOrder]);

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

  const handleStatusAction = async (
    action: "confirm" | "ship" | "deliver" | "cancel",
  ) => {
    if (!order) return;

    try {
      switch (action) {
        case "confirm":
          await confirmOrder(order.id);
          onStatusChange?.(order, "confirmed");
          break;
        case "ship":
          await shipOrder(order.id);
          onStatusChange?.(order, "shipped");
          break;
        case "deliver":
          await deliverOrder(order.id);
          onStatusChange?.(order, "delivered");
          break;
        case "cancel":
          if (
            window.confirm(
              `Are you sure you want to cancel order #${order.orderNumber}?`,
            )
          ) {
            await cancelOrder(order.id);
            onStatusChange?.(order, "cancelled");
          }
          break;
      }
    } catch (err) {
      console.error(`Failed to ${action} order:`, err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <OrderDetailSkeleton />
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
          Error loading order
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => fetchOrder(orderId)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No order found
  if (!order) {
    return (
      <div
        className={`rounded-lg border-2 border-dashed p-12 text-center ${className}`}
      >
        <h3 className="mb-2 text-lg font-semibold">Order not found</h3>
        <p className="text-sm text-muted-foreground">
          The order you're looking for doesn't exist or has been removed.
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

  // Status action buttons based on current status
  const getStatusActions = () => {
    switch (order.status) {
      case "pending":
        return (
          <>
            <button
              onClick={() => handleStatusAction("confirm")}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Confirm Order
            </button>
            <button
              onClick={() => handleStatusAction("cancel")}
              className="flex-1 rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Cancel Order
            </button>
          </>
        );
      case "confirmed":
        return (
          <>
            <button
              onClick={() => handleStatusAction("ship")}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Mark as Shipped
            </button>
            <button
              onClick={() => handleStatusAction("cancel")}
              className="flex-1 rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Cancel Order
            </button>
          </>
        );
      case "shipped":
        return (
          <button
            onClick={() => handleStatusAction("deliver")}
            className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Mark as Delivered
          </button>
        );
      default:
        return null;
    }
  };

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
            <h1 className="text-2xl font-bold">
              Order <span className="font-mono">#{order.orderNumber}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Info */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Product</h2>
          <div className="flex gap-4">
            {order.productImage ? (
              <img
                src={order.productImage}
                alt={order.productName || "Product"}
                className="h-24 w-24 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-md bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-muted-foreground"
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
            <div>
              <h3 className="font-medium">{order.productName || "Product"}</h3>
              <p className="text-sm text-muted-foreground">
                Quantity: {order.quantity}
              </p>
              <p className="text-sm text-muted-foreground">
                Unit Price: {formatPrice(order.unitPrice, order.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <div className="divide-y">
            <InfoRow
              label="Subtotal"
              value={formatPrice(
                order.unitPrice * order.quantity,
                order.currency,
              )}
            />
            <InfoRow
              label="Total"
              value={
                <span className="text-lg font-bold text-primary">
                  {formatPrice(order.totalPrice, order.currency)}
                </span>
              }
            />
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
            <AddressDisplay address={order.shippingAddress} />
          </div>
        )}

        {/* Order Notes */}
        {order.notes && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Notes</h2>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        )}

        {/* Seller Info */}
        {order.sellerName && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Seller</h2>
            <p className="font-medium">{order.sellerName}</p>
          </div>
        )}

        {/* Buyer Info */}
        {order.buyerName && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Buyer</h2>
            <p className="font-medium">{order.buyerName}</p>
          </div>
        )}
      </div>

      {/* Status Actions */}
      {onStatusChange && (
        <div className="mt-6 flex gap-4">{getStatusActions()}</div>
      )}
    </div>
  );
};
