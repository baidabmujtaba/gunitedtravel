ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'SAR';