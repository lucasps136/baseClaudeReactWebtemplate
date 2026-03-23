// =====================================================
// Products Data Module - Main Export
// =====================================================
// Description: Main entry point for products-data module
// Version: 1.0.0
// Created: 2025-12-08
// =====================================================

// Export all types
export type {
  Product,
  ProductInsert,
  ProductUpdate,
  ProductFilters,
  PaginationParams,
  ProductStatus,
  Currency,
} from "./queries/products.queries";

// Export all query functions
export {
  // Read operations
  getProductById,
  listProducts,
  getProductsByCategory,
  getProductsBySeller,
  searchProducts,
  countProducts,
  getActiveProducts,

  // Create operations
  createProduct,

  // Update operations
  updateProduct,
  updateProductStatus,
  updateProductStock,
  incrementProductStock,
  decrementProductStock,

  // Delete operations
  deleteProduct,
  archiveProduct,
  markProductAsSold,

  // Utility operations
  productExists,
  getProductStats,
  getRecentProducts,
  getLowStockProducts,
} from "./queries/products.queries";
