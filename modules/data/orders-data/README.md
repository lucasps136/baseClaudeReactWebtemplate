# OrdersData Data Module

> Database schema and queries for orders-data

## Installation

Execute migration in Supabase SQL Editor:

```bash
# Run migration
modules/data/orders-data/migrations/001_create_orders_data_table.sql
```

## Schema

Table: `public.orders_data`

| Column     | Type        | Description           |
| ---------- | ----------- | --------------------- |
| id         | UUID        | Primary key           |
| name       | TEXT        | Item name             |
| created_at | TIMESTAMPTZ | Creation timestamp    |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Queries

See `queries/orders_data.sql` for reusable SQL queries.
