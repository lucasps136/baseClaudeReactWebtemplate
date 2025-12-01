-- PaymentsData Queries

-- Get by ID
SELECT * FROM public.payments_data WHERE id = $1;

-- Get all
SELECT * FROM public.payments_data ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- Create
INSERT INTO public.payments_data (name) VALUES ($1) RETURNING *;

-- Update
UPDATE public.payments_data SET name = $1 WHERE id = $2 RETURNING *;

-- Delete
DELETE FROM public.payments_data WHERE id = $1;
