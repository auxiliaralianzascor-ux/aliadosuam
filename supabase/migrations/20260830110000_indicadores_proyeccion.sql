-- Indicador específico de Proyección y vista agregada para mostrar los aliados
-- con estudiantes vinculados a prácticas formativas.

INSERT INTO public.strategic_indicators (
  key,
  objetivo,
  programa,
  label,
  unit,
  meta_2030,
  meta_2030_nota,
  direction_hint
) VALUES (
  'estudiantes_vinculados_practicas_formativas',
  'OE3',
  '3. Aliados UAM',
  'Estudiantes vinculados a prácticas formativas',
  'numero',
  NULL,
  'Indicador de Proyección; se consolida por aportes registrados por aliado y año.',
  'proyeccion'
) ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE VIEW public.v_practicas_por_aliado AS
SELECT
  c.period_year AS year,
  a.id AS ally_id,
  a.name AS ally_name,
  a.direction,
  a.status,
  COALESCE(SUM(c.value), 0) AS estudiantes
FROM public.ally_indicator_contributions c
JOIN public.allies a ON a.id = c.ally_id
WHERE c.indicator_key = 'estudiantes_vinculados_practicas_formativas'
GROUP BY c.period_year, a.id, a.name, a.direction, a.status
ORDER BY c.period_year, a.name;

GRANT SELECT ON public.v_practicas_por_aliado TO authenticated;
