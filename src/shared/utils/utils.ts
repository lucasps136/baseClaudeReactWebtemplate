import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge and dedupe Tailwind CSS classes
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a human readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a cryptographically secure random ID
 * @param length - Length of the ID
 * @returns Secure random ID string
 */
export function generateId(length = 8): string {
  if (isServer()) {
    // Server-side: Use Node.js crypto (dynamic import for ESM compatibility)
    try {
      const crypto = eval("require")("crypto");
      return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString("hex")
        .slice(0, length);
    } catch {
      // Fallback if crypto not available
      return Math.random()
        .toString(36)
        .substring(2, length + 2);
    }
  } else {
    // Client-side: Use Web Crypto API
    const array = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length);
  }
}

/**
 * Debounce function to limit the rate of function execution
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if code is running on the client side
 * @returns True if client side
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Check if code is running on the server side
 * @returns True if server side
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Sleep for a given amount of time
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the given time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format bytes to human readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted bytes string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
