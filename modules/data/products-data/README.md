# Products Data Module

> Complete database layer for product management in Bebarter marketplace

## Overview

This module provides a complete database schema, RLS policies, indexes, and TypeScript query functions for managing products in the Bebarter marketplace. It supports the full product lifecycle from draft to sold, with comprehensive filtering, search, and inventory management capabilities.

## Features

- Complete PostgreSQL schema with 14 columns
- Row Level Security (RLS) policies for secure access control
- Full-text search on product names and descriptions
- TypeScript query functions using Supabase SDK
- Product lifecycle management (draft → active → sold/archived)
- Inventory tracking and stock management
- Support for multiple currencies (BRL, USD, EUR, GBP)
- JSONB storage for images and metadata
- Comprehensive indexing for performance

## Installation

### 1. Execute Migration

Run the migration in Supabase SQL Editor or via CLI:

```bash
# Using Supabase CLI
supabase migration new create_products_table

# Copy contents from:
modules/data/products-data/migrations/001_create_products_table.sql

# Apply migration
supabase db push
```

### 2. Or Execute Schema Directly

```sql
-- In Supabase SQL Editor
\i modules/data/products-data/schemas/products.sql
```

## Schema

### Table: `public.products`

| Column         | Type         | Description                           |
| -------------- | ------------ | ------------------------------------- |
| id             | UUID         | Primary key                           |
| name           | VARCHAR(255) | Product name (2-255 characters)       |
| description    | TEXT         | Detailed product description          |
| price          | DECIMAL      | Product price (must be > 0)           |
| currency       | VARCHAR(3)   | Currency code: BRL, USD, EUR, GBP     |
| stock_quantity | INTEGER      | Available stock (>= 0)                |
| category_id    | UUID         | Reference to category (nullable)      |
| seller_id      | UUID         | Reference to users table (NOT NULL)   |
| status         | VARCHAR(20)  | Status: draft, active, sold, archived |
| images         | JSONB        | Array of image URLs                   |
| metadata       | JSONB        | Additional product data               |
| created_at     | TIMESTAMPTZ  | Creation timestamp                    |
| updated_at     | TIMESTAMPTZ  | Last update timestamp (auto-updated)  |

### Indexes

- `idx_products_seller_id` - Seller's product listings
- `idx_products_category_id` - Category browsing
- `idx_products_status` - Status filtering
- `idx_products_status_created` - Composite for common queries
- `idx_products_price` - Price sorting/filtering
- `idx_products_created_at` - Date sorting
- `idx_products_search` - Full-text search (GIN)
- `idx_products_metadata` - JSONB queries (GIN)
- `idx_products_images` - JSONB queries (GIN)

### RLS Policies

1. **Anonymous users** can view active products
2. **Authenticated users** can view all products
3. **Authenticated users** can create products (must own)
4. **Product owners** can update their products
5. **Product owners** can delete their products

## Usage

### Import

```typescript
import {
  // Types
  Product,
  ProductInsert,
  ProductUpdate,
  ProductFilters,
  ProductStatus,

  // Query functions
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getProductsBySeller,
  updateProductStock,
  getProductStats,
} from "@/modules/data/products-data";
```

### Examples

#### Create a Product

```typescript
import { createProduct } from "@/modules/data/products-data";

const newProduct = await createProduct(supabase, {
  name: "Vintage Camera",
  description: "Professional film camera in excellent condition",
  price: 299.99,
  currency: "BRL",
  stock_quantity: 1,
  seller_id: userId,
  status: "active",
  images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  metadata: {
    brand: "Canon",
    year: 1985,
    condition: "excellent",
  },
});
```

#### List Products with Filters

```typescript
import { listProducts } from "@/modules/data/products-data";

// Get active products in a category
const products = await listProducts(
  supabase,
  {
    category_id: "uuid-here",
    status: "active",
    min_price: 50,
    max_price: 500,
  },
  {
    limit: 20,
    offset: 0,
    sort_by: "created_at",
    sort_order: "desc",
  },
);
```

#### Search Products

```typescript
import { searchProducts } from "@/modules/data/products-data";

// Full-text search
const results = await searchProducts(
  supabase,
  "vintage camera",
  { status: "active" },
  { limit: 10 },
);
```

#### Get Products by Seller

```typescript
import { getProductsBySeller } from "@/modules/data/products-data";

const sellerProducts = await getProductsBySeller(supabase, sellerId, {
  limit: 50,
  sort_by: "created_at",
  sort_order: "desc",
});
```

#### Update Product Stock

```typescript
import {
  updateProductStock,
  decrementProductStock,
} from "@/modules/data/products-data";

// Set specific quantity
await updateProductStock(supabase, productId, 10);

// Decrement after sale
await decrementProductStock(supabase, productId, 1);
```

#### Mark Product as Sold

```typescript
import { markProductAsSold } from "@/modules/data/products-data";

await markProductAsSold(supabase, productId);
```

#### Get Product Statistics

```typescript
import { getProductStats } from "@/modules/data/products-data";

// All products
const stats = await getProductStats(supabase);

// Specific seller
const sellerStats = await getProductStats(supabase, sellerId);

console.log(stats);
// {
//   total: 150,
//   active: 120,
//   draft: 10,
//   sold: 15,
//   archived: 5,
//   total_value: 45000.00
// }
```

#### Get Low Stock Products

```typescript
import { getLowStockProducts } from "@/modules/data/products-data";

// Get products with stock <= 5
const lowStock = await getLowStockProducts(supabase, 5, sellerId);
```

## Query Functions Reference

### Read Operations

- `getProductById(supabase, id)` - Get single product
- `listProducts(supabase, filters?, pagination?)` - List with filters
- `getProductsByCategory(supabase, categoryId, pagination?)` - By category
- `getProductsBySeller(supabase, sellerId, pagination?)` - By seller
- `searchProducts(supabase, query, filters?, pagination?)` - Full-text search
- `countProducts(supabase, filters?)` - Count matching products
- `getActiveProducts(supabase, pagination?)` - Public active products

### Create Operations

- `createProduct(supabase, product)` - Create new product

### Update Operations

- `updateProduct(supabase, id, updates)` - Update product
- `updateProductStatus(supabase, id, status)` - Update status only
- `updateProductStock(supabase, id, quantity)` - Set stock quantity
- `incrementProductStock(supabase, id, amount)` - Increase stock
- `decrementProductStock(supabase, id, amount)` - Decrease stock

### Delete Operations

- `deleteProduct(supabase, id)` - Hard delete
- `archiveProduct(supabase, id)` - Soft delete (status = archived)
- `markProductAsSold(supabase, id)` - Mark as sold

### Utility Operations

- `productExists(supabase, id)` - Check existence
- `getProductStats(supabase, sellerId?)` - Get statistics
- `getRecentProducts(supabase, limit?)` - Recently created
- `getLowStockProducts(supabase, threshold?, sellerId?)` - Low inventory

## Types

### Product

```typescript
interface Product {
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
```

### ProductInsert

```typescript
interface ProductInsert {
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
```

### ProductUpdate

```typescript
interface ProductUpdate {
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
```

### Enums

```typescript
type ProductStatus = "draft" | "active" | "sold" | "archived";
type Currency = "BRL" | "USD" | "EUR" | "GBP";
```

## Dependencies

- **Modules**: `user-data` (for seller_id foreign key)
- **Packages**: `@supabase/supabase-js`

## Related Modules

- `user-data` - User management (sellers)
- `orders-data` - Order management (future)
- `payments-data` - Payment processing (future)

## Status

**Experimental** - Ready for testing and feedback

## License

MIT
