-- =====================================================
-- Migration: Create Products Table
-- =====================================================
-- Version: 1.0.0
-- Created: 2025-12-08
-- Description: Initial migration to create products table with complete schema
-- =====================================================

-- Drop table if exists (for clean migrations)
DROP TABLE IF EXISTS public.products CASCADE;

-- Create products table
CREATE TABLE public.products (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic product info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',

  -- Inventory
  stock_quantity INTEGER NOT NULL DEFAULT 0,

  -- Relationships
  category_id UUID,
  seller_id UUID NOT NULL,

  -- Product status
  status VARCHAR(20) NOT NULL DEFAULT 'draft',

  -- Media and metadata
  images JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT products_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 255),
  CONSTRAINT products_price_check CHECK (price > 0),
  CONSTRAINT products_stock_check CHECK (stock_quantity >= 0),
  CONSTRAINT products_status_check CHECK (status IN ('draft', 'active', 'sold', 'archived')),
  CONSTRAINT products_currency_check CHECK (currency IN ('BRL', 'USD', 'EUR', 'GBP')),

  -- Foreign key to users table (seller)
  CONSTRAINT fk_products_seller FOREIGN KEY (seller_id)
    REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_status_created ON public.products(status, created_at DESC);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_search ON public.products USING GIN(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
);
CREATE INDEX idx_products_metadata ON public.products USING GIN(metadata);
CREATE INDEX idx_products_images ON public.products USING GIN(images);

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can view all products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can create products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Only product owner can update"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Only product owner can delete"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Grant permissions
GRANT ALL ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;

-- Add table and column comments
COMMENT ON TABLE public.products IS 'Products table for marketplace items';
COMMENT ON COLUMN public.products.id IS 'Unique identifier for the product';
COMMENT ON COLUMN public.products.name IS 'Product name (2-255 characters)';
COMMENT ON COLUMN public.products.description IS 'Detailed product description';
COMMENT ON COLUMN public.products.price IS 'Product price (must be > 0)';
COMMENT ON COLUMN public.products.currency IS 'Currency code (BRL, USD, EUR, GBP)';
COMMENT ON COLUMN public.products.stock_quantity IS 'Available stock quantity (>= 0)';
COMMENT ON COLUMN public.products.category_id IS 'Reference to product category (nullable)';
COMMENT ON COLUMN public.products.seller_id IS 'Reference to user who owns this product';
COMMENT ON COLUMN public.products.status IS 'Product status: draft, active, sold, archived';
COMMENT ON COLUMN public.products.images IS 'JSONB array of product image URLs';
COMMENT ON COLUMN public.products.metadata IS 'JSONB object for additional product data';
COMMENT ON COLUMN public.products.created_at IS 'Timestamp when product was created';
COMMENT ON COLUMN public.products.updated_at IS 'Timestamp when product was last updated';
