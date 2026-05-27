
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_kicker_ar text,
  ADD COLUMN IF NOT EXISTS hero_kicker_en text,
  ADD COLUMN IF NOT EXISTS hero_title_ar text,
  ADD COLUMN IF NOT EXISTS hero_title_en text,
  ADD COLUMN IF NOT EXISTS hero_sub_ar text,
  ADD COLUMN IF NOT EXISTS hero_sub_en text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS about_ar text,
  ADD COLUMN IF NOT EXISTS about_en text;
