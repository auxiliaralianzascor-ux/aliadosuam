CREATE TABLE IF NOT EXISTS public.strategic_indicators (
  key text PRIMARY KEY,
  objetivo text NOT NULL,
  programa text NOT NULL,
  label text NOT NULL,
  unit text NOT NULL,
  meta_2030 numeric,
  meta_2030_nota text,
  direction_hint text CHECK (direction_hint = ANY (ARRAY['alianzas','investigacion','decanaturas','proyeccion','relaciones_internacionales']) OR direction_hint IS NULL)
);

GRANT SELECT ON public.strategic_indicators TO authenticated;
GRANT ALL ON public.strategic_indicators TO service_role;
ALTER TABLE public.strategic_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "strategic_indicators_select_any_role" ON public.strategic_indicators
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "strategic_indicators_admin_manage" ON public.strategic_indicators
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.strategic_indicators (key, objetivo, programa, label, unit, meta_2030, meta_2030_nota, direction_hint) VALUES
  ('nuevos_programas',            'OE1', '1. Aprendizaje para la vida (PAV)',            'Nuevos programas',                                                              'numero',      180,            NULL, 'decanaturas'),
  ('nuevos_estudiantes',          'OE1', '1. Aprendizaje para la vida (PAV)',            'Nuevos estudiantes',                                                            'numero',      18905,          NULL, 'decanaturas'),
  ('proyectos_cti_cofinanciados', 'OE2', '2. INNOVA UAM',                                'Número de proyectos en CTI+E desarrollados con cofinanciación externa',        'numero',      93,             'Aumento del 20% año', 'investigacion'),
  ('productos_servicios_cti',     'OE2', '2. INNOVA UAM',                                'Número de productos y servicios en CTI+E transferidos',                        'numero',      151,            'Aumento del 30% año', 'investigacion'),
  ('ingresos_cti',                'OE2', '2. INNOVA UAM',                                'Ingresos generados por actividades de Ciencia, Tecnología, Innovación y Emprendimiento (CTI+E)', 'moneda_cop', 19530320060, 'Crecer 20% año después de inflación', 'investigacion'),
  ('ingresos_fundraising',        'OE3', '3. Aliados UAM',                               'Ingresos generados por gestión de recursos externos para apalancar las funciones misionales (fundraising)', 'moneda_cop', 10170000000, 'Tabla pág. 56 dice $10.170.000 (probable error de digitación); gráfico pág. 58 muestra $10.170.000.000. Validar con Planeación Institucional.', 'alianzas'),
  ('nuevos_aliados',              'OE3', '3. Aliados UAM',                               'Incremento de las alianzas estratégicas interinstitucionales nacionales e internacionales que generen valor compartido', 'numero', 150, NULL, 'alianzas'),
  ('aumento_ingresos_uam',        'OE4', '4. Bien-Estar para la sostenibilidad',         'Aumento en ingresos UAM (variación porcentual positiva de ingresos por año)',   'moneda_cop',  59812055064,    '55.68% crecimiento anual', NULL),
  ('indice_crecimiento_humano',   'OE4', '4. Bien-Estar para la sostenibilidad',         'Variación anual del índice de crecimiento humano',                             'porcentaje',  8,              'Crecimiento acumulado; línea base se fija con medición 2024', NULL),
  ('indice_huella_ambiental',     'OE4', '4. Bien-Estar para la sostenibilidad',         'Variación anual del índice de huella ambiental',                               'porcentaje',  -8,             'Decrecimiento acumulado; línea base se fija con medición 2024', NULL)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.strategic_indicator_yearly_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_key text NOT NULL REFERENCES public.strategic_indicators(key) ON DELETE CASCADE,
  year int NOT NULL CHECK (year BETWEEN 2024 AND 2030),
  target_value numeric NOT NULL,
  UNIQUE (indicator_key, year)
);
GRANT SELECT ON public.strategic_indicator_yearly_targets TO authenticated;
GRANT ALL ON public.strategic_indicator_yearly_targets TO service_role;
ALTER TABLE public.strategic_indicator_yearly_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "yearly_targets_select_any_role" ON public.strategic_indicator_yearly_targets
  FOR SELECT TO authenticated 
  USING (true);
