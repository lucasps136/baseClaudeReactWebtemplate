/**
 * Products Data Module - Query Tests
 * Tests for Supabase query functions with mock client
 */

import {
  getProductById,
  listProducts,
  getProductsByCategory,
  getProductsBySeller,
  searchProducts,
  countProducts,
  getActiveProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
  updateProductStock,
  incrementProductStock,
  decrementProductStock,
  deleteProduct,
  archiveProduct,
  markProductAsSold,
  productExists,
  getProductStats,
  getRecentProducts,
  getLowStockProducts,
  Product,
  ProductInsert,
  ProductFilters,
} from "../../queries/products.queries";

// Mock Supabase client
const createMockSupabase = () => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };

  return {
    from: jest.fn(() => mockQuery),
    _query: mockQuery,
  };
};

describe("Products Data Queries", () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  const mockProduct: Product = {
    id: "product-123",
    name: "Test Product",
    description: "A test product description",
    price: 99.99,
    currency: "BRL",
    stock_quantity: 50,
    category_id: "category-123",
    seller_id: "seller-123",
    status: "active",
    images: ["image1.jpg", "image2.jpg"],
    metadata: {},
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    jest.clearAllMocks();
  });

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  describe("getProductById", () => {
    it("should get product by ID successfully", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: mockProduct,
        error: null,
      });

      const result = await getProductById(mockSupabase as any, "product-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase._query.select).toHaveBeenCalledWith("*");
      expect(mockSupabase._query.eq).toHaveBeenCalledWith("id", "product-123");
      expect(result).toEqual(mockProduct);
    });

    it("should throw error on database error", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      await expect(
        getProductById(mockSupabase as any, "product-123"),
      ).rejects.toThrow("Database error");
    });
  });

  describe("listProducts", () => {
    it("should list products with default parameters", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      const result = await listProducts(mockSupabase as any);

      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase._query.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual([mockProduct]);
    });

    it("should apply seller_id filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      const filters: ProductFilters = { seller_id: "seller-123" };
      await listProducts(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "seller_id",
        "seller-123",
      );
    });

    it("should apply category_id filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      const filters: ProductFilters = { category_id: "category-123" };
      await listProducts(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "category_id",
        "category-123",
      );
    });

    it("should apply status filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      const filters: ProductFilters = { status: "active" };
      await listProducts(mockSupabase as any, filters);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith("status", "active");
    });

    it("should apply price range filters", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      const filters: ProductFilters = { min_price: 50, max_price: 200 };
      await listProducts(mockSupabase as any, filters);

      expect(mockSupabase._query.gte).toHaveBeenCalledWith("price", 50);
      expect(mockSupabase._query.lte).toHaveBeenCalledWith("price", 200);
    });

    it("should apply search filter", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      const filters: ProductFilters = { search: "laptop" };
      await listProducts(mockSupabase as any, filters);

      expect(mockSupabase._query.textSearch).toHaveBeenCalledWith(
        "name,description",
        "laptop",
      );
    });

    it("should apply custom pagination", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      await listProducts(
        mockSupabase as any,
        {},
        { limit: 10, offset: 20, sort_by: "price", sort_order: "asc" },
      );

      expect(mockSupabase._query.order).toHaveBeenCalledWith("price", {
        ascending: true,
      });
      expect(mockSupabase._query.range).toHaveBeenCalledWith(20, 29);
    });
  });

  describe("getProductsByCategory", () => {
    it("should get products by category", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      await getProductsByCategory(mockSupabase as any, "category-123");

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "category_id",
        "category-123",
      );
      expect(mockSupabase._query.eq).toHaveBeenCalledWith("status", "active");
    });
  });

  describe("getProductsBySeller", () => {
    it("should get products by seller", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      await getProductsBySeller(mockSupabase as any, "seller-123");

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "seller_id",
        "seller-123",
      );
    });
  });

  describe("searchProducts", () => {
    it("should search products with query", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      await searchProducts(mockSupabase as any, "gaming laptop");

      expect(mockSupabase._query.textSearch).toHaveBeenCalledWith(
        "name,description",
        "gaming laptop",
      );
    });
  });

  describe("countProducts", () => {
    it("should count products with filters", async () => {
      mockSupabase._query.eq.mockReturnThis();
      mockSupabase._query.select.mockResolvedValue({
        count: 42,
        error: null,
      });

      const result = await countProducts(mockSupabase as any, {
        status: "active",
      });

      expect(mockSupabase._query.select).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
      });
      expect(result).toBe(42);
    });
  });

  describe("getActiveProducts", () => {
    it("should get only active products", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      await getActiveProducts(mockSupabase as any);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith("status", "active");
    });
  });

  // ============================================================================
  // CREATE OPERATIONS
  // ============================================================================

  describe("createProduct", () => {
    it("should create product successfully", async () => {
      const newProduct: ProductInsert = {
        name: "New Product",
        price: 149.99,
        seller_id: "seller-123",
      };

      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockProduct, ...newProduct },
        error: null,
      });

      const result = await createProduct(mockSupabase as any, newProduct);

      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase._query.insert).toHaveBeenCalledWith(newProduct);
      expect(result.name).toBe("New Product");
    });
  });

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const updates = { price: 199.99, description: "Updated description" };

      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockProduct, ...updates },
        error: null,
      });

      const result = await updateProduct(
        mockSupabase as any,
        "product-123",
        updates,
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith(updates);
      expect(mockSupabase._query.eq).toHaveBeenCalledWith("id", "product-123");
      expect(result.price).toBe(199.99);
    });
  });

  describe("updateProductStatus", () => {
    it("should update product status", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockProduct, status: "sold" },
        error: null,
      });

      const result = await updateProductStatus(
        mockSupabase as any,
        "product-123",
        "sold",
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        status: "sold",
      });
      expect(result.status).toBe("sold");
    });
  });

  describe("updateProductStock", () => {
    it("should update product stock", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockProduct, stock_quantity: 100 },
        error: null,
      });

      const result = await updateProductStock(
        mockSupabase as any,
        "product-123",
        100,
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        stock_quantity: 100,
      });
      expect(result.stock_quantity).toBe(100);
    });
  });

  describe("incrementProductStock", () => {
    it("should increment stock by amount", async () => {
      // First call returns current product
      mockSupabase._query.single
        .mockResolvedValueOnce({
          data: mockProduct, // stock_quantity: 50
          error: null,
        })
        // Second call returns updated product
        .mockResolvedValueOnce({
          data: { ...mockProduct, stock_quantity: 60 },
          error: null,
        });

      const result = await incrementProductStock(
        mockSupabase as any,
        "product-123",
        10,
      );

      expect(result.stock_quantity).toBe(60);
    });

    it("should throw error if product not found", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        incrementProductStock(mockSupabase as any, "nonexistent", 10),
      ).rejects.toThrow("Product not found");
    });
  });

  describe("decrementProductStock", () => {
    it("should decrement stock by amount", async () => {
      mockSupabase._query.single
        .mockResolvedValueOnce({
          data: mockProduct, // stock_quantity: 50
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockProduct, stock_quantity: 45 },
          error: null,
        });

      const result = await decrementProductStock(
        mockSupabase as any,
        "product-123",
        5,
      );

      expect(result.stock_quantity).toBe(45);
    });
  });

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        error: null,
      });

      await deleteProduct(mockSupabase as any, "product-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase._query.delete).toHaveBeenCalled();
      expect(mockSupabase._query.eq).toHaveBeenCalledWith("id", "product-123");
    });
  });

  describe("archiveProduct", () => {
    it("should archive product (soft delete)", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockProduct, status: "archived" },
        error: null,
      });

      const result = await archiveProduct(mockSupabase as any, "product-123");

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        status: "archived",
      });
      expect(result.status).toBe("archived");
    });
  });

  describe("markProductAsSold", () => {
    it("should mark product as sold", async () => {
      mockSupabase._query.single.mockResolvedValue({
        data: { ...mockProduct, status: "sold" },
        error: null,
      });

      const result = await markProductAsSold(
        mockSupabase as any,
        "product-123",
      );

      expect(mockSupabase._query.update).toHaveBeenCalledWith({
        status: "sold",
      });
      expect(result.status).toBe("sold");
    });
  });

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  describe("productExists", () => {
    it("should return true if product exists", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        count: 1,
        error: null,
      });

      const result = await productExists(mockSupabase as any, "product-123");

      expect(result).toBe(true);
    });

    it("should return false if product does not exist", async () => {
      mockSupabase._query.eq.mockResolvedValue({
        count: 0,
        error: null,
      });

      const result = await productExists(mockSupabase as any, "nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("getProductStats", () => {
    it("should return product statistics", async () => {
      const products = [
        { status: "active", price: 100 },
        { status: "active", price: 200 },
        { status: "draft", price: 50 },
        { status: "sold", price: 150 },
        { status: "archived", price: 75 },
      ];

      mockSupabase._query.eq.mockResolvedValue({
        data: products,
        error: null,
      });

      const result = await getProductStats(mockSupabase as any, "seller-123");

      expect(result.total).toBe(5);
      expect(result.active).toBe(2);
      expect(result.draft).toBe(1);
      expect(result.sold).toBe(1);
      expect(result.archived).toBe(1);
      expect(result.total_value).toBe(575);
    });
  });

  describe("getRecentProducts", () => {
    it("should get recent active products", async () => {
      mockSupabase._query.range.mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      await getRecentProducts(mockSupabase as any, 5);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith("status", "active");
      expect(mockSupabase._query.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });
  });

  describe("getLowStockProducts", () => {
    it("should get products with low stock", async () => {
      const lowStockProduct = { ...mockProduct, stock_quantity: 5 };
      mockSupabase._query.order.mockResolvedValue({
        data: [lowStockProduct],
        error: null,
      });

      const result = await getLowStockProducts(mockSupabase as any, 10);

      expect(mockSupabase._query.eq).toHaveBeenCalledWith("status", "active");
      expect(mockSupabase._query.lte).toHaveBeenCalledWith(
        "stock_quantity",
        10,
      );
      expect(result[0].stock_quantity).toBe(5);
    });

    it("should filter by seller if provided", async () => {
      mockSupabase._query.order.mockResolvedValue({
        data: [],
        error: null,
      });

      await getLowStockProducts(mockSupabase as any, 10, "seller-123");

      expect(mockSupabase._query.eq).toHaveBeenCalledWith(
        "seller_id",
        "seller-123",
      );
    });
  });
});
