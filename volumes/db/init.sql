-- ============================================================
-- BEBARTER — Database initialization
--
-- Creates the roles and schemas required by Supabase services
-- (GoTrue, PostgREST, postgres-meta) on a stock postgres image.
--
-- Runs only on first container start (empty PGDATA).
-- Use `npm run docker:reset` to wipe and re-run.
-- ============================================================

-- ------------------------------------------------------------
-- Supabase admin (used by postgres-meta / Studio)
-- ------------------------------------------------------------
CREATE USER supabase_admin WITH SUPERUSER CREATEDB CREATEROLE LOGIN REPLICATION BYPASSRLS PASSWORD 'postgres';

-- ------------------------------------------------------------
-- PostgREST authenticator + impersonation roles
-- ------------------------------------------------------------
CREATE ROLE anon NOLOGIN NOINHERIT;
CREATE ROLE authenticated NOLOGIN NOINHERIT;
CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;

CREATE USER authenticator WITH LOGIN NOINHERIT PASSWORD 'postgres';
GRANT anon, authenticated, service_role TO authenticator;

-- ------------------------------------------------------------
-- GoTrue auth admin + auth schema
-- ------------------------------------------------------------
CREATE USER supabase_auth_admin WITH LOGIN CREATEROLE NOINHERIT PASSWORD 'postgres';

-- CRITICAL: GoTrue issues some queries with unqualified table names
-- (e.g. `users`, `identities`). Without forcing `auth` to the front of
-- the search_path they resolve to public.* (where bebarter's tables live)
-- and signup fails with "relation identities does not exist" /
-- "column users.aud does not exist".
ALTER ROLE supabase_auth_admin SET search_path = auth, public;

CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth
  GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth
  GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth
  GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
GRANT supabase_auth_admin TO postgres;

-- ------------------------------------------------------------
-- Public schema — grant access to PostgREST roles
-- ------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;

-- ------------------------------------------------------------
-- graphql_public schema (optional — only if PostgREST GraphQL is used)
-- ------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS graphql_public;
GRANT USAGE ON SCHEMA graphql_public TO postgres, anon, authenticated, service_role;

-- ------------------------------------------------------------
-- Supabase-compatible helper functions
-- These read JWT claims from PostgREST's session GUCs so that
-- RLS policies using auth.uid() / auth.role() work without the
-- full supabase/postgres image.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$
    SELECT COALESCE(
      NULLIF(current_setting('request.jwt.claim.sub', true), ''),
      (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
  $$;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text
  LANGUAGE sql STABLE
  AS $$
    SELECT COALESCE(
      NULLIF(current_setting('request.jwt.claim.role', true), ''),
      (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
    )::text
  $$;

CREATE OR REPLACE FUNCTION auth.email() RETURNS text
  LANGUAGE sql STABLE
  AS $$
    SELECT COALESCE(
      NULLIF(current_setting('request.jwt.claim.email', true), ''),
      (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
    )::text
  $$;

-- Transfer ownership to supabase_auth_admin so GoTrue can replace them during migrations
ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;
ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;
ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

GRANT EXECUTE ON FUNCTION auth.uid() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.role() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.email() TO postgres, anon, authenticated, service_role;
