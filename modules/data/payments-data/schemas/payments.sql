-- =============================================================================
-- PAYMENTS TABLE SCHEMA
-- Bebarter Modular Architecture - Payments Data Module
-- =============================================================================

-- Drop existing table if exists (for clean migrations)
DROP TABLE IF EXISTS public.payments CASCADE;

-- Create payments table
CREATE TABLE public.payments (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    payer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    payee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,

    -- Payment details
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- Gateway integration
    external_id VARCHAR(255),
    gateway VARCHAR(20) NOT NULL,
    gateway_response JSONB DEFAULT '{}',

    -- Additional info
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT payments_amount_positive CHECK (amount > 0),
    CONSTRAINT payments_status_valid CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    CONSTRAINT payments_method_valid CHECK (payment_method IN ('credit_card', 'debit_card', 'pix', 'boleto', 'wallet', 'bank_transfer')),
    CONSTRAINT payments_gateway_valid CHECK (gateway IN ('stripe', 'pagarme', 'mercadopago', 'internal')),
    CONSTRAINT payments_currency_valid CHECK (currency IN ('BRL', 'USD', 'EUR', 'GBP')),
    CONSTRAINT payments_payer_payee_different CHECK (payer_id != payee_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Single column indexes for common queries
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_payer_id ON public.payments(payer_id);
CREATE INDEX idx_payments_payee_id ON public.payments(payee_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_external_id ON public.payments(external_id);
CREATE INDEX idx_payments_gateway ON public.payments(gateway);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX idx_payments_paid_at ON public.payments(paid_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX idx_payments_payer_status ON public.payments(payer_id, status);
CREATE INDEX idx_payments_payee_status ON public.payments(payee_id, status);
CREATE INDEX idx_payments_status_created ON public.payments(status, created_at DESC);
CREATE INDEX idx_payments_gateway_status ON public.payments(gateway, status);

-- GIN indexes for JSONB columns
CREATE INDEX idx_payments_metadata ON public.payments USING GIN(metadata);
CREATE INDEX idx_payments_gateway_response ON public.payments USING GIN(gateway_response);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_updated_at_trigger
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Payers can view their own payments
CREATE POLICY "Payers can view own payments"
    ON public.payments
    FOR SELECT
    TO authenticated
    USING (payer_id = auth.uid());

-- Policy: Payees can view payments received
CREATE POLICY "Payees can view received payments"
    ON public.payments
    FOR SELECT
    TO authenticated
    USING (payee_id = auth.uid());

-- Policy: Only service role can insert payments (backend only)
CREATE POLICY "Service role can insert payments"
    ON public.payments
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy: Only service role can update payments (backend only)
CREATE POLICY "Service role can update payments"
    ON public.payments
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- No DELETE policy - payments are audit trail

-- =============================================================================
-- PERMISSIONS
-- =============================================================================

-- Grant permissions
GRANT SELECT ON public.payments TO authenticated;
GRANT SELECT ON public.payments TO anon;
GRANT ALL ON public.payments TO service_role;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.payments IS 'Payments table for marketplace transactions';
COMMENT ON COLUMN public.payments.id IS 'Unique payment identifier';
COMMENT ON COLUMN public.payments.order_id IS 'Reference to order being paid';
COMMENT ON COLUMN public.payments.payer_id IS 'Reference to payer user (buyer)';
COMMENT ON COLUMN public.payments.payee_id IS 'Reference to payee user (seller)';
COMMENT ON COLUMN public.payments.amount IS 'Payment amount';
COMMENT ON COLUMN public.payments.currency IS 'Currency code (BRL, USD, EUR, GBP)';
COMMENT ON COLUMN public.payments.payment_method IS 'Payment method: credit_card, debit_card, pix, boleto, wallet, bank_transfer';
COMMENT ON COLUMN public.payments.status IS 'Payment status: pending, processing, completed, failed, refunded, cancelled';
COMMENT ON COLUMN public.payments.external_id IS 'External payment gateway transaction ID';
COMMENT ON COLUMN public.payments.gateway IS 'Payment gateway: stripe, pagarme, mercadopago, internal';
COMMENT ON COLUMN public.payments.gateway_response IS 'Raw gateway response as JSON';
COMMENT ON COLUMN public.payments.failure_reason IS 'Reason for payment failure';
COMMENT ON COLUMN public.payments.paid_at IS 'Timestamp when payment was completed';
COMMENT ON COLUMN public.payments.refunded_at IS 'Timestamp when payment was refunded';
