/**
 * OrderStatusBadge Component
 * Bebarter Modular Architecture
 *
 * Displays order status with appropriate styling.
 */

import type { OrderStatus, PaymentStatus } from "../types";
import { ORDER_STATUS_INFO, PAYMENT_STATUS_INFO } from "../types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
  className?: string;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
  className?: string;
}

const colorClasses: Record<string, string> = {
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  purple:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  indigo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  orange:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

/**
 * Order status badge component
 */
export const OrderStatusBadge = ({
  status,
  size = "md",
  className = "",
}: OrderStatusBadgeProps) => {
  const info = ORDER_STATUS_INFO[status];
  const colorClass = colorClasses[info.color] || colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClasses[size]} ${className}`}
      aria-label={`Order status: ${info.label}`}
    >
      {info.label}
    </span>
  );
};

/**
 * Payment status badge component
 */
export const PaymentStatusBadge = ({
  status,
  size = "md",
  className = "",
}: PaymentStatusBadgeProps) => {
  const info = PAYMENT_STATUS_INFO[status];
  const colorClass = colorClasses[info.color] || colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClasses[size]} ${className}`}
      aria-label={`Payment status: ${info.label}`}
    >
      {info.label}
    </span>
  );
};
