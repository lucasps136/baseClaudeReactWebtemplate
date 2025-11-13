# User Data Module

> Database schema, migrations and queries for user management

## Overview

Complete database layer for user management including:

- PostgreSQL table schema
- Row Level Security (RLS) policies
- Indexes for performance
- Migrations for version control
- Reusable SQL queries
- Optimized for Supabase

## Structure

```
modules/data/user-data/
├── schemas/
│   └── users.sql              # Complete table schema
├── migrations/
│   └── 001_create_users_table.sql  # Initial migration
├── queries/
│   └── users.sql              # Reusable queries
└── docs/
    └── README.md              # Detailed documentation
```

## Quick Start

### 1. Run Migration in Supabase

**Option A: Supabase Dashboard**

1. Go to SQL Editor in Supabase Dashboard
2. Copy content from `migrations/001_create_users_table.sql`
3. Execute the migration

**Option B: Command Line**

```bash
psql -h your-supabase-host.supabase.co -U postgres -d postgres -f modules/data/user-data/migrations/001_create_users_table.sql
```

### 2. Verify Installation

```sql
-- Check if table exists
SELECT * FROM public.users LIMIT 1;

-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## Schema Details

### Users Table

| Column     | Type        | Constraints      | Description              |
| ---------- | ----------- | ---------------- | ------------------------ |
| id         | UUID        | PRIMARY KEY      | Unique identifier        |
| email      | TEXT        | UNIQUE, NOT NULL | User email               |
| name       | TEXT        | NOT NULL         | User name (2-100 chars)  |
| avatar     | TEXT        | NULLABLE         | Avatar URL               |
| bio        | TEXT        | NULLABLE         | User bio (max 500 chars) |
| created_at | TIMESTAMPTZ | NOT NULL         | Creation timestamp       |
| updated_at | TIMESTAMPTZ | NOT NULL         | Last update timestamp    |

### Indexes

- `idx_users_email`: Fast email lookups
- `idx_users_created_at`: Sort by creation date
- `idx_users_name`: Name searches
- `idx_users_search`: Full-text search on name and bio

### RLS Policies

- **Authenticated users**: Full access (SELECT, INSERT, UPDATE, DELETE)
- **Anonymous users**: Read-only access (SELECT)

## Using Queries

### With Supabase JS

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key);

// Get user by ID
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("id", userId)
  .single();

// Get users with pagination
const { data, error } = await supabase
  .from("users")
  .select("*")
  .order("created_at", { ascending: false })
  .range(0, 19); // First 20 users

// Search users
const { data, error } = await supabase
  .from("users")
  .select("*")
  .textSearch("name", "john", {
    type: "websearch",
    config: "english",
  });

// Create user
const { data, error } = await supabase
  .from("users")
  .insert({
    email: "john@example.com",
    name: "John Doe",
    bio: "Software developer",
  })
  .select()
  .single();

// Update user
const { data, error } = await supabase
  .from("users")
  .update({
    name: "John Smith",
    bio: "Senior developer",
  })
  .eq("id", userId)
  .select()
  .single();

// Delete user
const { error } = await supabase.from("users").delete().eq("id", userId);
```

### Direct SQL Queries

Use the queries from `queries/users.sql` with parameterized statements:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key);

// Execute custom query
const { data, error } = await supabase.rpc("get_user_stats");
```

## Maintenance

### Adding Indexes

```sql
-- Add custom index
CREATE INDEX idx_users_custom ON public.users(column_name);
```

### Modifying Schema

**Important**: Always create new migration files, never modify existing ones.

Example: Add new column

```sql
-- File: migrations/002_add_user_phone.sql
ALTER TABLE public.users ADD COLUMN phone TEXT;
```

### Backing Up Data

```bash
# Backup users table
pg_dump -h your-host.supabase.co -U postgres -d postgres -t public.users > users_backup.sql

# Restore
psql -h your-host.supabase.co -U postgres -d postgres < users_backup.sql
```

## Integration with Other Modules

### With user-logic Module

Create repository implementation:

```typescript
import { IUserRepository } from "@/modules/logic/user-logic";
import { createClient } from "@supabase/supabase-js";

export class SupabaseUserRepository implements IUserRepository {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  // ... implement other methods
}
```

## Performance Tips

1. **Use indexes**: All common queries are indexed
2. **Limit results**: Always use LIMIT for large datasets
3. **Use RLS**: Leverage Row Level Security for access control
4. **Monitor queries**: Use Supabase query analyzer
5. **Full-text search**: Use GIN indexes for search operations

## Security

- **RLS enabled**: All policies must be explicitly defined
- **Input validation**: Constraints on email, name, bio lengths
- **Parameterized queries**: Always use prepared statements
- **No sensitive data**: Never store passwords in this table (use auth.users)

## Troubleshooting

### Table already exists

```sql
-- Drop and recreate (WARNING: deletes all data)
DROP TABLE IF EXISTS public.users CASCADE;
-- Then run migration again
```

### RLS blocking queries

```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Temporarily disable RLS (for debugging only)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Index not being used

```sql
-- Check query plan
EXPLAIN ANALYZE
SELECT * FROM public.users WHERE email = 'test@example.com';

-- Recreate index
DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX idx_users_email ON public.users(email);
```

## Contributing

When contributing to this module:

1. Create new migration files (don't modify existing ones)
2. Test migrations in development first
3. Document all schema changes
4. Update queries if schema changes
5. Run `npm run modules:sync` after changes

## License

MIT

---

**Module Version**: 1.0.0
**Last Updated**: 2025-01-11
**Database**: PostgreSQL 14+
**Platform**: Supabase
**Status**: Stable
