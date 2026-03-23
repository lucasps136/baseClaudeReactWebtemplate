# Products Data Module - Complete Documentation

> Database layer for marketplace product management with PostgreSQL schemas, RLS policies, and TypeScript queries

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Schema Reference](#schema-reference)
- [Queries Reference](#queries-reference)
- [RLS Policies](#rls-policies)
- [Performance](#performance)
- [Search](#search)
- [Examples](#examples)

## Overview

This module provides a complete, production-ready database layer for product management with:

✅ **PostgreSQL schema** with comprehensive product attributes
✅ **Row Level Security (RLS)** for seller/buyer access control
✅ **Performance indexes** including full-text search
✅ **Product lifecycle** (draft → active → sold → archived)
✅ **Multi-currency support** (BRL, USD, EUR, GBP)
✅ **Category and inventory management**
✅ **TypeScript query library** with full type safety

## Installation

### Step 1: Run Schema

Execute in Supabase SQL Editor:

```bash
# Copy and paste contents of:
modules/data/products-data/schemas/products.sql
```

### Step 2: Run Migration

```bash
# Or run migration file:
modules/data/products-data/migrations/001_create_products_table.sql
```

### Step 3: Verify Installation

```sql
-- Verify table exists
\d public.products

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'products';

-- Check indexes
\di public.idx_products_*
```

## Schema Reference

### Table: public.products

Complete table definition for marketplace products.

#### Columns

| Column      | Type          | Constraints                   | Description         |
| ----------- | ------------- | ----------------------------- | ------------------- |
| id          | UUID          | PK, DEFAULT gen_random_uuid() | Unique identifier   |
| name        | VARCHAR(255)  | NOT NULL                      | Product name        |
| description | TEXT          | NULLABLE                      | Product description |
| price       | DECIMAL(12,2) | NOT NULL, CHECK >= 0          | Product price       |
| currency    | VARCHAR(3)    | NOT NULL, DEFAULT 'BRL'       | Currency code       |
| seller_id   | UUID          | FK → users(id), NOT NULL      | Seller reference    |
| category    | VARCHAR(100)  | NULLABLE                      | Product category    |
| status      | VARCHAR(20)   | NOT NULL, DEFAULT 'draft'     | Product status      |
| stock       | INTEGER       | DEFAULT 0, CHECK >= 0         | Available quantity  |
| image       | TEXT          | NULLABLE                      | Main image URL      |
| images      | TEXT[]        | DEFAULT '{}'                  | Additional images   |
| tags        | TEXT[]        | DEFAULT '{}'                  | Product tags        |
| metadata    | JSONB         | DEFAULT '{}'                  | Additional data     |
| active      | BOOLEAN       | DEFAULT true                  | Visibility flag     |
| created_at  | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()       | Creation timestamp  |
| updated_at  | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()       | Last update         |

#### Product Status Values

| Status   | Description          | Visibility |
| -------- | -------------------- | ---------- |
| draft    | Being created        | Hidden     |
| active   | Available for sale   | Visible    |
| sold     | Sold out             | Hidden     |
| archived | Removed from listing | Hidden     |

#### Currency Values

| Code | Name           | Symbol |
| ---- | -------------- | ------ |
| BRL  | Brazilian Real | R$     |
| USD  | US Dollar      | $      |
| EUR  | Euro           | €      |
| GBP  | British Pound  | £      |

### Constraints

```sql
-- Name validation
CONSTRAINT products_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 255)

-- Price validation
CONSTRAINT products_price_check CHECK (price >= 0)

-- Stock validation
CONSTRAINT products_stock_check CHECK (stock >= 0)

-- Status validation
CONSTRAINT products_status_check CHECK (
  status IN ('draft', 'active', 'sold', 'archived')
)

-- Currency validation
CONSTRAINT products_currency_check CHECK (
  currency IN ('BRL', 'USD', 'EUR', 'GBP')
)
```

### Indexes

| Index Name                   | Columns           | Type           | Purpose                   |
| ---------------------------- | ----------------- | -------------- | ------------------------- |
| idx_products_seller_id       | seller_id         | B-tree         | Seller's products         |
| idx_products_category        | category          | B-tree         | Category filtering        |
| idx_products_status          | status            | B-tree         | Status filtering          |
| idx_products_active          | active            | B-tree         | Active products           |
| idx_products_price           | price             | B-tree         | Price sorting/filtering   |
| idx_products_created_at      | created_at DESC   | B-tree         | Date sorting              |
| idx_products_name            | name              | B-tree         | Name search               |
| idx_products_tags            | tags              | GIN            | Tag filtering             |
| idx_products_search          | name, description | GIN (tsvector) | Full-text search          |
| idx_products_seller_status   | seller_id, status | Composite      | Seller products by status |
| idx_products_active_category | active, category  | Composite      | Active by category        |

## Queries Reference

### TypeScript Query Library

Import from `./queries/products.queries.ts`:

```typescript
import {
  // Types
  Product,
  ProductInsert,
  ProductUpdate,
  ProductFilters,
  ProductStatus,
  Currency,

  // Query functions
  getProductById,
  listProducts,
  getProductsByCategory,
  getProductsBySeller,
  searchProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getProductStats,
} from "@/modules/data/products-data";
```

### Read Operations

#### Get Product by ID

```typescript
const product = await getProductById(supabase, productId);
```

```sql
SELECT * FROM public.products WHERE id = $1;
```

#### List Products with Filters

```typescript
const { data, count } = await listProducts(supabase, {
  status: "active",
  category: "electronics",
  minPrice: 100,
  maxPrice: 1000,
  sellerId: sellerId,
  active: true,
  sortBy: "price",
  sortOrder: "asc",
  limit: 20,
  offset: 0,
});
```

#### Get Products by Category

```typescript
const products = await getProductsByCategory(supabase, "electronics", {
  active: true,
  limit: 20,
});
```

#### Get Seller's Products

```typescript
const products = await getProductsBySeller(supabase, sellerId, {
  status: ["draft", "active"],
});
```

#### Search Products (Full-Text)

```typescript
const results = await searchProducts(supabase, "laptop gaming", {
  category: "electronics",
  minPrice: 500,
  limit: 20,
});
```

### Write Operations

#### Create Product

```typescript
const product = await createProduct(supabase, {
  name: "Gaming Laptop",
  description: "High performance laptop for gaming",
  price: 4999.99,
  currency: "BRL",
  sellerId: sellerId,
  category: "electronics",
  status: "draft",
  stock: 10,
  image: "https://example.com/image.jpg",
  tags: ["gaming", "laptop", "electronics"],
});
```

#### Update Product

```typescript
await updateProduct(supabase, productId, {
  price: 4499.99,
  description: "Updated description",
  status: "active",
});
```

#### Update Stock

```typescript
// Decrease stock (after sale)
await updateProductStock(supabase, productId, -1);

// Increase stock (restock)
await updateProductStock(supabase, productId, 10);
```

#### Delete Product

```typescript
await deleteProduct(supabase, productId);
// Soft delete: sets status to 'archived'
```

### Statistics

#### Get Product Stats

```typescript
const stats = await getProductStats(supabase, sellerId);
// Returns: { total, active, draft, sold, archived, totalValue }
```

## RLS Policies

### Public Access (Read)

```sql
CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active' AND active = true);
```

### Seller Access

```sql
CREATE POLICY "Sellers can view own products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can create products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());
```

### Combined Policy (Simplified)

```sql
-- Read: active products for all, all products for owner
CREATE POLICY "product_read_policy"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    (status = 'active' AND active = true)
    OR seller_id = auth.uid()
  );

-- Write: only owner
CREATE POLICY "product_write_policy"
  ON public.products
  FOR ALL
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());
```

## Performance

### Query Optimization Tips

1. **Always filter by indexed columns**:

```sql
-- Good: Uses idx_products_active_category
WHERE active = true AND category = 'electronics'

-- Bad: Function on indexed column
WHERE LOWER(category) = 'electronics'
```

2. **Use price range with index**:

```sql
-- Good: Uses idx_products_price
WHERE price BETWEEN 100 AND 1000

-- Also good
WHERE price >= 100 AND price <= 1000
```

3. **Full-text search with category**:

```sql
-- Good: Uses idx_products_search, then filters
WHERE to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
  @@ plainto_tsquery('portuguese', 'laptop gaming')
  AND category = 'electronics'
```

4. **Tag filtering**:

```sql
-- Good: Uses idx_products_tags (GIN)
WHERE tags @> ARRAY['gaming']

-- Also good: Any tag match
WHERE tags && ARRAY['gaming', 'laptop']
```

### Monitoring

```sql
-- Products per category
SELECT category, COUNT(*) as count, AVG(price) as avg_price
FROM public.products
WHERE status = 'active'
GROUP BY category
ORDER BY count DESC;

-- Index usage
SELECT indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'products'
ORDER BY idx_scan DESC;

-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%products%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Search

### Full-Text Search Configuration

```sql
-- Create search index
CREATE INDEX idx_products_search ON public.products
USING GIN (to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));

-- Search query
SELECT *
FROM public.products
WHERE to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
  @@ plainto_tsquery('portuguese', $1)
  AND status = 'active'
ORDER BY ts_rank(
  to_tsvector('portuguese', name || ' ' || COALESCE(description, '')),
  plainto_tsquery('portuguese', $1)
) DESC;
```

### TypeScript Search Implementation

```typescript
async function searchProducts(
  supabase: SupabaseClient,
  query: string,
  filters?: ProductFilters,
) {
  let dbQuery = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .eq("active", true)
    .textSearch("name", query, { type: "websearch", config: "portuguese" });

  if (filters?.category) {
    dbQuery = dbQuery.eq("category", filters.category);
  }
  if (filters?.minPrice) {
    dbQuery = dbQuery.gte("price", filters.minPrice);
  }
  if (filters?.maxPrice) {
    dbQuery = dbQuery.lte("price", filters.maxPrice);
  }

  return dbQuery.limit(filters?.limit || 20);
}
```

### Tag-Based Search

```typescript
// Find products with specific tags
const taggedProducts = await supabase
  .from("products")
  .select("*")
  .contains("tags", ["gaming", "laptop"])
  .eq("status", "active");

// Find products with any of these tags
const anyTagProducts = await supabase
  .from("products")
  .select("*")
  .overlaps("tags", ["gaming", "laptop", "electronics"])
  .eq("status", "active");
```

## Examples

### Example 1: Complete Product Lifecycle

```typescript
// 1. Create draft product
const product = await createProduct(supabase, {
  name: "New Product",
  description: "Product description",
  price: 199.99,
  sellerId: userId,
  category: "electronics",
  status: "draft",
  stock: 50,
});

// 2. Add images
await updateProduct(supabase, product.id, {
  image: "https://cdn.example.com/main.jpg",
  images: ["https://cdn.example.com/1.jpg", "https://cdn.example.com/2.jpg"],
});

// 3. Publish product
await updateProduct(supabase, product.id, {
  status: "active",
  active: true,
});

// 4. Update stock after sale
await updateProductStock(supabase, product.id, -1);

// 5. Mark as sold when out of stock
const updated = await getProductById(supabase, product.id);
if (updated.stock === 0) {
  await updateProduct(supabase, product.id, { status: "sold" });
}

// 6. Archive product
await updateProduct(supabase, product.id, { status: "archived" });
// OR
await deleteProduct(supabase, product.id);
```

### Example 2: Product Catalog Page

```typescript
async function getCatalogPage(params: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "created_at" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .eq("active", true);

  if (category) query = query.eq("category", category);
  if (search) query = query.textSearch("name", search);
  if (minPrice) query = query.gte("price", minPrice);
  if (maxPrice) query = query.lte("price", maxPrice);

  const { data, count, error } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    products: data,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}
```

### Example 3: Seller Dashboard

```typescript
async function getSellerDashboard(sellerId: string) {
  const [products, stats, recentOrders] = await Promise.all([
    getProductsBySeller(supabase, sellerId, { limit: 10 }),
    getProductStats(supabase, sellerId),
    getOrdersBySeller(supabase, sellerId, { limit: 5 }),
  ]);

  return {
    products: {
      list: products,
      total: stats.total,
      active: stats.active,
      draft: stats.draft,
      sold: stats.sold,
    },
    inventory: {
      totalValue: stats.totalValue,
      lowStock: products.filter((p) => p.stock < 5),
    },
    orders: recentOrders,
  };
}
```

### Example 4: Category Management

```typescript
// Get all categories with counts
async function getCategories() {
  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("status", "active")
    .eq("active", true);

  const counts = data?.reduce(
    (acc, { category }) => {
      if (category) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(counts || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
```

## Troubleshooting

### Common Issues

#### 1. Product not appearing in search

```sql
-- Check if product is active
SELECT id, name, status, active
FROM public.products
WHERE id = $1;

-- Verify search index
SELECT to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
FROM public.products
WHERE id = $1;
```

#### 2. Stock going negative

```typescript
// Always check stock before decrementing
const product = await getProductById(supabase, productId);
if (product.stock < quantity) {
  throw new Error("Insufficient stock");
}
await updateProductStock(supabase, productId, -quantity);
```

#### 3. Price formatting issues

```typescript
// Always store as decimal, format on display
const formattedPrice = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: product.currency,
}).format(product.price);
```

---

**Module Version**: 1.0.0
**Last Updated**: 2025-12-09
**PostgreSQL Version**: 14+
**Supabase Compatible**: Yes
**Status**: Experimental
