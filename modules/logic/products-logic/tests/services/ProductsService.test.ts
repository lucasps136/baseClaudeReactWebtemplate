import { ProductsService } from "../../src/services/products.service";
import type { IProductsRepository } from "../../src/repositories/products.repository.interface";
import type { IProductsValidation } from "../../src/validations/products.validation";
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters,
  ProductStatus,
  PaginatedResult,
} from "../../src/types";

describe("ProductsService", () => {
  let productsService: ProductsService;
  let mockRepository: jest.Mocked<IProductsRepository>;
  let mockValidation: jest.Mocked<IProductsValidation>;

  // Mock data
  const mockProduct: Product = {
    id: "product-123",
    name: "Test Product",
    description: "Test product description",
    price: 99.9,
    currency: "BRL",
    sellerId: "seller-456",
    categoryId: "electronics",
    status: "active",
    stockQuantity: 10,

    images: [],
    metadata: {},
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };

  const mockProductList: PaginatedResult<Product> = {
    data: [mockProduct],
    total: 1,
    hasMore: false,
    limit: 20,
    offset: 0,
  };

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findMany: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    // Create mock validation
    mockValidation = {
      validateCreateInput: jest.fn(),
      validateUpdateInput: jest.fn(),
      validateFilters: jest.fn(),
    } as any;

    // Create service instance with mocks
    productsService = new ProductsService(mockRepository, mockValidation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Constructor Tests
  // ============================================================================

  describe("Constructor", () => {
    it("should initialize with repository and validation dependencies", () => {
      expect(productsService).toBeInstanceOf(ProductsService);
      expect(mockRepository).toBeDefined();
      expect(mockValidation).toBeDefined();
    });
  });

  // ============================================================================
  // getProduct Tests
  // ============================================================================

  describe("getProduct", () => {
    it("should get product by id successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await productsService.getProduct("product-123");

      expect(mockRepository.findById).toHaveBeenCalledWith("product-123");
      expect(result).toEqual(mockProduct);
    });

    it("should return null when product not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await productsService.getProduct("nonexistent");

      expect(result).toBeNull();
    });

    it("should throw error when id is empty", async () => {
      await expect(productsService.getProduct("")).rejects.toThrow(
        "Product ID is required",
      );
    });
  });

  // ============================================================================
  // listProducts Tests
  // ============================================================================

  describe("listProducts", () => {
    it("should list products with default filters", async () => {
      mockValidation.validateFilters.mockResolvedValue(undefined);
      mockRepository.findMany.mockResolvedValue(mockProductList);

      const result = await productsService.listProducts();

      expect(mockValidation.validateFilters).toHaveBeenCalled();
      expect(mockRepository.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockProductList);
    });

    it("should list products with custom filters", async () => {
      const filters: ProductFilters = {
        status: "active",
        categoryId: "electronics",
        minPrice: 50,
        maxPrice: 200,
        limit: 10,
      };

      mockValidation.validateFilters.mockResolvedValue(undefined);
      mockRepository.findMany.mockResolvedValue(mockProductList);

      const result = await productsService.listProducts(filters);

      expect(mockValidation.validateFilters).toHaveBeenCalledWith(filters);
      expect(mockRepository.findMany).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockProductList);
    });

    it("should handle empty result set", async () => {
      const emptyResult: PaginatedResult<Product> = {
        data: [],
        total: 0,
        hasMore: false,
        limit: 20,
        offset: 0,
      };
      mockValidation.validateFilters.mockResolvedValue(undefined);
      mockRepository.findMany.mockResolvedValue(emptyResult);

      const result = await productsService.listProducts();

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should filter by price range", async () => {
      const filters: ProductFilters = { minPrice: 100, maxPrice: 500 };
      mockValidation.validateFilters.mockResolvedValue(undefined);
      mockRepository.findMany.mockResolvedValue(mockProductList);

      await productsService.listProducts(filters);

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ minPrice: 100, maxPrice: 500 }),
      );
    });
  });

  // ============================================================================
  // getProductsByCategory Tests
  // ============================================================================

  describe("getProductsByCategory", () => {
    it("should get products by category", async () => {
      mockRepository.findMany.mockResolvedValue(mockProductList);

      const result = await productsService.getProductsByCategory("electronics");

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: "electronics" }),
      );
      expect(result).toEqual(mockProductList);
    });

    it("should throw error when category is empty", async () => {
      await expect(productsService.getProductsByCategory("")).rejects.toThrow(
        "Category ID is required",
      );
    });

    it("should pass filters to repository", async () => {
      const filters: ProductFilters = { status: "active", limit: 5 };
      mockRepository.findMany.mockResolvedValue(mockProductList);

      await productsService.getProductsByCategory("electronics", filters);

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: "electronics", ...filters }),
      );
    });
  });

  // ============================================================================
  // getProductsBySeller Tests
  // ============================================================================

  describe("getProductsBySeller", () => {
    it("should get products by seller", async () => {
      mockRepository.findMany.mockResolvedValue(mockProductList);

      const result = await productsService.getProductsBySeller("seller-456");

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ sellerId: "seller-456" }),
      );
      expect(result).toEqual(mockProductList);
    });

    it("should throw error when sellerId is empty", async () => {
      await expect(productsService.getProductsBySeller("")).rejects.toThrow(
        "Seller ID is required",
      );
    });

    it("should filter by status", async () => {
      const filters: ProductFilters = { status: "draft" };
      mockRepository.findMany.mockResolvedValue(mockProductList);

      await productsService.getProductsBySeller("seller-456", filters);

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ sellerId: "seller-456", ...filters }),
      );
    });
  });

  // ============================================================================
  // searchProducts Tests
  // ============================================================================

  describe("searchProducts", () => {
    it("should search products by text", async () => {
      mockRepository.search.mockResolvedValue([mockProduct]);

      const result = await productsService.searchProducts("laptop");

      expect(mockRepository.search).toHaveBeenCalledWith("laptop", undefined);
      expect(result).toEqual(mockProductList);
    });

    it("should throw error when query is empty", async () => {
      await expect(productsService.searchProducts("")).rejects.toThrow(
        "Search query is required",
      );
    });

    it("should search successfully", async () => {
      mockRepository.search.mockResolvedValue([mockProduct]);

      await productsService.searchProducts("laptop");

      expect(mockRepository.search).toHaveBeenCalledWith("laptop");
    });

    it("should handle no results", async () => {
      mockRepository.search.mockResolvedValue([]);

      const result = await productsService.searchProducts("nonexistent");

      expect(result).toHaveLength(0);
    });
  });

  // ============================================================================
  // createProduct Tests
  // ============================================================================

  describe("createProduct", () => {
    const validInput: CreateProductDTO = {
      name: "New Product",
      description: "Product description",
      price: 149.9,
      currency: "BRL",
      sellerId: "seller-456",
      categoryId: "electronics",
      stockQuantity: 20,
    };

    it("should create product successfully", async () => {
      mockValidation.validateCreateInput.mockResolvedValue(undefined);
      mockRepository.create.mockResolvedValue(mockProduct);

      const result = await productsService.createProduct(validInput);

      expect(mockValidation.validateCreateInput).toHaveBeenCalledWith(
        validInput,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(validInput);
      expect(result).toEqual(mockProduct);
    });

    it("should validate input before creating", async () => {
      const callOrder: string[] = [];

      mockValidation.validateCreateInput.mockImplementation(async (data) => {
        callOrder.push("validate");
      });
      mockRepository.create.mockImplementation(async () => {
        callOrder.push("create");
        return mockProduct;
      });

      await productsService.createProduct(validInput);

      expect(callOrder).toEqual(["validate", "create"]);
    });

    it("should throw error when validation fails", async () => {
      mockValidation.validateCreateInput.mockImplementation(() => {
        throw new Error("Validation failed: name is required");
      });

      await expect(productsService.createProduct(validInput)).rejects.toThrow(
        "Validation failed",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should create product with default status as draft", async () => {
      const inputWithoutStatus: CreateProductDTO = {
        ...validInput,
        status: undefined,
      };
      mockValidation.validateCreateInput.mockResolvedValue(undefined);
      mockRepository.create.mockResolvedValue({
        ...mockProduct,
        status: "draft",
      });

      const result = await productsService.createProduct(inputWithoutStatus);

      expect(result.status).toBe("draft");
    });
  });

  // ============================================================================
  // updateProduct Tests
  // ============================================================================

  describe("updateProduct", () => {
    const validUpdate: UpdateProductDTO = {
      name: "Updated Product",
      price: 199.9,
      description: "Updated description",
    };

    it("should update product successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      const updatedProduct = { ...mockProduct, ...validUpdate };
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await productsService.updateProduct(
        "product-123",
        validUpdate,
      );

      expect(mockRepository.findById).toHaveBeenCalledWith("product-123");
      expect(mockValidation.validateUpdateInput).toHaveBeenCalledWith(
        validUpdate,
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        "product-123",
        validUpdate,
      );
      expect(result).toEqual(updatedProduct);
    });

    it("should throw error when product not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        productsService.updateProduct("nonexistent", validUpdate),
      ).rejects.toThrow("Product not found");
    });

    it("should update only provided fields", async () => {
      const partialUpdate: UpdateProductDTO = { price: 79.9 };
      mockRepository.findById.mockResolvedValue(mockProduct);
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      mockRepository.update.mockResolvedValue({ ...mockProduct, price: 79.9 });

      const result = await productsService.updateProduct(
        "product-123",
        partialUpdate,
      );

      expect(result.price).toBe(79.9);
      expect(result.name).toBe(mockProduct.name); // Unchanged
    });

    it("should update status", async () => {
      const statusUpdate: UpdateProductDTO = { status: "sold" };
      mockRepository.findById.mockResolvedValue(mockProduct);
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      mockRepository.update.mockResolvedValue({
        ...mockProduct,
        status: "sold" as ProductStatus,
      });

      const result = await productsService.updateProduct(
        "product-123",
        statusUpdate,
      );

      expect(result.status).toBe("sold");
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe("Integration Scenarios", () => {
    it("should handle complete product lifecycle", async () => {
      const createInput: CreateProductDTO = {
        name: "Lifecycle Product",
        description: "Test product",
        price: 100.0,
        currency: "BRL",
        sellerId: "seller-456",
        categoryId: "test",
        stockQuantity: 5,
      };

      // Create (draft)
      const draftProduct = { ...mockProduct, status: "draft" as ProductStatus };
      mockValidation.validateCreateInput.mockResolvedValue(undefined);
      mockRepository.create.mockResolvedValue(draftProduct);
      const created = await productsService.createProduct(createInput);
      expect(created.status).toBe("draft");

      // Publish (active)
      mockRepository.findById.mockResolvedValue(draftProduct);
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      const activeProduct = {
        ...draftProduct,
        status: "active" as ProductStatus,
      };
      mockRepository.update.mockResolvedValue(activeProduct);
      const published = await productsService.updateProduct(created.id, {
        status: "active",
      });
      expect(published.status).toBe("active");

      // Out of stock (sold)
      mockRepository.findById.mockResolvedValue({
        ...activeProduct,
        stockQuantity: 0,
      } as any);
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      const soldProduct = {
        ...activeProduct,
        status: "sold" as ProductStatus,
        stockQuantity: 0,
      };
      mockRepository.update.mockResolvedValue(soldProduct);
      const outOfStock = await productsService.updateProduct(created.id, {
        status: "sold",
      });
      expect(outOfStock.status).toBe("sold");
    });

    it("should handle product search flow", async () => {
      // Search for products
      mockRepository.search.mockResolvedValue([mockProduct]);
      const searchResults = await productsService.searchProducts("test");
      expect(searchResults).toHaveLength(1);

      // View product details
      mockRepository.findById.mockResolvedValue(mockProduct);
      const product = await productsService.getProduct(searchResults[0].id);
      expect(product?.name).toBe("Test Product");

      // Get related products by category
      mockRepository.findMany.mockResolvedValue(mockProductList);
      const related = await productsService.getProductsByCategory(
        product?.categoryId || "",
      );
      expect(related.data).toHaveLength(1);
    });
  });
});
