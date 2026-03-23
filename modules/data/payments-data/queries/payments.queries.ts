/**
 * Payments Data Module - Query Library
 * Bebarter Modular Architecture
 *
 * Provides type-safe database operations for payments using Supabase SDK.
 * Follows SOLID principles with single-responsibility query functions.
 */

import { SupabaseClient } from "@supabase/supabase-js";

// =============================================================================
// TYPES
// =============================================================================

/** Payment status enum */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

/** Payment method enum */
export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "pix"
  | "boleto"
  | "wallet"
  | "bank_transfer";

/** Payment gateway enum */
export type PaymentGateway = "stripe" | "pagarme" | "mercadopago" | "internal";

/** Currency type */
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

/** Payment entity */
export interface Payment {
  id: string;
  order_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  currency: Currency;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  external_id: string | null;
  gateway: PaymentGateway;
  gateway_response: Record<string, unknown>;
  failure_reason: string | null;
  metadata: Record<string, unknown>;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Payment insert type */
export interface PaymentInsert {
  order_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  currency?: Currency;
  payment_method: PaymentMethod;
  status?: PaymentStatus;
  external_id?: string;
  gateway: PaymentGateway;
  gateway_response?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/** Payment update type */
export interface PaymentUpdate {
  status?: PaymentStatus;
  external_id?: string;
  gateway_response?: Record<string, unknown>;
  failure_reason?: string;
  metadata?: Record<string, unknown>;
  paid_at?: string;
  refunded_at?: string;
}

/** Payment filters */
export interface PaymentFilters {
  orderId?: string;
  payerId?: string;
  payeeId?: string;
  status?: PaymentStatus | PaymentStatus[];
  paymentMethod?: PaymentMethod | PaymentMethod[];
  gateway?: PaymentGateway | PaymentGateway[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
  sortBy?: keyof Payment;
  sortOrder?: "asc" | "desc";
}

/** Pagination params */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/** Paginated result */
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

/** Payment statistics */
export interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalAmount: number;
  averageAmount: number;
  byMethod: Record<PaymentMethod, number>;
  byGateway: Record<PaymentGateway, number>;
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get payment by ID
 */
export async function getPaymentById(
  supabase: SupabaseClient,
  id: string,
): Promise<Payment | null> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

/**
 * Get payment by external ID (gateway transaction ID)
 */
export async function getPaymentByExternalId(
  supabase: SupabaseClient,
  externalId: string,
): Promise<Payment | null> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("external_id", externalId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

/**
 * List payments with filters and pagination
 */
export async function listPayments(
  supabase: SupabaseClient,
  filters: PaymentFilters = {},
): Promise<PaginatedResult<Payment>> {
  const {
    orderId,
    payerId,
    payeeId,
    status,
    paymentMethod,
    gateway,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    limit = 20,
    offset = 0,
    sortBy = "created_at",
    sortOrder = "desc",
  } = filters;

  let query = supabase.from("payments").select("*", { count: "exact" });

  // Apply filters
  if (orderId) query = query.eq("order_id", orderId);
  if (payerId) query = query.eq("payer_id", payerId);
  if (payeeId) query = query.eq("payee_id", payeeId);

  if (status) {
    if (Array.isArray(status)) {
      query = query.in("status", status);
    } else {
      query = query.eq("status", status);
    }
  }

  if (paymentMethod) {
    if (Array.isArray(paymentMethod)) {
      query = query.in("payment_method", paymentMethod);
    } else {
      query = query.eq("payment_method", paymentMethod);
    }
  }

  if (gateway) {
    if (Array.isArray(gateway)) {
      query = query.in("gateway", gateway);
    } else {
      query = query.eq("gateway", gateway);
    }
  }

  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);
  if (minAmount) query = query.gte("amount", minAmount);
  if (maxAmount) query = query.lte("amount", maxAmount);

  // Apply sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    hasMore: (count || 0) > offset + limit,
  };
}

/**
 * Get payments by order
 */
export async function getPaymentsByOrder(
  supabase: SupabaseClient,
  orderId: string,
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

/**
 * Get payments by payer
 */
export async function getPaymentsByPayer(
  supabase: SupabaseClient,
  payerId: string,
  pagination?: PaginationParams,
): Promise<Payment[]> {
  const { limit = 50, offset = 0 } = pagination || {};

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("payer_id", payerId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data || [];
}

/**
 * Get payments by payee
 */
export async function getPaymentsByPayee(
  supabase: SupabaseClient,
  payeeId: string,
  pagination?: PaginationParams,
): Promise<Payment[]> {
  const { limit = 50, offset = 0 } = pagination || {};

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("payee_id", payeeId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data || [];
}

/**
 * Count payments with filters
 */
export async function countPayments(
  supabase: SupabaseClient,
  filters: Omit<
    PaymentFilters,
    "limit" | "offset" | "sortBy" | "sortOrder"
  > = {},
): Promise<number> {
  const {
    orderId,
    payerId,
    payeeId,
    status,
    paymentMethod,
    gateway,
    dateFrom,
    dateTo,
  } = filters;

  let query = supabase
    .from("payments")
    .select("id", { count: "exact", head: true });

  if (orderId) query = query.eq("order_id", orderId);
  if (payerId) query = query.eq("payer_id", payerId);
  if (payeeId) query = query.eq("payee_id", payeeId);
  if (status) {
    if (Array.isArray(status)) {
      query = query.in("status", status);
    } else {
      query = query.eq("status", status);
    }
  }
  if (paymentMethod) {
    if (Array.isArray(paymentMethod)) {
      query = query.in("payment_method", paymentMethod);
    } else {
      query = query.eq("payment_method", paymentMethod);
    }
  }
  if (gateway) {
    if (Array.isArray(gateway)) {
      query = query.in("gateway", gateway);
    } else {
      query = query.eq("gateway", gateway);
    }
  }
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);

  const { count, error } = await query;

  if (error) throw error;

  return count || 0;
}

/**
 * Get payment statistics for dashboard
 */
export async function getPaymentStats(
  supabase: SupabaseClient,
  userId?: string,
  role?: "payer" | "payee",
): Promise<PaymentStats> {
  let query = supabase
    .from("payments")
    .select("status, amount, payment_method, gateway");

  if (userId && role === "payer") {
    query = query.eq("payer_id", userId);
  } else if (userId && role === "payee") {
    query = query.eq("payee_id", userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const payments = data || [];
  const totalPayments = payments.length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const completedPayments = payments.filter(
    (p) => p.status === "completed",
  ).length;
  const failedPayments = payments.filter((p) => p.status === "failed").length;
  const refundedPayments = payments.filter(
    (p) => p.status === "refunded",
  ).length;

  const totalAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const averageAmount =
    completedPayments > 0 ? totalAmount / completedPayments : 0;

  const byMethod = payments.reduce(
    (acc, p) => {
      acc[p.payment_method as PaymentMethod] =
        (acc[p.payment_method as PaymentMethod] || 0) + 1;
      return acc;
    },
    {} as Record<PaymentMethod, number>,
  );

  const byGateway = payments.reduce(
    (acc, p) => {
      acc[p.gateway as PaymentGateway] =
        (acc[p.gateway as PaymentGateway] || 0) + 1;
      return acc;
    },
    {} as Record<PaymentGateway, number>,
  );

  return {
    totalPayments,
    pendingPayments,
    completedPayments,
    failedPayments,
    refundedPayments,
    totalAmount,
    averageAmount,
    byMethod,
    byGateway,
  };
}

// =============================================================================
// CREATE OPERATIONS
// =============================================================================

/**
 * Create a new payment
 */
export async function createPayment(
  supabase: SupabaseClient,
  data: PaymentInsert,
): Promise<Payment> {
  const { data: payment, error } = await supabase
    .from("payments")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return payment;
}

// =============================================================================
// UPDATE OPERATIONS
// =============================================================================

/**
 * Update payment
 */
export async function updatePayment(
  supabase: SupabaseClient,
  id: string,
  updates: PaymentUpdate,
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  supabase: SupabaseClient,
  id: string,
  status: PaymentStatus,
): Promise<Payment> {
  return updatePayment(supabase, id, { status });
}

/**
 * Mark payment as paid
 */
export async function markAsPaid(
  supabase: SupabaseClient,
  id: string,
  externalId?: string,
): Promise<Payment> {
  const updates: PaymentUpdate = {
    status: "completed",
    paid_at: new Date().toISOString(),
  };
  if (externalId) updates.external_id = externalId;
  return updatePayment(supabase, id, updates);
}

/**
 * Mark payment as failed
 */
export async function markAsFailed(
  supabase: SupabaseClient,
  id: string,
  reason?: string,
): Promise<Payment> {
  const updates: PaymentUpdate = {
    status: "failed",
  };
  if (reason) updates.failure_reason = reason;
  return updatePayment(supabase, id, updates);
}

/**
 * Mark payment as refunded
 */
export async function markAsRefunded(
  supabase: SupabaseClient,
  id: string,
): Promise<Payment> {
  return updatePayment(supabase, id, {
    status: "refunded",
    refunded_at: new Date().toISOString(),
  });
}

/**
 * Update gateway response
 */
export async function updateGatewayResponse(
  supabase: SupabaseClient,
  id: string,
  gatewayResponse: Record<string, unknown>,
): Promise<Payment> {
  return updatePayment(supabase, id, { gateway_response: gatewayResponse });
}

// =============================================================================
// UTILITY OPERATIONS
// =============================================================================

/**
 * Check if payment exists
 */
export async function paymentExists(
  supabase: SupabaseClient,
  id: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("id", id);

  if (error) throw error;

  return (count || 0) > 0;
}

/**
 * Check if user can access payment
 */
export async function canUserAccessPayment(
  supabase: SupabaseClient,
  userId: string,
  paymentId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("id", paymentId)
    .or(`payer_id.eq.${userId},payee_id.eq.${userId}`);

  if (error) throw error;

  return (count || 0) > 0;
}
