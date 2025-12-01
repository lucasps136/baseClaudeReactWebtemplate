-- PaymentsData Table Schema
-- Version: 1.0.0

CREATE TABLE IF NOT EXISTS public.payments_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT payments_data_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 100)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_data_name ON public.payments_data(name);
CREATE INDEX IF NOT EXISTS idx_payments_data_created_at ON public.payments_data(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payments_data_updated_at ON public.payments_data;
CREATE TRIGGER update_payments_data_updated_at
  BEFORE UPDATE ON public.payments_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.payments_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON public.payments_data
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT ALL ON public.payments_data TO authenticated;
