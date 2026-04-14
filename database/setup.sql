-- ============================================================
-- BEBARTER — Database Setup
-- Consolidated init script for Docker local dev.
-- Executed automatically on first start (empty volume).
-- To re-run: npm run docker:reset && npm run docker:up
--
-- Sources (in order):
--   1. database/rbac-schema.sql
--   2. modules/data/user-data/migrations/001_create_users_table.sql
--   3. modules/data/orders-data/schemas/orders_data.sql
--   4. modules/data/payments-data/schemas/payments_data.sql
--   5. modules/data/products-data/migrations/001_create_products_table.sql
-- ============================================================


-- ============================================================
-- 1. RBAC Schema
-- Source: database/rbac-schema.sql
-- ============================================================

-- uuid-ossp is pre-installed by the supabase/postgres image

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
-- Note: auth.users FK omitted — auth.users is created by GoTrue after initdb.
-- Referential integrity with auth.users is enforced at the application level.
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  organization_id UUID,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id, organization_id)
);

INSERT INTO public.roles (name, description, is_system) VALUES
  ('super_admin', 'Full system access', true),
  ('admin', 'Organization administrator', true),
  ('owner', 'Organization owner', true),
  ('member', 'Organization member', true),
  ('viewer', 'Read-only access', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (name, description, resource, action) VALUES
  ('users.create', 'Create users', 'users', 'create'),
  ('users.read', 'View users', 'users', 'read'),
  ('users.update', 'Update users', 'users', 'update'),
  ('users.delete', 'Delete users', 'users', 'delete'),
  ('users.invite', 'Invite users', 'users', 'invite'),
  ('organization.read', 'View organization', 'organization', 'read'),
  ('organization.update', 'Update organization', 'organization', 'update'),
  ('organization.delete', 'Delete organization', 'organization', 'delete'),
  ('organization.billing', 'Manage billing', 'organization', 'billing'),
  ('content.create', 'Create content', 'content', 'create'),
  ('content.read', 'View content', 'content', 'read'),
  ('content.update', 'Update content', 'content', 'update'),
  ('content.delete', 'Delete content', 'content', 'delete'),
  ('content.publish', 'Publish content', 'content', 'publish'),
  ('billing.read', 'View billing', 'billing', 'read'),
  ('billing.update', 'Update billing', 'billing', 'update'),
  ('billing.cancel', 'Cancel subscriptions', 'billing', 'cancel'),
  ('analytics.read', 'View analytics', 'analytics', 'read'),
  ('reports.export', 'Export reports', 'reports', 'export'),
  ('system.logs', 'View system logs', 'system', 'read'),
  ('system.settings', 'Update system settings', 'system', 'update')
ON CONFLICT (name) DO NOTHING;

WITH role_permission_assignments AS (
  SELECT r.id as role_id, p.id as permission_id
  FROM public.roles r
  CROSS JOIN public.permissions p
  WHERE
    (r.name = 'super_admin') OR
    (r.name = 'admin' AND p.resource != 'system') OR
    (r.name = 'owner' AND p.resource IN ('organization', 'billing', 'users', 'content', 'analytics')) OR
    (r.name = 'member' AND (
      (p.resource = 'content' AND p.action IN ('create', 'read', 'update')) OR
      (p.resource = 'organization' AND p.action = 'read') OR
      (p.resource = 'users' AND p.action = 'read')
    )) OR
    (r.name = 'viewer' AND p.action = 'read')
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT role_id, permission_id FROM role_permission_assignments
ON CONFLICT DO NOTHING;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Only admins can manage roles" ON public.roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin') AND ur.is_active = true
  )
);

CREATE POLICY "Users can view permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Only super admins can manage permissions" ON public.permissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'super_admin' AND ur.is_active = true
  )
);

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'owner') AND ur.is_active = true
  )
);

CREATE POLICY "Only admins can assign roles" ON public.user_roles FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'owner') AND ur.is_active = true
  )
);

CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_name TEXT, organization_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_has_permission.user_id
    AND p.name = permission_name
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    AND (organization_id IS NULL OR ur.organization_id = organization_id OR ur.organization_id IS NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS TABLE(role_name TEXT, organization_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, ur.organization_id
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = get_user_roles.user_id
  AND ur.is_active = true
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS TABLE(permission_name TEXT, resource TEXT, action TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name, p.resource, p.action
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role_id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = get_user_permissions.user_id
  AND ur.is_active = true
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_roles TEXT[];
  user_permissions TEXT[];
BEGIN
  SELECT ARRAY_AGG(role_name) INTO user_roles FROM public.get_user_roles(auth.uid());
  SELECT ARRAY_AGG(permission_name) INTO user_permissions FROM public.get_user_permissions(auth.uid());
  claims := COALESCE(event->'claims', '{}'::JSONB);
  claims := claims || jsonb_build_object(
    'user_roles', COALESCE(user_roles, '{}'),
    'user_permissions', COALESCE(user_permissions, '{}')
  );
  event := event || jsonb_build_object('claims', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization ON public.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON public.permissions(resource, action);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- 2. Users Table
-- Source: modules/data/user-data/migrations/001_create_users_table.sql
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);
CREATE INDEX IF NOT EXISTS idx_users_search ON public.users USING GIN(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, ''))
);

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read for anonymous users"
  ON public.users FOR SELECT TO anon USING (true);

GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;


-- ============================================================
-- 3. Orders Data Table
-- Source: modules/data/orders-data/schemas/orders_data.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT orders_data_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 100)
);

CREATE INDEX IF NOT EXISTS idx_orders_data_name ON public.orders_data(name);
CREATE INDEX IF NOT EXISTS idx_orders_data_created_at ON public.orders_data(created_at DESC);

DROP TRIGGER IF EXISTS update_orders_data_updated_at ON public.orders_data;
CREATE TRIGGER update_orders_data_updated_at
  BEFORE UPDATE ON public.orders_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.orders_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON public.orders_data FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON public.orders_data TO authenticated;


-- ============================================================
-- 4. Payments Data Table
-- Source: modules/data/payments-data/schemas/payments_data.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payments_data_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 100)
);

CREATE INDEX IF NOT EXISTS idx_payments_data_name ON public.payments_data(name);
CREATE INDEX IF NOT EXISTS idx_payments_data_created_at ON public.payments_data(created_at DESC);

DROP TRIGGER IF EXISTS update_payments_data_updated_at ON public.payments_data;
CREATE TRIGGER update_payments_data_updated_at
  BEFORE UPDATE ON public.payments_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.payments_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON public.payments_data FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON public.payments_data TO authenticated;


-- ============================================================
-- 5. Products Table
-- Source: modules/data/products-data/migrations/001_create_products_table.sql
-- Note: Uses CREATE TABLE IF NOT EXISTS (original had DROP TABLE CASCADE — safe for init)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category_id UUID,
  seller_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  images JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 255),
  CONSTRAINT products_price_check CHECK (price > 0),
  CONSTRAINT products_stock_check CHECK (stock_quantity >= 0),
  CONSTRAINT products_status_check CHECK (status IN ('draft', 'active', 'sold', 'archived')),
  CONSTRAINT products_currency_check CHECK (currency IN ('BRL', 'USD', 'EUR', 'GBP')),
  CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_status_created ON public.products(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
);
CREATE INDEX IF NOT EXISTS idx_products_metadata ON public.products USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_products_images ON public.products USING GIN(images);

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can view all products"
  ON public.products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only authenticated users can create products"
  ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Only product owner can update"
  ON public.products FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Only product owner can delete"
  ON public.products FOR DELETE TO authenticated USING (auth.uid() = seller_id);

GRANT ALL ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
