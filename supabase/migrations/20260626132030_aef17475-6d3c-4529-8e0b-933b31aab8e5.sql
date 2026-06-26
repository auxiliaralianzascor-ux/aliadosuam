
ALTER TABLE public.allies
  ADD COLUMN IF NOT EXISTS contacts jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill: convertir el contacto único existente al arreglo de contactos
UPDATE public.allies
SET contacts = jsonb_build_array(
  jsonb_build_object(
    'name', COALESCE(contact_name, ''),
    'position', '',
    'email', COALESCE(contact_email, ''),
    'phone', COALESCE(contact_phone, '')
  )
)
WHERE (contacts IS NULL OR contacts = '[]'::jsonb)
  AND (contact_name IS NOT NULL OR contact_email IS NOT NULL OR contact_phone IS NOT NULL);
