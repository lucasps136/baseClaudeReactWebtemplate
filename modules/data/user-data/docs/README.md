# User Data Module - Complete Documentation

> Complete database layer for user management with PostgreSQL schemas, RLS policies, and optimized queries

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Schema Reference](#schema-reference)
- [Queries Reference](#queries-reference)
- [RLS Policies](#rls-policies)
- [Performance](#performance)
- [Security](#security)
- [Maintenance](#maintenance)

## Overview

This module provides a complete, production-ready database layer for user management with:

✅ **PostgreSQL schema** with constraints and validations
✅ **Row Level Security (RLS)** policies for access control
✅ **Performance indexes** for common queries
✅ **Auto-updating timestamps** with triggers
✅ **Full-text search** capabilities
✅ **Reusable SQL queries** for all CRUD operations
✅ **Supabase-optimized** configuration

## Installation

### Step 1: Run Migration

Execute the migration in Supabase SQL Editor:

```bash
# Copy and paste contents of:
modules/data/user-data/migrations/001_create_users_table.sql
```

### Step 2: Verify Installation

```sql
-- Verify table exists
\d public.users

-- Check RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- Check indexes
\di public.idx_users_*
```

### Step 3: Test with Sample Data

```sql
-- Insert test user
INSERT INTO public.users (email, name, bio)
VALUES ('test@example.com', 'Test User', 'Sample bio')
RETURNING *;

-- Query test user
SELECT * FROM public.users WHERE email = 'test@example.com';
```

## Schema Reference

### Table: public.users

Complete table definition with all fields, constraints, and metadata.

#### Columns

##### id (UUID)

- **Type**: UUID
- **Constraint**: PRIMARY KEY
- **Default**: `gen_random_uuid()`
- **Description**: Unique identifier for the user
- **Example**: `"550e8400-e29b-41d4-a716-446655440000"`

##### email (TEXT)

- **Type**: TEXT
- **Constraints**: NOT NULL, UNIQUE
- **Validation**: Minimum 3 characters
- **Description**: User email address
- **Example**: `"john.doe@example.com"`

##### name (TEXT)

- **Type**: TEXT
- **Constraints**: NOT NULL
- **Validation**: 2-100 characters
- **Description**: User display name
- **Example**: `"John Doe"`

##### avatar (TEXT)

- **Type**: TEXT
- **Constraints**: NULLABLE
- **Description**: URL to user avatar image
- **Example**: `"https://example.com/avatars/john.jpg"`

##### bio (TEXT)

- **Type**: TEXT
- **Constraints**: NULLABLE
- **Validation**: Maximum 500 characters
- **Description**: User biography
- **Example**: `"Software developer passionate about clean code"`

##### created_at (TIMESTAMPTZ)

- **Type**: TIMESTAMPTZ
- **Constraints**: NOT NULL
- **Default**: `NOW()`
- **Description**: Timestamp when user was created
- **Example**: `"2025-01-11T17:00:00.000Z"`

##### updated_at (TIMESTAMPTZ)

- **Type**: TIMESTAMPTZ
- **Constraints**: NOT NULL
- **Default**: `NOW()`
- **Auto-update**: YES (via trigger)
- **Description**: Timestamp when user was last updated
- **Example**: `"2025-01-11T17:30:00.000Z"`

#### Constraints

```sql
-- Email validation
CONSTRAINT users_email_check CHECK (char_length(email) >= 3)

-- Name validation
CONSTRAINT users_name_check CHECK (
  char_length(name) >= 2 AND char_length(name) <= 100
)

-- Bio validation
CONSTRAINT users_bio_check CHECK (
  bio IS NULL OR char_length(bio) <= 500
)
```

## Queries Reference

### Read Operations

#### Get User by ID

```sql
-- Query: get_user_by_id
-- Parameters: $1 = user_id (UUID)

SELECT id, email, name, avatar, bio, created_at, updated_at
FROM public.users
WHERE id = $1;
```

**Supabase JS:**

```typescript
const { data } = await supabase
  .from("users")
  .select("*")
  .eq("id", userId)
  .single();
```

#### Get User by Email

```sql
-- Query: get_user_by_email
-- Parameters: $1 = email (TEXT)

SELECT id, email, name, avatar, bio, created_at, updated_at
FROM public.users
WHERE email = $1;
```

**Supabase JS:**

```typescript
const { data } = await supabase
  .from("users")
  .select("*")
  .eq("email", "john@example.com")
  .single();
```

#### Get Users with Pagination

```sql
-- Query: get_users_paginated
-- Parameters: $1 = limit (INT), $2 = offset (INT)

SELECT id, email, name, avatar, bio, created_at, updated_at
FROM public.users
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
```

**Supabase JS:**

```typescript
const { data } = await supabase
  .from("users")
  .select("*")
  .order("created_at", { ascending: false })
  .range(0, 19); // Limit 20, offset 0
```

#### Search Users (Full-Text)

```sql
-- Query: search_users
-- Parameters: $1 = search_term (TEXT), $2 = limit, $3 = offset

SELECT id, email, name, avatar, bio, created_at, updated_at
FROM public.users
WHERE to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, ''))
  @@ plainto_tsquery('english', $1)
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

**Supabase JS:**

```typescript
const { data } = await supabase
  .from("users")
  .select("*")
  .textSearch("name", searchTerm, { type: "websearch" });
```

### Create Operations

#### Create User

```sql
-- Query: create_user
-- Parameters: $1 = email, $2 = name, $3 = bio

INSERT INTO public.users (email, name, bio)
VALUES ($1, $2, $3)
RETURNING id, email, name, avatar, bio, created_at, updated_at;
```

**Supabase JS:**

```typescript
const { data } = await supabase
  .from("users")
  .insert({ email, name, bio })
  .select()
  .single();
```

### Update Operations

#### Update User

```sql
-- Query: update_user
-- Parameters: $1 = user_id, $2 = name, $3 = bio, $4 = avatar

UPDATE public.users
SET
  name = COALESCE($2, name),
  bio = COALESCE($3, bio),
  avatar = COALESCE($4, avatar)
WHERE id = $1
RETURNING id, email, name, avatar, bio, created_at, updated_at;
```

**Supabase JS:**

```typescript
const { data } = await supabase
  .from("users")
  .update({ name, bio, avatar })
  .eq("id", userId)
  .select()
  .single();
```

### Delete Operations

#### Delete User

```sql
-- Query: delete_user
-- Parameters: $1 = user_id

DELETE FROM public.users WHERE id = $1;
```

**Supabase JS:**

```typescript
await supabase.from("users").delete().eq("id", userId);
```

## RLS Policies

### Policy: Authenticated Users

**Name**: `"Allow all operations for authenticated users"`
**Operations**: ALL (SELECT, INSERT, UPDATE, DELETE)
**Role**: `authenticated`
**USING**: `true`
**WITH CHECK**: `true`

```sql
CREATE POLICY "Allow all operations for authenticated users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

**Effect**: Authenticated users can perform any operation on any user record.

### Policy: Anonymous Users

**Name**: `"Allow read for anonymous users"`
**Operations**: SELECT
**Role**: `anon`
**USING**: `true`

```sql
CREATE POLICY "Allow read for anonymous users"
  ON public.users
  FOR SELECT
  TO anon
  USING (true);
```

**Effect**: Anonymous users can view all user profiles but cannot modify them.

### Custom Policies (Examples)

#### Users can only update their own profile

```sql
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

#### Admin users can do everything

```sql
CREATE POLICY "Admins can do everything"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Performance

### Indexes

All common query patterns are indexed for optimal performance:

| Index Name           | Columns         | Type   | Purpose          |
| -------------------- | --------------- | ------ | ---------------- |
| idx_users_email      | email           | B-tree | Email lookups    |
| idx_users_created_at | created_at DESC | B-tree | Sort by date     |
| idx_users_name       | name            | B-tree | Name searches    |
| idx_users_search     | name + bio      | GIN    | Full-text search |

### Query Performance Tips

1. **Always use indexes**:

   ```sql
   -- Good: Uses idx_users_email
   WHERE email = 'john@example.com'

   -- Bad: Full table scan
   WHERE LOWER(email) = 'john@example.com'
   ```

2. **Limit results**:

   ```sql
   -- Good
   LIMIT 20 OFFSET 0

   -- Bad: Returns all rows
   -- No LIMIT clause
   ```

3. **Use full-text search**:

   ```sql
   -- Good: Uses idx_users_search
   WHERE to_tsvector('english', name || ' ' || bio)
     @@ plainto_tsquery('english', 'developer')

   -- Bad: Slow LIKE query
   WHERE name LIKE '%developer%' OR bio LIKE '%developer%'
   ```

### Monitoring

```sql
-- Check slow queries
SELECT *
FROM pg_stat_statements
WHERE query LIKE '%users%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'users';
```

## Security

### Best Practices

1. **Never store passwords**: Use `auth.users` table from Supabase Auth
2. **Validate input**: All constraints are enforced at database level
3. **Use RLS**: Always keep RLS enabled in production
4. **Parameterized queries**: Prevent SQL injection
5. **Audit logs**: Consider adding trigger for change tracking

### Input Validation

Validation happens at multiple levels:

**Database level** (via constraints):

```sql
CHECK (char_length(email) >= 3)
CHECK (char_length(name) >= 2 AND char_length(name) <= 100)
CHECK (bio IS NULL OR char_length(bio) <= 500)
```

**Application level** (via user-logic module):

```typescript
// See modules/logic/user-logic/src/validations/user.validation.ts
await userValidation.validateCreateInput(input);
```

## Maintenance

### Backup

```bash
# Backup users table
pg_dump -h your-host.supabase.co \
  -U postgres \
  -d postgres \
  -t public.users \
  > users_backup_$(date +%Y%m%d).sql

# Restore
psql -h your-host.supabase.co \
  -U postgres \
  -d postgres \
  < users_backup_20250111.sql
```

### Migrations

**Rule**: Never modify existing migrations. Always create new ones.

```sql
-- File: migrations/002_add_phone_column.sql
BEGIN;

ALTER TABLE public.users ADD COLUMN phone TEXT;

CREATE INDEX idx_users_phone ON public.users(phone);

COMMIT;
```

### Cleanup

```sql
-- Delete test data
DELETE FROM public.users WHERE email LIKE '%test%';

-- Reset sequence (if using SERIAL)
SELECT setval('users_id_seq', (SELECT MAX(id) FROM public.users));

-- Vacuum table
VACUUM ANALYZE public.users;
```

## Examples

### Example 1: Complete User CRUD Flow

Complete SQL examples for all operations:

```sql
-- 1. CREATE: Insert new user
INSERT INTO public.users (email, name, bio)
VALUES ('john.doe@example.com', 'John Doe', 'Software developer')
RETURNING *;

-- 2. READ: Get user by email
SELECT * FROM public.users
WHERE email = 'john.doe@example.com';

-- 3. UPDATE: Update user profile
UPDATE public.users
SET name = 'John Smith', bio = 'Senior developer'
WHERE email = 'john.doe@example.com'
RETURNING *;

-- 4. DELETE: Remove user
DELETE FROM public.users
WHERE email = 'john.doe@example.com';
```

### Example 2: Supabase Client Usage

Using this module with Supabase JavaScript client:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// CREATE
async function createUser() {
  const { data, error } = await supabase
    .from("users")
    .insert({
      email: "john@example.com",
      name: "John Doe",
      bio: "Developer",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// READ - Single
async function getUserById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// READ - List with filters
async function getUsers(search?: string, limit = 20, offset = 0) {
  let query = supabase.from("users").select("*", { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    users: data,
    total: count || 0,
    hasMore: offset + limit < (count || 0),
  };
}

// UPDATE
async function updateUser(id: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// DELETE
async function deleteUser(id: string) {
  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) throw error;
}
```

### Example 3: Pagination Implementation

Efficient pagination with total count:

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: "name" | "email" | "created_at";
  sortOrder?: "asc" | "desc";
}

async function getPaginatedUsers(params: PaginationParams) {
  const {
    page = 1,
    pageSize = 20,
    search,
    sortBy = "created_at",
    sortOrder = "desc",
  } = params;

  const offset = (page - 1) * pageSize;

  let query = supabase.from("users").select("*", { count: "exact" });

  // Search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  // Sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  const totalPages = Math.ceil((count || 0) / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages,
      hasMore: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}

// Usage
const result = await getPaginatedUsers({
  page: 1,
  pageSize: 10,
  search: "john",
  sortBy: "name",
  sortOrder: "asc",
});

console.log("Users:", result.data);
console.log("Page:", result.pagination.page);
console.log("Total:", result.pagination.total);
console.log("Has more:", result.pagination.hasMore);
```

### Example 4: Bulk Operations

Efficient bulk insert and update:

```typescript
// Bulk insert
async function bulkCreateUsers(users: Array<{ email: string; name: string }>) {
  const { data, error } = await supabase
    .from('users')
    .insert(users)
    .select()

  if (error) throw error
  return data
}

// Usage
const newUsers = [
  { email: 'user1@example.com', name: 'User 1' },
  { email: 'user2@example.com', name: 'User 2' },
  { email: 'user3@example.com', name: 'User 3' },
]

const created = await bulkCreateUsers(newUsers)
console.log(`Created ${created.length} users`)

// Bulk update (via SQL function)
-- First create SQL function
CREATE OR REPLACE FUNCTION bulk_update_users(
  user_ids uuid[],
  new_bio text
)
RETURNS SETOF public.users AS $$
BEGIN
  RETURN QUERY
  UPDATE public.users
  SET bio = new_bio
  WHERE id = ANY(user_ids)
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

// Then call from JavaScript
const { data, error } = await supabase.rpc('bulk_update_users', {
  user_ids: ['id1', 'id2', 'id3'],
  new_bio: 'Updated bio',
})
```

## Testing

### Database Testing

#### Setup Test Database

```bash
# Create test database
createdb bebarter_test

# Run migrations on test database
psql -d bebarter_test -f modules/data/user-data/migrations/001_create_users_table.sql
```

#### Test Data Fixtures

```sql
-- test/fixtures/users.sql
BEGIN;

-- Clean existing data
TRUNCATE public.users CASCADE;

-- Insert test users
INSERT INTO public.users (id, email, name, bio) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test1@example.com', 'Test User 1', 'Bio 1'),
  ('00000000-0000-0000-0000-000000000002', 'test2@example.com', 'Test User 2', 'Bio 2'),
  ('00000000-0000-0000-0000-000000000003', 'test3@example.com', 'Test User 3', 'Bio 3');

COMMIT;
```

#### Integration Tests Example

```typescript
// tests/integration/users.test.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_KEY!,
);

describe("Users Table", () => {
  beforeAll(async () => {
    // Load fixtures
    // await loadFixtures('users.sql')
  });

  afterEach(async () => {
    // Clean up test data
    await supabase
      .from("users")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  });

  describe("CREATE operations", () => {
    it("should create user with valid data", async () => {
      const newUser = {
        email: "new@example.com",
        name: "New User",
        bio: "Test bio",
      };

      const { data, error } = await supabase
        .from("users")
        .insert(newUser)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toMatchObject(newUser);
      expect(data.id).toBeDefined();
      expect(data.created_at).toBeDefined();
    });

    it("should reject duplicate email", async () => {
      const user = {
        email: "duplicate@example.com",
        name: "User",
      };

      // First insert should succeed
      const { error: error1 } = await supabase.from("users").insert(user);
      expect(error1).toBeNull();

      // Second insert should fail
      const { error: error2 } = await supabase.from("users").insert(user);
      expect(error2).toBeDefined();
      expect(error2?.code).toBe("23505"); // unique_violation
    });

    it("should enforce email constraint", async () => {
      const { error } = await supabase.from("users").insert({
        email: "ab", // Too short
        name: "User",
      });

      expect(error).toBeDefined();
      expect(error?.code).toBe("23514"); // check_violation
    });

    it("should enforce name length constraint", async () => {
      const { error } = await supabase.from("users").insert({
        email: "test@example.com",
        name: "A", // Too short
      });

      expect(error).toBeDefined();
      expect(error?.code).toBe("23514");
    });
  });

  describe("READ operations", () => {
    it("should get user by id", async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single();

      expect(error).toBeNull();
      expect(data.email).toBe("test1@example.com");
    });

    it("should search users by name", async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("name", "%Test%");

      expect(error).toBeNull();
      expect(data.length).toBeGreaterThan(0);
    });

    it("should paginate results", async () => {
      const pageSize = 2;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .range(0, pageSize - 1);

      expect(error).toBeNull();
      expect(data.length).toBeLessThanOrEqual(pageSize);
    });
  });

  describe("UPDATE operations", () => {
    it("should update user successfully", async () => {
      const { data, error } = await supabase
        .from("users")
        .update({ name: "Updated Name" })
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.name).toBe("Updated Name");
      expect(data.updated_at).not.toBe(data.created_at);
    });

    it("should auto-update updated_at timestamp", async () => {
      const { data: before } = await supabase
        .from("users")
        .select("updated_at")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await supabase
        .from("users")
        .update({ bio: "New bio" })
        .eq("id", "00000000-0000-0000-0000-000000000001");

      const { data: after } = await supabase
        .from("users")
        .select("updated_at")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single();

      expect(new Date(after.updated_at).getTime()).toBeGreaterThan(
        new Date(before.updated_at).getTime(),
      );
    });
  });

  describe("DELETE operations", () => {
    it("should delete user successfully", async () => {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", "00000000-0000-0000-0000-000000000001");

      expect(error).toBeNull();

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", "00000000-0000-0000-0000-000000000001");

      expect(data.length).toBe(0);
    });
  });

  describe("RLS Policies", () => {
    it("should allow authenticated users to read", async () => {
      // Assuming authenticated context
      const { data, error } = await supabase.from("users").select("*");

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("should allow authenticated users to insert", async () => {
      const { error } = await supabase.from("users").insert({
        email: "rls-test@example.com",
        name: "RLS Test",
      });

      expect(error).toBeNull();
    });
  });
});
```

### Performance Testing

```typescript
// tests/performance/users-performance.test.ts
describe("Users Table Performance", () => {
  it("should query by email efficiently (using index)", async () => {
    const start = Date.now();

    await supabase.from("users").select("*").eq("email", "test@example.com");

    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100); // Should be fast with index
  });

  it("should handle pagination efficiently", async () => {
    const start = Date.now();

    await supabase.from("users").select("*", { count: "exact" }).range(0, 99);

    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200);
  });
});
```

## Troubleshooting

### Common Issues

#### 1. RLS blocking queries

**Problem**: Queries return no results even though data exists.

**Solution**: Check RLS policies

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename = 'users';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Temporarily disable (development only!)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

#### 2. Unique constraint violation

**Problem**: `ERROR: duplicate key value violates unique constraint "users_email_key"`

**Solution**: Email already exists

```sql
-- Check if email exists
SELECT * FROM public.users WHERE email = 'duplicate@example.com';

-- Update instead of insert
UPDATE public.users SET name = 'New Name' WHERE email = 'duplicate@example.com';
```

#### 3. Constraint check violation

**Problem**: `ERROR: new row for relation "users" violates check constraint "users_name_check"`

**Solution**: Validate input before insert

```typescript
// In application code
if (name.length < 2 || name.length > 100) {
  throw new Error("Name must be between 2 and 100 characters");
}
```

## License

MIT

---

**Module Version**: 1.0.0
**Last Updated**: 2025-01-11
**PostgreSQL Version**: 14+
**Supabase Compatible**: Yes
**Status**: Production Ready
