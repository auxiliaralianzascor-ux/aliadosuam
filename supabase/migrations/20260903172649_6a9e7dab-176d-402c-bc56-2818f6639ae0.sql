CREATE OR REPLACE VIEW public.v_indicator_progress
WITH (security_invoker = on) AS
WITH years AS (
  SELECT generate_series(2024, 2030) AS year
),
auto_values AS (
  SELECT 'nuevos_aliados'::text AS indicator_key,
         y.year,
         count(a.id)::numeric AS value
  FROM years y
  LEFT JOIN public.allies a
    ON a.status = 'active'::public.ally_status
   AND (a.direction = 'alianzas'
        OR 'alianzas' = ANY (COALESCE(a.shared_with_directions, '{}'::text[])))
   AND EXTRACT(YEAR FROM COALESCE(a.valid_from, a.created_at::date)) = y.year
  GROUP BY y.year
)
SELECT si.key AS indicator_key,
       si.label,
       si.objetivo,
       si.programa,
       si.direction_hint,
       t.year,
       t.target_value,
       COALESCE(sum(c.value), 0::numeric) + COALESCE(max(av.value), 0::numeric) AS actual_value
FROM public.strategic_indicators si
LEFT JOIN public.strategic_indicator_yearly_targets t ON t.indicator_key = si.key
LEFT JOIN public.ally_indicator_contributions c ON c.indicator_key = si.key AND c.period_year = t.year
LEFT JOIN auto_values av ON av.indicator_key = si.key AND av.year = t.year
GROUP BY si.key, si.label, si.objetivo, si.programa, si.direction_hint, t.year, t.target_value;

GRANT SELECT ON public.v_indicator_progress TO authenticated;