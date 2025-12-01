# PaymentsData Data Module

> Database schema and queries for payments-data

## Installation

Execute migration in Supabase SQL Editor:

```bash
# Run migration
modules/data/payments-data/migrations/001_create_payments_data_table.sql
```

## Schema

Table: `public.payments_data`

| Column     | Type        | Description           |
| ---------- | ----------- | --------------------- |
| id         | UUID        | Primary key           |
| name       | TEXT        | Item name             |
| created_at | TIMESTAMPTZ | Creation timestamp    |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Queries

See `queries/payments_data.sql` for reusable SQL queries.