CREATE POLICY "yearly_targets_admin_manage" ON public.strategic_indicator_yearly_targets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.strategic_indicator_yearly_targets (indicator_key, year, target_value) VALUES
  ('nuevos_programas', 2024, 10), ('nuevos_programas', 2025, 20), ('nuevos_programas', 2026, 30), ('nuevos_programas', 2027, 50), ('nuevos_programas', 2028, 80), ('nuevos_programas', 2029, 110), ('nuevos_programas', 2030, 180),
  ('nuevos_estudiantes', 2024, 450), ('nuevos_estudiantes', 2025, 1300), ('nuevos_estudiantes', 2026, 7300), ('nuevos_estudiantes', 2027, 10800), ('nuevos_estudiantes', 2028, 13200), ('nuevos_estudiantes', 2029, 16400), ('nuevos_estudiantes', 2030, 18905),
  ('proyectos_cti_cofinanciados', 2024, 31), ('proyectos_cti_cofinanciados', 2025, 37), ('proyectos_cti_cofinanciados', 2026, 45), ('proyectos_cti_cofinanciados', 2027, 54), ('proyectos_cti_cofinanciados', 2028, 65), ('proyectos_cti_cofinanciados', 2029, 78), ('proyectos_cti_cofinanciados', 2030, 93),
  ('productos_servicios_cti', 2024, 31), ('productos_servicios_cti', 2025, 41), ('productos_servicios_cti', 2026, 53), ('productos_servicios_cti', 2027, 69), ('productos_servicios_cti', 2028, 89), ('productos_servicios_cti', 2029, 116), ('productos_servicios_cti', 2030, 151),
  ('ingresos_cti', 2024, 3899984640), ('ingresos_cti', 2025, 5101179909), ('ingresos_cti', 2026, 6672343321), ('ingresos_cti', 2027, 8727425064), ('ingresos_cti', 2028, 11415471984), ('ingresos_cti', 2029, 14931437355), ('ingresos_cti', 2030, 19530320060),
  ('ingresos_fundraising', 2024, 443500000), ('ingresos_fundraising', 2025, 784000000), ('ingresos_fundraising', 2026, 2528500000), ('ingresos_fundraising', 2027, 4000500000), ('ingresos_fundraising', 2028, 5472500000), ('ingresos_fundraising', 2029, 7499500000), ('ingresos_fundraising', 2030, 10170000000),
  ('nuevos_aliados', 2024, 15), ('nuevos_aliados', 2025, 30), ('nuevos_aliados', 2026, 50), ('nuevos_aliados', 2027, 70), ('nuevos_aliados', 2028, 95), ('nuevos_aliados', 2029, 120), ('nuevos_aliados', 2030, 150),
  ('aumento_ingresos_uam', 2024, 4199984640), ('aumento_ingresos_uam', 2025, 6538956086.02), ('aumento_ingresos_uam', 2026, 10180500730.32), ('aumento_ingresos_uam', 2027, 15850021587.03), ('aumento_ingresos_uam', 2028, 24676898608.85), ('aumento_ingresos_uam', 2029, 38419463444.12), ('aumento_ingresos_uam', 2030, 59812055064.00),
  ('indice_crecimiento_humano', 2024, 1), ('indice_crecimiento_humano', 2025, 3), ('indice_crecimiento_humano', 2026, 4), ('indice_crecimiento_humano', 2027, 5), ('indice_crecimiento_humano', 2028, 6), ('indice_crecimiento_humano', 2029, 7), ('indice_crecimiento_humano', 2030, 8),
  ('indice_huella_ambiental', 2024, 8), ('indice_huella_ambiental', 2025, 7), ('indice_huella_ambiental', 2026, 6), ('indice_huella_ambiental', 2027, 5), ('indice_huella_ambiental', 2028, 4), ('indice_huella_ambiental', 2029, 2), ('indice_huella_ambiental', 2030, 1)
ON CONFLICT (indicator_key, year) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.ally_indicator_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ally_id uuid NOT NULL REFERENCES public.allies(id) ON DELETE CASCADE,
  indicator_key text NOT NULL REFERENCES public.strategic_indicators(key),
  proyecto_estrategico text,
  period_year int NOT NULL CHECK (period_year BETWEEN 2024 AND 2030),
  value numeric NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ally_indicator_contributions TO authenticated;
GRANT ALL ON public.ally_indicator_contributions TO service_role;
ALTER TABLE public.ally_indicator_contributions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS ally_indicator_contributions_ally_idx ON public.ally_indicator_contributions(ally_id);
CREATE INDEX IF NOT EXISTS ally_indicator_contributions_key_idx ON public.ally_indicator_contributions(indicator_key);

CREATE POLICY "contributions_select_scoped" ON public.ally_indicator_contributions
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_indicator_contributions.ally_id
        AND (al.created_by = auth.uid() OR public.has_direction(auth.uid(), al.direction))
    )
  );

CREATE POLICY "contributions_write_scoped" ON public.ally_indicator_contributions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_indicator_contributions.ally_id
        AND public.has_direction(auth.uid(), al.direction)
    )
  );

CREATE POLICY "contributions_update_scoped" ON public.ally_indicator_contributions
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_indicator_contributions.ally_id
        AND public.has_direction(auth.uid(), al.direction)
    )
  );

CREATE POLICY "contributions_delete_admin" ON public.ally_indicator_contributions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_contributions_updated BEFORE UPDATE ON public.ally_indicator_contributions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE VIEW public.v_indicator_progress AS
SELECT
  si.key AS indicator_key,
  si.label,
  si.objetivo,
  si.programa,
  si.direction_hint,
  t.year,
  t.target_value,
  COALESCE(SUM(c.value), 0) AS actual_value
FROM public.strategic_indicators si
LEFT JOIN public.strategic_indicator_yearly_targets t ON t.indicator_key = si.key
LEFT JOIN public.ally_indicator_contributions c
  ON c.indicator_key = si.key AND c.period_year = t.year
GROUP BY si.key, si.label, si.objetivo, si.programa, si.direction_hint, t.year, t.target_value;

GRANT SELECT ON public.v_indicator_progress TO authenticated;