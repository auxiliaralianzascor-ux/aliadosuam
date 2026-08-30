CREATE TABLE IF NOT EXISTS public.user_indicator_profiles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction = ANY (ARRAY['alianzas','investigacion','decanaturas','proyeccion','relaciones_internacionales'])),
  profile text NOT NULL CHECK (profile IN ('verificador', 'cargador')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, direction, profile)
);

GRANT SELECT ON public.user_indicator_profiles TO authenticated;
GRANT ALL ON public.user_indicator_profiles TO service_role;
ALTER TABLE public.user_indicator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_indicator_profiles_select_self" ON public.user_indicator_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "user_indicator_profiles_admin_manage" ON public.user_indicator_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
