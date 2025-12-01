-- Migration: 001_create_orders_data_table
-- Created: 2025-11-21

BEGIN;

-- Execute schema
\i ../schemas/orders_data.sql

COMMIT;
