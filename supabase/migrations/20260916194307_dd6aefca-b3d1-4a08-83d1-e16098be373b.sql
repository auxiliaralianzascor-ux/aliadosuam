ALTER TABLE public.allies
  ADD COLUMN IF NOT EXISTS agreement_type text,
  ADD COLUMN IF NOT EXISTS partner_type text,
  ADD COLUMN IF NOT EXISTS mission_function text,
  ADD COLUMN IF NOT EXISTS shared_value text,
  ADD COLUMN IF NOT EXISTS conditions text,
  ADD COLUMN IF NOT EXISTS applies_to text,
  ADD COLUMN IF NOT EXISTS close_date text,
  ADD COLUMN IF NOT EXISTS economic_value text,
  ADD COLUMN IF NOT EXISTS dependency_origin text,
  ADD COLUMN IF NOT EXISTS dependency_implementer text;