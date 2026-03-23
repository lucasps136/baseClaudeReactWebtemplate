// =====================================================
// Products Data Module - Query Library
// =====================================================
// Description: TypeScript query functions for product operations using Supabase SDK
// Version: 1.0.0
// Created: 2025-12-08
// =====================================================

import { SupabaseClient } from "@supabase/supabase-js";

// =====================================================
// TYPES
// =====================================================

export type ProductStatus = "draft" | "active" | "sold" | "archived";
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: Currency;
  stock_quantity: number;
  category_id: string | null;
  seller_id: string;
  status: ProductStatus;
  images: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  name: string;
  description?: string;
  price: number;
  currency?: Currency;
  stock_quantity?: number;
  category_id?: string;
  seller_id: string;
  status?: ProductStatus;
  images?: string[];
  metadata?: Record<string, any>;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  currency?: Currency;
  stock_quantity?: number;
  category_id?: string;
  status?: ProductStatus;
  images?: string[];
  metadata?: Record<string, any>;
}

export interface ProductFilters {
  seller_id?: string;
  category_id?: string;
  status?: ProductStatus;
  min_price?: number;
  max_price?: number;
  search?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort_by?: "name" | "price" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
}

// =====================================================
// READ OPERATIONS
// =====================================================

/**
 * Get a product by ID
 */
export async function getProductById(
  supabase: SupabaseClient,
  id: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * List products with filters and pagination
 */
export async function listProducts(
  supabase: SupabaseClient,
  filters: ProductFilters = {},
  pagination: PaginationParams = {},
): Promise<Product[]> {
  const { seller_id, category_id, status, min_price, max_price, search } =
    filters;

  const {
    limit = 20,
    offset = 0,
    sort_by = "created_at",
    sort_order = "desc",
  } = pagination;

  let query = supabase.from("products").select("*");

  // Apply filters
  if (seller_id) {
    query = query.eq("seller_id", seller_id);
  }

  if (category_id) {
    query = query.eq("category_id", category_id);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (min_price !== undefined) {
    query = query.gte("price", min_price);
  }

  if (max_price !== undefined) {
    query = query.lte("price", max_price);
  }

  if (search) {
    // Use full-text search
    query = query.textSearch("name,description", search);
  }

  // Apply sorting
  query = query.order(sort_by, { ascending: sort_order === "asc" });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  supabase: SupabaseClient,
  categoryId: string,
  pagination: PaginationParams = {},
): Promise<Product[]> {
  return listProducts(
    supabase,
    { category_id: categoryId, status: "active" },
    pagination,
  );
}

/**
 * Get products by seller
 */
export async function getProductsBySeller(
  supabase: SupabaseClient,
  sellerId: string,
  pagination: PaginationParams = {},
): Promise<Product[]> {
  return listProducts(supabase, { seller_id: sellerId }, pagination);
}

/**
 * Search products with full-text search
 */
export async function searchProducts(
  supabase: SupabaseClient,
  query: string,
  filters: Omit<ProductFilters, "search"> = {},
  pagination: PaginationParams = {},
): Promise<Product[]> {
  return listProducts(supabase, { ...filters, search: query }, pagination);
}

/**
 * Count products matching filters
 */
export async function countProducts(
  supabase: SupabaseClient,
  filters: ProductFilters = {},
): Promise<number> {
  const { seller_id, category_id, status, min_price, max_price, search } =
    filters;

  let query = supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  // Apply filters
  if (seller_id) {
    query = query.eq("seller_id", seller_id);
  }

  if (category_id) {
    query = query.eq("category_id", category_id);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (min_price !== undefined) {
    query = query.gte("price", min_price);
  }

  if (max_price !== undefined) {
    query = query.lte("price", max_price);
  }

  if (search) {
    query = query.textSearch("name,description", search);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}

/**
 * Get active products (public-facing)
 */
export async function getActiveProducts(
  supabase: SupabaseClient,
  pagination: PaginationParams = {},
): Promise<Product[]> {
  return listProducts(supabase, { status: "active" }, pagination);
}

// =====================================================
// CREATE OPERATIONS
// =====================================================

/**
 * Create a new product
 */
export async function createProduct(
  supabase: SupabaseClient,
  product: ProductInsert,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// UPDATE OPERATIONS
// =====================================================

/**
 * Update a product
 */
export async function updateProduct(
  supabase: SupabaseClient,
  id: string,
  updates: ProductUpdate,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update product status
 */
export async function updateProductStatus(
  supabase: SupabaseClient,
  id: string,
  status: ProductStatus,
): Promise<Product> {
  return updateProduct(supabase, id, { status });
}

/**
 * Update product stock
 */
export async function updateProductStock(
  supabase: SupabaseClient,
  id: string,
  quantity: number,
): Promise<Product> {
  return updateProduct(supabase, id, { stock_quantity: quantity });
}

/**
 * Increment product stock
 */
export async function incrementProductStock(
  supabase: SupabaseClient,
  id: string,
  amount: number,
): Promise<Product> {
  // First get current stock
  const product = await getProductById(supabase, id);
  if (!product) throw new Error("Product not found");

  const newQuantity = product.stock_quantity + amount;
  return updateProductStock(supabase, id, Math.max(0, newQuantity));
}

/**
 * Decrement product stock
 */
export async function decrementProductStock(
  supabase: SupabaseClient,
  id: string,
  amount: number,
): Promise<Product> {
  return incrementProductStock(supabase, id, -amount);
}

// =====================================================
// DELETE OPERATIONS
// =====================================================

/**
 * Delete a product (hard delete)
 */
export async function deleteProduct(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Soft delete a product (archive)
 */
export async function archiveProduct(
  supabase: SupabaseClient,
  id: string,
): Promise<Product> {
  return updateProductStatus(supabase, id, "archived");
}

/**
 * Mark product as sold
 */
export async function markProductAsSold(
  supabase: SupabaseClient,
  id: string,
): Promise<Product> {
  return updateProductStatus(supabase, id, "sold");
}

// =====================================================
// UTILITY OPERATIONS
// =====================================================

/**
 * Check if product exists
 */
export async function productExists(
  supabase: SupabaseClient,
  id: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("id", id);

  if (error) throw error;
  return (count || 0) > 0;
}

/**
 * Get product statistics
 */
export async function getProductStats(
  supabase: SupabaseClient,
  sellerId?: string,
): Promise<{
  total: number;
  active: number;
  draft: number;
  sold: number;
  archived: number;
  total_value: number;
}> {
  let query = supabase.from("products").select("status, price");

  if (sellerId) {
    query = query.eq("seller_id", sellerId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    active: 0,
    draft: 0,
    sold: 0,
    archived: 0,
    total_value: 0,
  };

  data?.forEach((product) => {
    if (product.status === "active") stats.active++;
    if (product.status === "draft") stats.draft++;
    if (product.status === "sold") stats.sold++;
    if (product.status === "archived") stats.archived++;
    stats.total_value += Number(product.price || 0);
  });

  return stats;
}

/**
 * Get recently created products
 */
export async function getRecentProducts(
  supabase: SupabaseClient,
  limit: number = 10,
): Promise<Product[]> {
  return listProducts(
    supabase,
    { status: "active" },
    { limit, sort_by: "created_at", sort_order: "desc" },
  );
}

/**
 * Get products with low stock
 */
export async function getLowStockProducts(
  supabase: SupabaseClient,
  threshold: number = 10,
  sellerId?: string,
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .lte("stock_quantity", threshold)
    .order("stock_quantity", { ascending: true });

  if (sellerId) {
    query = query.eq("seller_id", sellerId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
