-- =====================================================
-- User Data Module - Complete Schema
-- =====================================================
-- Description: Complete users table schema with RLS, indexes and triggers
-- Version: 1.0.0
-- Created: 2025-01-11
-- =====================================================

-- =====================================================
-- 1. TABLE DEFINITION
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User data
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT users_email_check CHECK (char_length(email) >= 3),
  CONSTRAINT users_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  CONSTRAINT users_bio_check CHECK (bio IS NULL OR char_length(bio) <= 500)
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on email for lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Index on name for search
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);

-- Full-text search index on name and bio
CREATE INDEX IF NOT EXISTS idx_users_search ON public.users USING GIN(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, ''))
);

-- =====================================================
-- 3. TRIGGER FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow read for anonymous users (optional, adjust as needed)
CREATE POLICY "Allow read for anonymous users"
  ON public.users
  FOR SELECT
  TO anon
  USING (true);

-- =====================================================
-- 5. GRANTS
-- =====================================================

-- Grant access to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.users IS 'Users table for user profile management';
COMMENT ON COLUMN public.users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN public.users.email IS 'User email address (unique)';
COMMENT ON COLUMN public.users.name IS 'User display name';
COMMENT ON COLUMN public.users.avatar IS 'URL to user avatar image';
COMMENT ON COLUMN public.users.bio IS 'User biography (max 500 characters)';
COMMENT ON COLUMN public.users.created_at IS 'Timestamp when user was created';
COMMENT ON COLUMN public.users.updated_at IS 'Timestamp when user was last updated';
