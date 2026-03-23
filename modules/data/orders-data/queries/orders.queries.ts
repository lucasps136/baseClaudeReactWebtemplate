/**
 * Orders Data Module - Query Library
 * Bebarter Modular Architecture
 *
 * Provides type-safe database operations for orders using Supabase SDK.
 * Follows SOLID principles with single-responsibility query functions.
 */

import { SupabaseClient } from "@supabase/supabase-js";

// =============================================================================
// TYPES
// =============================================================================

/** Order status enum */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/** Payment status enum */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** Currency type */
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

/** Shipping address structure */
export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/** Order entity */
export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: Currency;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_id: string | null;
  shipping_address: ShippingAddress | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Order insert type */
export interface OrderInsert {
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity?: number;
  unit_price: number;
  total_price: number;
  currency?: Currency;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  payment_id?: string;
  shipping_address?: ShippingAddress;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/** Order update type */
export interface OrderUpdate {
  quantity?: number;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  payment_id?: string;
  shipping_address?: ShippingAddress;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/** Order filters */
export interface OrderFilters {
  buyerId?: string;
  sellerId?: string;
  productId?: string;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: keyof Order;
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

/** Order statistics */
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get order by ID
 */
export async function getOrderById(
  supabase: SupabaseClient,
  id: string,
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
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
 * Get order by order number
 */
export async function getOrderByNumber(
  supabase: SupabaseClient,
  orderNumber: string,
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

/**
 * List orders with filters and pagination
 */
export async function listOrders(
  supabase: SupabaseClient,
  filters: OrderFilters = {},
): Promise<PaginatedResult<Order>> {
  const {
    buyerId,
    sellerId,
    productId,
    status,
    paymentStatus,
    dateFrom,
    dateTo,
    search,
    limit = 20,
    offset = 0,
    sortBy = "created_at",
    sortOrder = "desc",
  } = filters;

  let query = supabase.from("orders").select("*", { count: "exact" });

  // Apply filters
  if (buyerId) query = query.eq("buyer_id", buyerId);
  if (sellerId) query = query.eq("seller_id", sellerId);
  if (productId) query = query.eq("product_id", productId);

  if (status) {
    if (Array.isArray(status)) {
      query = query.in("status", status);
    } else {
      query = query.eq("status", status);
    }
  }

  if (paymentStatus) {
    if (Array.isArray(paymentStatus)) {
      query = query.in("payment_status", paymentStatus);
    } else {
      query = query.eq("payment_status", paymentStatus);
    }
  }

  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);

  if (search) {
    query = query.ilike("order_number", `%${search}%`);
  }

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
 * Get orders by buyer
 */
export async function getOrdersByBuyer(
  supabase: SupabaseClient,
  buyerId: string,
  pagination?: PaginationParams,
): Promise<Order[]> {
  const { limit = 50, offset = 0 } = pagination || {};

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data || [];
}

/**
 * Get orders by seller
 */
export async function getOrdersBySeller(
  supabase: SupabaseClient,
  sellerId: string,
  pagination?: PaginationParams,
): Promise<Order[]> {
  const { limit = 50, offset = 0 } = pagination || {};

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data || [];
}

/**
 * Get orders by product
 */
export async function getOrdersByProduct(
  supabase: SupabaseClient,
  productId: string,
  pagination?: PaginationParams,
): Promise<Order[]> {
  const { limit = 50, offset = 0 } = pagination || {};

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data || [];
}

/**
 * Count orders with filters
 */
export async function countOrders(
  supabase: SupabaseClient,
  filters: Omit<OrderFilters, "limit" | "offset" | "sortBy" | "sortOrder"> = {},
): Promise<number> {
  const {
    buyerId,
    sellerId,
    productId,
    status,
    paymentStatus,
    dateFrom,
    dateTo,
  } = filters;

  let query = supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  if (buyerId) query = query.eq("buyer_id", buyerId);
  if (sellerId) query = query.eq("seller_id", sellerId);
  if (productId) query = query.eq("product_id", productId);
  if (status) {
    if (Array.isArray(status)) {
      query = query.in("status", status);
    } else {
      query = query.eq("status", status);
    }
  }
  if (paymentStatus) {
    if (Array.isArray(paymentStatus)) {
      query = query.in("payment_status", paymentStatus);
    } else {
      query = query.eq("payment_status", paymentStatus);
    }
  }
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);

  const { count, error } = await query;

  if (error) throw error;

  return count || 0;
}

/**
 * Get order statistics for seller dashboard
 */
export async function getOrderStats(
  supabase: SupabaseClient,
  sellerId?: string,
): Promise<OrderStats> {
  let query = supabase.from("orders").select("status, total_price");

  if (sellerId) {
    query = query.eq("seller_id", sellerId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const orders = data || [];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.total_price || 0), 0);
  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / completedOrders : 0;

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    averageOrderValue: isNaN(averageOrderValue) ? 0 : averageOrderValue,
  };
}

// =============================================================================
// CREATE OPERATIONS
// =============================================================================

/**
 * Create a new order
 */
export async function createOrder(
  supabase: SupabaseClient,
  data: OrderInsert,
): Promise<Order> {
  const { data: order, error } = await supabase
    .from("orders")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return order;
}

// =============================================================================
// UPDATE OPERATIONS
// =============================================================================

/**
 * Update order
 */
export async function updateOrder(
  supabase: SupabaseClient,
  id: string,
  updates: OrderUpdate,
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  supabase: SupabaseClient,
  id: string,
  status: OrderStatus,
): Promise<Order> {
  return updateOrder(supabase, id, { status });
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  supabase: SupabaseClient,
  id: string,
  paymentStatus: PaymentStatus,
  paymentId?: string,
): Promise<Order> {
  const updates: OrderUpdate = { payment_status: paymentStatus };
  if (paymentId) updates.payment_id = paymentId;
  return updateOrder(supabase, id, updates);
}

/**
 * Cancel order (soft delete)
 */
export async function cancelOrder(
  supabase: SupabaseClient,
  id: string,
): Promise<Order> {
  return updateOrderStatus(supabase, id, "cancelled");
}

/**
 * Confirm order
 */
export async function confirmOrder(
  supabase: SupabaseClient,
  id: string,
): Promise<Order> {
  return updateOrderStatus(supabase, id, "confirmed");
}

/**
 * Mark order as shipped
 */
export async function shipOrder(
  supabase: SupabaseClient,
  id: string,
): Promise<Order> {
  return updateOrderStatus(supabase, id, "shipped");
}

/**
 * Mark order as delivered
 */
export async function deliverOrder(
  supabase: SupabaseClient,
  id: string,
): Promise<Order> {
  return updateOrderStatus(supabase, id, "delivered");
}

// =============================================================================
// UTILITY OPERATIONS
// =============================================================================

/**
 * Check if order exists
 */
export async function orderExists(
  supabase: SupabaseClient,
  id: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("id", id);

  if (error) throw error;

  return (count || 0) > 0;
}

/**
 * Check if user can access order
 */
export async function canUserAccessOrder(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("id", orderId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if (error) throw error;

  return (count || 0) > 0;
}
