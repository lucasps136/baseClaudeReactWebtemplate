# Orders Data Module - Complete Documentation

> Database layer for marketplace order management with PostgreSQL schemas, RLS policies, and TypeScript queries

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Schema Reference](#schema-reference)
- [Queries Reference](#queries-reference)
- [RLS Policies](#rls-policies)
- [Performance](#performance)
- [Security](#security)
- [Examples](#examples)

## Overview

This module provides a complete, production-ready database layer for order management with:

✅ **PostgreSQL schema** with 15+ columns for complete order tracking
✅ **Row Level Security (RLS)** policies for buyer/seller access control
✅ **Performance indexes** (13 indexes for common query patterns)
✅ **Auto-updating timestamps** with triggers
✅ **Status management** for order and payment lifecycle
✅ **TypeScript query library** with full type safety
✅ **Supabase-optimized** configuration

## Installation

### Step 1: Run Schema

Execute in Supabase SQL Editor:

```bash
# Copy and paste contents of:
modules/data/orders-data/schemas/orders.sql
```

### Step 2: Verify Installation

```sql
-- Verify table exists
\d public.orders

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'orders';

-- Check indexes
\di public.idx_orders_*
```

## Schema Reference

### Table: public.orders

Complete table definition for marketplace order management.

#### Columns

| Column           | Type          | Constraints                    | Description                 |
| ---------------- | ------------- | ------------------------------ | --------------------------- |
| id               | UUID          | PK, DEFAULT gen_random_uuid()  | Unique identifier           |
| order_number     | VARCHAR(50)   | UNIQUE, NOT NULL               | Human-readable order number |
| buyer_id         | UUID          | FK → users(id), NOT NULL       | Buyer reference             |
| seller_id        | UUID          | FK → users(id), NOT NULL       | Seller reference            |
| product_id       | UUID          | FK → products(id), NOT NULL    | Product reference           |
| quantity         | INTEGER       | NOT NULL, DEFAULT 1, CHECK > 0 | Order quantity              |
| unit_price       | DECIMAL(12,2) | NOT NULL, CHECK > 0            | Price per unit              |
| total_price      | DECIMAL(12,2) | NOT NULL, CHECK > 0            | Total order value           |
| currency         | VARCHAR(3)    | NOT NULL, DEFAULT 'BRL'        | Currency code               |
| status           | VARCHAR(20)   | NOT NULL, DEFAULT 'pending'    | Order status                |
| payment_status   | VARCHAR(20)   | NOT NULL, DEFAULT 'pending'    | Payment status              |
| shipping_address | JSONB         | NULLABLE                       | Delivery address            |
| notes            | TEXT          | NULLABLE                       | Order notes                 |
| metadata         | JSONB         | DEFAULT '{}'                   | Additional data             |
| created_at       | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()        | Creation timestamp          |
| updated_at       | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()        | Last update timestamp       |

#### Order Status Values

| Status     | Description               | Color  |
| ---------- | ------------------------- | ------ |
| pending    | Awaiting confirmation     | Yellow |
| confirmed  | Order confirmed by seller | Blue   |
| processing | Being prepared            | Purple |
| shipped    | In transit                | Indigo |
| delivered  | Successfully delivered    | Green  |
| cancelled  | Order cancelled           | Gray   |
| refunded   | Payment refunded          | Orange |

#### Payment Status Values

| Status     | Description             | Color  |
| ---------- | ----------------------- | ------ |
| pending    | Awaiting payment        | Yellow |
| processing | Payment being processed | Blue   |
| paid       | Payment received        | Green  |
| failed     | Payment failed          | Red    |
| refunded   | Payment refunded        | Orange |

#### Shipping Address Structure (JSONB)

```typescript
interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
```

### Constraints

```sql
-- Quantity validation
CONSTRAINT orders_quantity_check CHECK (quantity > 0)

-- Price validations
CONSTRAINT orders_unit_price_check CHECK (unit_price > 0)
CONSTRAINT orders_total_price_check CHECK (total_price > 0)

-- Status validation
CONSTRAINT orders_status_check CHECK (
  status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
)

-- Payment status validation
CONSTRAINT orders_payment_status_check CHECK (
  payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')
)
```

### Indexes

| Index Name                | Columns            | Type      | Purpose              |
| ------------------------- | ------------------ | --------- | -------------------- |
| idx_orders_buyer_id       | buyer_id           | B-tree    | Buyer's orders       |
| idx_orders_seller_id      | seller_id          | B-tree    | Seller's orders      |
| idx_orders_product_id     | product_id         | B-tree    | Product orders       |
| idx_orders_status         | status             | B-tree    | Status filtering     |
| idx_orders_payment_status | payment_status     | B-tree    | Payment filtering    |
| idx_orders_created_at     | created_at DESC    | B-tree    | Date sorting         |
| idx_orders_order_number   | order_number       | B-tree    | Order lookup         |
| idx_orders_buyer_status   | buyer_id, status   | Composite | Buyer status filter  |
| idx_orders_seller_status  | seller_id, status  | Composite | Seller status filter |
| idx_orders_date_range     | created_at, status | Composite | Date + status        |

## Queries Reference

### TypeScript Query Library

Import from `./queries/orders.queries.ts`:

```typescript
import {
  // Types
  Order,
  OrderInsert,
  OrderUpdate,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
  ShippingAddress,

  // Query functions
  getOrderById,
  getOrderByNumber,
  listOrders,
  getOrdersByBuyer,
  getOrdersBySeller,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  getOrderStats,
} from "@/modules/data/orders-data";
```

### Read Operations

#### Get Order by ID

```typescript
const order = await getOrderById(supabase, orderId);
```

```sql
SELECT * FROM public.orders WHERE id = $1;
```

#### Get Order by Number

```typescript
const order = await getOrderByNumber(supabase, "ORD-2025-001234");
```

#### List Orders with Filters

```typescript
const { data, count } = await listOrders(supabase, {
  status: "pending",
  buyerId: userId,
  dateFrom: new Date("2025-01-01"),
  dateTo: new Date("2025-12-31"),
  sortBy: "createdAt",
  sortOrder: "desc",
  limit: 20,
  offset: 0,
});
```

#### Get Buyer's Orders

```typescript
const orders = await getOrdersByBuyer(supabase, buyerId, {
  status: "delivered",
  limit: 10,
});
```

#### Get Seller's Orders

```typescript
const orders = await getOrdersBySeller(supabase, sellerId, {
  status: ["pending", "confirmed"],
});
```

### Write Operations

#### Create Order

```typescript
const order = await createOrder(supabase, {
  buyerId: "uuid",
  sellerId: "uuid",
  productId: "uuid",
  quantity: 2,
  unitPrice: 99.9,
  totalPrice: 199.8,
  currency: "BRL",
  shippingAddress: {
    street: "Rua Example",
    number: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    country: "Brasil",
  },
});
```

#### Update Order Status

```typescript
// Status transitions
await confirmOrder(supabase, orderId); // pending → confirmed
await shipOrder(supabase, orderId); // confirmed/processing → shipped
await deliverOrder(supabase, orderId); // shipped → delivered
await cancelOrder(supabase, orderId); // pending/confirmed → cancelled

// Generic status update
await updateOrderStatus(supabase, orderId, "processing");
```

#### Update Payment Status

```typescript
await updatePaymentStatus(supabase, orderId, "paid");
```

### Statistics

#### Get Order Stats

```typescript
const stats = await getOrderStats(supabase, userId, "seller");
// Returns: { total, pending, completed, cancelled, revenue }
```

## RLS Policies

### Buyer Access

```sql
CREATE POLICY "Buyers can view own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Buyers can create orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());
```

### Seller Access

```sql
CREATE POLICY "Sellers can view orders for their products"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can update order status"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid());
```

### Combined Policy (Production)

```sql
CREATE POLICY "Users can access own orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());
```

## Performance

### Query Optimization Tips

1. **Always filter by indexed columns**:

```sql
-- Good: Uses idx_orders_buyer_status
WHERE buyer_id = $1 AND status = 'pending'

-- Bad: Full table scan
WHERE notes LIKE '%keyword%'
```

2. **Use pagination**:

```sql
-- Good
LIMIT 20 OFFSET 0

-- Bad: Returns all rows
-- No LIMIT clause
```

3. **Filter by date range with status**:

```sql
-- Good: Uses idx_orders_date_range
WHERE created_at >= '2025-01-01' AND status = 'completed'
```

### Monitoring

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%orders%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'orders'
ORDER BY idx_scan DESC;
```

## Security

### Best Practices

1. **Always enable RLS** in production
2. **Validate status transitions** in application layer
3. **Use parameterized queries** to prevent SQL injection
4. **Audit sensitive operations** (cancellations, refunds)
5. **Encrypt shipping addresses** if required by compliance

### Status Transition Rules

```typescript
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
```

## Examples

### Example 1: Complete Order Flow

```typescript
// 1. Create order
const order = await createOrder(supabase, {
  buyerId: buyerUserId,
  sellerId: sellerUserId,
  productId: productId,
  quantity: 1,
  unitPrice: 150.0,
  totalPrice: 150.0,
  shippingAddress: {
    /* ... */
  },
});

// 2. Seller confirms
await confirmOrder(supabase, order.id);

// 3. Payment received
await updatePaymentStatus(supabase, order.id, "paid");

// 4. Seller ships
await shipOrder(supabase, order.id);

// 5. Buyer receives
await deliverOrder(supabase, order.id);
```

### Example 2: Order Dashboard

```typescript
// Seller dashboard
async function getSellerDashboard(sellerId: string) {
  const [pending, inProgress, stats] = await Promise.all([
    getOrdersBySeller(supabase, sellerId, { status: "pending", limit: 5 }),
    getOrdersBySeller(supabase, sellerId, {
      status: ["confirmed", "processing", "shipped"],
    }),
    getOrderStats(supabase, sellerId, "seller"),
  ]);

  return {
    pendingOrders: pending,
    inProgressOrders: inProgress,
    totalOrders: stats.total,
    totalRevenue: stats.revenue,
  };
}
```

### Example 3: Order Search

```typescript
async function searchOrders(filters: OrderFilters) {
  const { data, count } = await listOrders(supabase, {
    ...filters,
    limit: 20,
    offset: (filters.page - 1) * 20,
  });

  return {
    orders: data,
    total: count,
    pages: Math.ceil(count / 20),
  };
}
```

## Troubleshooting

### Common Issues

#### 1. RLS blocking queries

```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Verify user context
SELECT auth.uid();
```

#### 2. Status transition blocked

```typescript
// Validate transition before update
if (!canTransition(currentStatus, newStatus)) {
  throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
}
```

#### 3. Order number collision

```sql
-- Generate unique order number
SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::text, 6, '0');
```

---

**Module Version**: 1.0.0
**Last Updated**: 2025-12-09
**PostgreSQL Version**: 14+
**Supabase Compatible**: Yes
**Status**: Experimental
