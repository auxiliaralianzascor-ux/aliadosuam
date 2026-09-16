-- Allow the dependency and faculty sections to use the same permission model as top-level directions.
ALTER TABLE public.allies DROP CONSTRAINT IF EXISTS allies_direction_check;
ALTER TABLE public.allies ADD CONSTRAINT allies_direction_check
  CHECK (direction = ANY (ARRAY[
    'alianzas',
    'alianzas_mercadeo',
    'alianzas_econti',
    'alianzas_proyectos',
    'alianzas_graduados',
    'investigacion',
    'relaciones_internacionales',
    'decanaturas',
    'decanatura_salud',
    'decanatura_ingenierias',
    'decanatura_sociales',
    'proyeccion'
  ]));

ALTER TABLE public.user_directions DROP CONSTRAINT IF EXISTS user_directions_direction_check;
ALTER TABLE public.user_directions ADD CONSTRAINT user_directions_direction_check
  CHECK (direction = ANY (ARRAY[
    'alianzas',
    'alianzas_mercadeo',
    'alianzas_econti',
    'alianzas_proyectos',
    'alianzas_graduados',
    'investigacion',
    'relaciones_internacionales',
    'decanaturas',
    'decanatura_salud',
    'decanatura_ingenierias',
    'decanatura_sociales',
    'proyeccion'
  ]));

ALTER TABLE public.user_indicator_profiles DROP CONSTRAINT IF EXISTS user_indicator_profiles_direction_check;
ALTER TABLE public.user_indicator_profiles ADD CONSTRAINT user_indicator_profiles_direction_check
  CHECK (direction = ANY (ARRAY[
    'alianzas',
    'alianzas_mercadeo',
    'alianzas_econti',
    'alianzas_proyectos',
    'alianzas_graduados',
    'investigacion',
    'relaciones_internacionales',
    'decanaturas',
    'decanatura_salud',
    'decanatura_ingenierias',
    'decanatura_sociales',
    'proyeccion'
  ]));
