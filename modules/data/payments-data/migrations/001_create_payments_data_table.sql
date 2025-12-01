-- Migration: 001_create_payments_data_table
-- Created: 2025-11-21

BEGIN;

-- Execute schema
\i ../schemas/payments_data.sql

COMMIT;
