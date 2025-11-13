-- =====================================================
-- Migration: 001_create_users_table
-- =====================================================
-- Description: Initial migration to create users table
-- Version: 1.0.0
-- Created: 2025-01-11
-- Author: Bebarter Team
-- =====================================================

BEGIN;

-- =====================================================
-- CREATE USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_check CHECK (char_length(email) >= 3),
  CONSTRAINT users_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  CONSTRAINT users_bio_check CHECK (bio IS NULL OR char_length(bio) <= 500)
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);
CREATE INDEX IF NOT EXISTS idx_users_search ON public.users USING GIN(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, ''))
);

-- =====================================================
-- CREATE TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

CREATE POLICY "Allow all operations for authenticated users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow read for anonymous users"
  ON public.users
  FOR SELECT
  TO anon
  USING (true);

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.users IS 'Users table for user profile management';
COMMENT ON COLUMN public.users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN public.users.email IS 'User email address (unique)';
COMMENT ON COLUMN public.users.name IS 'User display name';
COMMENT ON COLUMN public.users.avatar IS 'URL to user avatar image';
COMMENT ON COLUMN public.users.bio IS 'User biography (max 500 characters)';
COMMENT ON COLUMN public.users.created_at IS 'Timestamp when user was created';
COMMENT ON COLUMN public.users.updated_at IS 'Timestamp when user was last updated';

COMMIT;

-- =====================================================
-- ROLLBACK SCRIPT (for reference)
-- =====================================================
-- To rollback this migration, run:
--
-- BEGIN;
-- DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
-- DROP FUNCTION IF EXISTS public.update_updated_at_column();
-- DROP TABLE IF EXISTS public.users CASCADE;
-- COMMIT;
