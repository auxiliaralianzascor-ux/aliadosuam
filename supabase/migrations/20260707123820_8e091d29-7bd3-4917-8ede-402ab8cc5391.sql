
ALTER TYPE public.followup_area ADD VALUE IF NOT EXISTS 'investigacion';
ALTER TYPE public.followup_area ADD VALUE IF NOT EXISTS 'innovacion';
ALTER TYPE public.followup_area ADD VALUE IF NOT EXISTS 'emprendimiento';

ALTER TABLE public.allies ADD COLUMN IF NOT EXISTS decanatura text;
