# ProductsData Data Module

> Database schema and queries for products-data

## Installation

Execute migration in Supabase SQL Editor:

```bash
# Run migration
modules/data/products-data/migrations/001_create_products_data_table.sql
```

## Schema

Table: `public.products_data`

| Column     | Type        | Description           |
| ---------- | ----------- | --------------------- |
| id         | UUID        | Primary key           |
| name       | TEXT        | Item name             |
| created_at | TIMESTAMPTZ | Creation timestamp    |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Queries

See `queries/products_data.sql` for reusable SQL queries.
