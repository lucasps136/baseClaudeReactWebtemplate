# Payments Data Module - Complete Documentation

> Database layer for payment processing with multi-gateway support, refund tracking, and TypeScript queries

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Schema Reference](#schema-reference)
- [Queries Reference](#queries-reference)
- [RLS Policies](#rls-policies)
- [Gateway Integration](#gateway-integration)
- [Performance](#performance)
- [Examples](#examples)

## Overview

This module provides a complete, production-ready database layer for payment management with:

✅ **PostgreSQL schema** with comprehensive payment tracking
✅ **Multi-gateway support** (Stripe, Pagar.me, MercadoPago)
✅ **Multiple payment methods** (PIX, Credit Card, Boleto, etc.)
✅ **Row Level Security (RLS)** for payer/payee access control
✅ **Refund tracking** with partial refund support
✅ **Gateway response storage** for debugging
✅ **TypeScript query library** with full type safety

## Installation

### Step 1: Run Schema

Execute in Supabase SQL Editor:

```bash
# Copy and paste contents of:
modules/data/payments-data/schemas/payments.sql
```

### Step 2: Verify Installation

```sql
-- Verify table exists
\d public.payments

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'payments';

-- Check indexes
\di public.idx_payments_*
```

## Schema Reference

### Table: public.payments

Complete table definition for payment processing.

#### Columns

| Column           | Type          | Constraints                   | Description            |
| ---------------- | ------------- | ----------------------------- | ---------------------- |
| id               | UUID          | PK, DEFAULT gen_random_uuid() | Unique identifier      |
| order_id         | UUID          | FK → orders(id), NOT NULL     | Associated order       |
| payer_id         | UUID          | FK → users(id), NOT NULL      | Who pays (buyer)       |
| payee_id         | UUID          | FK → users(id), NOT NULL      | Who receives (seller)  |
| amount           | DECIMAL(12,2) | NOT NULL, CHECK > 0           | Payment amount         |
| currency         | VARCHAR(3)    | NOT NULL, DEFAULT 'BRL'       | Currency code          |
| status           | VARCHAR(20)   | NOT NULL, DEFAULT 'pending'   | Payment status         |
| payment_method   | VARCHAR(30)   | NOT NULL                      | Payment method         |
| gateway          | VARCHAR(30)   | NOT NULL                      | Payment gateway        |
| external_id      | VARCHAR(255)  | NULLABLE                      | Gateway transaction ID |
| gateway_response | JSONB         | NULLABLE                      | Gateway API response   |
| failure_reason   | TEXT          | NULLABLE                      | Failure description    |
| refunded_amount  | DECIMAL(12,2) | DEFAULT 0                     | Total refunded         |
| metadata         | JSONB         | DEFAULT '{}'                  | Additional data        |
| created_at       | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()       | Creation timestamp     |
| updated_at       | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()       | Last update            |
| completed_at     | TIMESTAMPTZ   | NULLABLE                      | Completion timestamp   |

#### Payment Status Values

| Status     | Description                | Color  |
| ---------- | -------------------------- | ------ |
| pending    | Awaiting payment           | Yellow |
| processing | Being processed by gateway | Blue   |
| completed  | Successfully paid          | Green  |
| failed     | Payment failed             | Red    |
| refunded   | Fully refunded             | Orange |
| cancelled  | Payment cancelled          | Gray   |

#### Payment Methods

| Method        | Description                     | Icon        |
| ------------- | ------------------------------- | ----------- |
| credit_card   | Credit Card                     | credit-card |
| debit_card    | Debit Card                      | credit-card |
| pix           | PIX (Brazilian instant payment) | qr-code     |
| boleto        | Bank slip (Brazil)              | document    |
| wallet        | Digital wallet                  | wallet      |
| bank_transfer | Bank transfer                   | bank        |

#### Payment Gateways

| Gateway     | Description              |
| ----------- | ------------------------ |
| stripe      | Stripe payments          |
| pagarme     | Pagar.me (Brazil)        |
| mercadopago | MercadoPago (LATAM)      |
| internal    | Internal/manual payments |

### Constraints

```sql
-- Amount validation
CONSTRAINT payments_amount_check CHECK (amount > 0)

-- Refund validation
CONSTRAINT payments_refund_check CHECK (refunded_amount >= 0 AND refunded_amount <= amount)

-- Status validation
CONSTRAINT payments_status_check CHECK (
  status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')
)

-- Payment method validation
CONSTRAINT payments_method_check CHECK (
  payment_method IN ('credit_card', 'debit_card', 'pix', 'boleto', 'wallet', 'bank_transfer')
)

-- Gateway validation
CONSTRAINT payments_gateway_check CHECK (
  gateway IN ('stripe', 'pagarme', 'mercadopago', 'internal')
)
```

### Indexes

| Index Name               | Columns         | Type   | Purpose           |
| ------------------------ | --------------- | ------ | ----------------- |
| idx_payments_order_id    | order_id        | B-tree | Order payments    |
| idx_payments_payer_id    | payer_id        | B-tree | Payer history     |
| idx_payments_payee_id    | payee_id        | B-tree | Payee history     |
| idx_payments_status      | status          | B-tree | Status filtering  |
| idx_payments_gateway     | gateway         | B-tree | Gateway filtering |
| idx_payments_external_id | external_id     | B-tree | Gateway lookup    |
| idx_payments_created_at  | created_at DESC | B-tree | Date sorting      |
| idx_payments_method      | payment_method  | B-tree | Method filtering  |

## Queries Reference

### TypeScript Query Library

Import from `./queries/payments.queries.ts`:

```typescript
import {
  // Types
  Payment,
  PaymentInsert,
  PaymentUpdate,
  PaymentFilters,
  PaymentStatus,
  PaymentMethod,
  PaymentGateway,

  // Query functions
  getPaymentById,
  getPaymentByExternalId,
  listPayments,
  getPaymentsByOrder,
  getPaymentsByPayer,
  getPaymentsByPayee,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  markAsPaid,
  markAsFailed,
  markAsRefunded,
  getPaymentStats,
} from "@/modules/data/payments-data";
```

### Read Operations

#### Get Payment by ID

```typescript
const payment = await getPaymentById(supabase, paymentId);
```

#### Get Payment by External ID (Gateway)

```typescript
// Useful for webhook processing
const payment = await getPaymentByExternalId(supabase, "pi_1234567890");
```

#### List Payments with Filters

```typescript
const { data, count } = await listPayments(supabase, {
  status: "completed",
  gateway: "stripe",
  paymentMethod: "pix",
  dateFrom: new Date("2025-01-01"),
  minAmount: 100,
  maxAmount: 1000,
  sortBy: "amount",
  sortOrder: "desc",
  limit: 20,
});
```

#### Get Payments by Order

```typescript
const payments = await getPaymentsByOrder(supabase, orderId);
```

#### Get Payer/Payee History

```typescript
// Payer (buyer) history
const payerPayments = await getPaymentsByPayer(supabase, userId, { limit: 10 });

// Payee (seller) history
const payeePayments = await getPaymentsByPayee(supabase, userId, {
  status: "completed",
});
```

### Write Operations

#### Create Payment

```typescript
const payment = await createPayment(supabase, {
  orderId: "order-uuid",
  payerId: "buyer-uuid",
  payeeId: "seller-uuid",
  amount: 150.0,
  currency: "BRL",
  paymentMethod: "pix",
  gateway: "stripe",
});
```

#### Update Payment Status

```typescript
// Mark as processing
await updatePaymentStatus(supabase, paymentId, "processing");

// Mark as paid with gateway response
await markAsPaid(supabase, paymentId, "pi_1234567890", {
  stripe_payment_intent: "pi_1234567890",
  paid_at: new Date().toISOString(),
});

// Mark as failed
await markAsFailed(supabase, paymentId, "Card declined: insufficient funds");

// Process refund
await markAsRefunded(supabase, paymentId, 150.0); // Full refund
await markAsRefunded(supabase, paymentId, 50.0); // Partial refund
```

### Statistics

#### Get Payment Stats

```typescript
const stats = await getPaymentStats(supabase, userId, "payee");
// Returns: { total, completed, failed, refunded, totalAmount, refundedAmount }
```

## RLS Policies

### Payer Access

```sql
CREATE POLICY "Payers can view own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (payer_id = auth.uid());

CREATE POLICY "Payers can create payments"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (payer_id = auth.uid());
```

### Payee Access

```sql
CREATE POLICY "Payees can view received payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (payee_id = auth.uid());
```

### Combined Policy

```sql
CREATE POLICY "Users can access own payments"
  ON public.payments
  FOR ALL
  TO authenticated
  USING (payer_id = auth.uid() OR payee_id = auth.uid());
```

## Gateway Integration

### Stripe

```typescript
// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 15000, // cents
  currency: "brl",
  payment_method_types: ["card", "pix"],
  metadata: { order_id: orderId },
});

// Store in database
await createPayment(supabase, {
  orderId,
  payerId,
  payeeId,
  amount: 150.0,
  paymentMethod: "pix",
  gateway: "stripe",
  externalId: paymentIntent.id,
});
```

### Webhook Processing

```typescript
// Stripe webhook handler
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "payment_intent.succeeded":
      const pi = event.data.object as Stripe.PaymentIntent;
      const payment = await getPaymentByExternalId(supabase, pi.id);
      if (payment) {
        await markAsPaid(supabase, payment.id, pi.id, pi);
      }
      break;

    case "payment_intent.payment_failed":
      const failedPi = event.data.object as Stripe.PaymentIntent;
      const failedPayment = await getPaymentByExternalId(supabase, failedPi.id);
      if (failedPayment) {
        await markAsFailed(
          supabase,
          failedPayment.id,
          failedPi.last_payment_error?.message,
        );
      }
      break;
  }
}
```

### PIX Integration

```typescript
// Create PIX payment
const pixPayment = await createPayment(supabase, {
  orderId,
  payerId,
  payeeId,
  amount: 150.0,
  paymentMethod: "pix",
  gateway: "mercadopago",
  metadata: {
    pix_key: "recipient@email.com",
    expiration_minutes: 30,
  },
});

// Generate QR code via gateway
const qrCode = await mercadoPago.createPixPayment({
  amount: 150.0,
  payer_email: payerEmail,
});

// Update with external ID
await updatePayment(supabase, pixPayment.id, {
  externalId: qrCode.id,
  gatewayResponse: qrCode,
});
```

## Performance

### Query Optimization Tips

1. **Use external_id index for webhooks**:

```sql
-- Good: Uses idx_payments_external_id
WHERE external_id = 'pi_1234567890'
```

2. **Filter by gateway and status together**:

```sql
-- Good: Uses indexes efficiently
WHERE gateway = 'stripe' AND status = 'pending'
```

3. **Date range with pagination**:

```sql
-- Good
WHERE created_at >= '2025-01-01' AND created_at < '2025-02-01'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0
```

### Monitoring

```sql
-- Payment success rate by gateway
SELECT
  gateway,
  COUNT(*) FILTER (WHERE status = 'completed') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed')::numeric /
    NULLIF(COUNT(*), 0) * 100, 2
  ) as success_rate
FROM public.payments
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY gateway;

-- Average payment processing time
SELECT
  gateway,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_seconds
FROM public.payments
WHERE status = 'completed' AND completed_at IS NOT NULL
GROUP BY gateway;
```

## Examples

### Example 1: Complete Payment Flow

```typescript
// 1. User initiates payment
const payment = await createPayment(supabase, {
  orderId,
  payerId: buyerId,
  payeeId: sellerId,
  amount: order.totalPrice,
  paymentMethod: "credit_card",
  gateway: "stripe",
});

// 2. Create gateway payment
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(order.totalPrice * 100),
  currency: "brl",
});

// 3. Store external ID
await updatePayment(supabase, payment.id, {
  externalId: paymentIntent.id,
  status: "processing",
});

// 4. Client confirms payment
// ... frontend handles stripe.confirmCardPayment()

// 5. Webhook receives confirmation
await markAsPaid(supabase, payment.id, paymentIntent.id, {
  stripe_response: paymentIntent,
});

// 6. Update order payment status
await updateOrderPaymentStatus(supabase, orderId, "paid");
```

### Example 2: Refund Processing

```typescript
async function processRefund(paymentId: string, amount?: number) {
  const payment = await getPaymentById(supabase, paymentId);

  if (payment.status !== "completed") {
    throw new Error("Can only refund completed payments");
  }

  const refundAmount = amount || payment.amount - payment.refundedAmount;

  // Process refund with gateway
  if (payment.gateway === "stripe" && payment.externalId) {
    await stripe.refunds.create({
      payment_intent: payment.externalId,
      amount: Math.round(refundAmount * 100),
    });
  }

  // Update database
  await markAsRefunded(supabase, paymentId, refundAmount);

  // If fully refunded, update order
  if (payment.refundedAmount + refundAmount >= payment.amount) {
    await updateOrderStatus(supabase, payment.orderId, "refunded");
  }
}
```

### Example 3: Payment Dashboard

```typescript
async function getPaymentDashboard(userId: string, role: "payer" | "payee") {
  const [pending, recent, stats] = await Promise.all([
    role === "payer"
      ? getPaymentsByPayer(supabase, userId, { status: "pending", limit: 5 })
      : getPaymentsByPayee(supabase, userId, { status: "pending", limit: 5 }),
    role === "payer"
      ? getPaymentsByPayer(supabase, userId, { limit: 10 })
      : getPaymentsByPayee(supabase, userId, { limit: 10 }),
    getPaymentStats(supabase, userId, role),
  ]);

  return {
    pendingPayments: pending,
    recentPayments: recent,
    totalAmount: stats.totalAmount,
    completedCount: stats.completed,
    refundedAmount: stats.refundedAmount,
  };
}
```

## Troubleshooting

### Common Issues

#### 1. External ID not found

```typescript
// Always check for null
const payment = await getPaymentByExternalId(supabase, externalId);
if (!payment) {
  console.error(`Payment not found for external_id: ${externalId}`);
  // May need to create payment record
}
```

#### 2. Refund amount exceeds limit

```sql
-- Check refund history
SELECT
  id,
  amount,
  refunded_amount,
  amount - refunded_amount as available_refund
FROM public.payments
WHERE id = $1;
```

#### 3. Gateway response too large

```sql
-- Check JSONB size
SELECT
  id,
  pg_column_size(gateway_response) as response_size
FROM public.payments
WHERE pg_column_size(gateway_response) > 10000;

-- Truncate if needed
UPDATE public.payments
SET gateway_response = gateway_response - 'large_key'
WHERE id = $1;
```

---

**Module Version**: 1.0.0
**Last Updated**: 2025-12-09
**PostgreSQL Version**: 14+
**Supabase Compatible**: Yes
**Status**: Experimental
