-- ProductsData Queries

-- Get by ID
SELECT * FROM public.products_data WHERE id = $1;

-- Get all
SELECT * FROM public.products_data ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- Create
INSERT INTO public.products_data (name) VALUES ($1) RETURNING *;

-- Update
UPDATE public.products_data SET name = $1 WHERE id = $2 RETURNING *;

-- Delete
DELETE FROM public.products_data WHERE id = $1;
