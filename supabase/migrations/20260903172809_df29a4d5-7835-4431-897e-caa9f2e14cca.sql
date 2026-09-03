ALTER TABLE public.allies
  ADD COLUMN IF NOT EXISTS academic_participation jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.allies.academic_participation IS 'Participación académica del aliado con empleados y familiares por nivel: pregrado, posgrado, maestria, doctorado y educacion_continuada.';