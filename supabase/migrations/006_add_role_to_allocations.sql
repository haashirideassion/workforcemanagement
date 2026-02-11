-- Add role column to allocations table
ALTER TABLE public.allocations 
ADD COLUMN IF NOT EXISTS role character varying;

-- Optional: Update existing allocations with default roles if needed
-- UPDATE public.allocations SET role = 'Member' WHERE role IS NULL;
