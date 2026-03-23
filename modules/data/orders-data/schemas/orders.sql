-- =============================================================================
-- ORDERS TABLE SCHEMA
-- Bebarter Modular Architecture - Orders Data Module
-- =============================================================================

-- Drop existing table if exists (for clean migrations)
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create orders table
CREATE TABLE public.orders (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Order number (human readable)
    order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(gen_random_uuid()::text, 1, 8)),

    -- Relationships
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,

    -- Order details
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_id UUID,

    -- Shipping
    shipping_address JSONB,

    -- Additional info
    notes TEXT,
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT orders_quantity_positive CHECK (quantity > 0),
    CONSTRAINT orders_unit_price_positive CHECK (unit_price > 0),
    CONSTRAINT orders_total_price_positive CHECK (total_price > 0),
    CONSTRAINT orders_status_valid CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    CONSTRAINT orders_payment_status_valid CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    CONSTRAINT orders_currency_valid CHECK (currency IN ('BRL', 'USD', 'EUR', 'GBP')),
    CONSTRAINT orders_buyer_seller_different CHECK (buyer_id != seller_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Single column indexes for common queries
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_product_id ON public.orders(product_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

-- Composite indexes for common query patterns
CREATE INDEX idx_orders_buyer_status ON public.orders(buyer_id, status);
CREATE INDEX idx_orders_seller_status ON public.orders(seller_id, status);
CREATE INDEX idx_orders_status_created ON public.orders(status, created_at DESC);

-- GIN indexes for JSONB columns
CREATE INDEX idx_orders_metadata ON public.orders USING GIN(metadata);
CREATE INDEX idx_orders_shipping_address ON public.orders USING GIN(shipping_address);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Buyers can view their own orders
CREATE POLICY "Buyers can view own orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (buyer_id = auth.uid());

-- Policy: Sellers can view orders for their products
CREATE POLICY "Sellers can view their orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (seller_id = auth.uid());

-- Policy: Only authenticated buyers can create orders
CREATE POLICY "Buyers can create orders"
    ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (buyer_id = auth.uid());

-- Policy: Sellers can update order status
CREATE POLICY "Sellers can update order status"
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (seller_id = auth.uid())
    WITH CHECK (seller_id = auth.uid());

-- Policy: Buyers can cancel pending orders
CREATE POLICY "Buyers can cancel pending orders"
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (buyer_id = auth.uid() AND status IN ('pending', 'confirmed'))
    WITH CHECK (buyer_id = auth.uid() AND status = 'cancelled');

-- =============================================================================
-- PERMISSIONS
-- =============================================================================

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT ON public.orders TO anon;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.orders IS 'Orders table for marketplace transactions';
COMMENT ON COLUMN public.orders.id IS 'Unique order identifier';
COMMENT ON COLUMN public.orders.order_number IS 'Human readable order number';
COMMENT ON COLUMN public.orders.buyer_id IS 'Reference to buyer user';
COMMENT ON COLUMN public.orders.seller_id IS 'Reference to seller user';
COMMENT ON COLUMN public.orders.product_id IS 'Reference to purchased product';
COMMENT ON COLUMN public.orders.quantity IS 'Number of items ordered';
COMMENT ON COLUMN public.orders.unit_price IS 'Price per unit at time of order';
COMMENT ON COLUMN public.orders.total_price IS 'Total order value (quantity * unit_price)';
COMMENT ON COLUMN public.orders.status IS 'Order status: pending, confirmed, processing, shipped, delivered, cancelled, refunded';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN public.orders.shipping_address IS 'Shipping address as JSON object';
COMMENT ON COLUMN public.orders.metadata IS 'Additional order metadata';
