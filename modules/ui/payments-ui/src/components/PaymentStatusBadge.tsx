/**
 * PaymentStatusBadge Component
 * Bebarter Modular Architecture
 *
 * Displays payment status and method with appropriate styling.
 */

import type { PaymentStatus, PaymentMethod } from "../types";
import { PAYMENT_STATUS_INFO, PAYMENT_METHOD_INFO } from "../types";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
  className?: string;
}

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  size?: "sm" | "md";
  className?: string;
}

const colorClasses: Record<string, string> = {
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  orange:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
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

/**
 * Payment method badge component
 */
export const PaymentMethodBadge = ({
  method,
  size = "md",
  className = "",
}: PaymentMethodBadgeProps) => {
  const info = PAYMENT_METHOD_INFO[method];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-muted font-medium text-foreground ${sizeClasses[size]} ${className}`}
      aria-label={`Payment method: ${info.label}`}
    >
      <PaymentMethodIcon method={method} className="h-3.5 w-3.5" />
      {info.label}
    </span>
  );
};

/**
 * Payment method icon component
 */
const PaymentMethodIcon = ({
  method,
  className = "",
}: {
  method: PaymentMethod;
  className?: string;
}) => {
  switch (method) {
    case "credit_card":
    case "debit_card":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      );
    case "pix":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
          />
        </svg>
      );
    case "boleto":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case "wallet":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      );
    case "bank_transfer":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
          />
        </svg>
      );
    default:
      return null;
  }
};
