
-- 1) Tabla de áreas por usuario
CREATE TABLE public.user_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area public.followup_area NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, area)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_areas TO authenticated;
GRANT ALL ON public.user_areas TO service_role;

ALTER TABLE public.user_areas ENABLE ROW LEVEL SECURITY;

-- 2) Helper: ¿el usuario tiene asignada esta área?
CREATE OR REPLACE FUNCTION public.has_area(_user_id uuid, _area public.followup_area)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_areas
    WHERE user_id = _user_id AND area = _area
  )
$$;

-- 3) Helper: ¿el usuario tiene algún rol (admin/member)?
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

-- 4) Políticas user_areas
CREATE POLICY "user_areas_select" ON public.user_areas
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_areas_admin_all" ON public.user_areas
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) Permitir a admins gestionar user_roles
CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6) Permitir a admins ver todos los perfiles (para el panel de usuarios)
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7) Actualizar políticas de aliados:
--    SELECT: cualquier usuario con rol asignado
--    INSERT/UPDATE/DELETE: solo admins
DROP POLICY IF EXISTS allies_select_members ON public.allies;
DROP POLICY IF EXISTS allies_insert_members ON public.allies;
DROP POLICY IF EXISTS allies_update_members ON public.allies;
DROP POLICY IF EXISTS allies_delete_admin   ON public.allies;

CREATE POLICY "allies_select_any_role" ON public.allies
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "allies_insert_admin" ON public.allies
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "allies_update_admin" ON public.allies
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "allies_delete_admin" ON public.allies
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8) Actualizar políticas de seguimientos:
--    SELECT: cualquier usuario con rol
--    INSERT/UPDATE/DELETE: admin O usuario asignado al área
DROP POLICY IF EXISTS activities_select_members ON public.ally_activities;
DROP POLICY IF EXISTS activities_insert_members ON public.ally_activities;
DROP POLICY IF EXISTS activities_update_members ON public.ally_activities;
DROP POLICY IF EXISTS activities_delete_members ON public.ally_activities;

CREATE POLICY "activities_select_any_role" ON public.ally_activities
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "activities_insert_area" ON public.ally_activities
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_area(auth.uid(), area)
  );

CREATE POLICY "activities_update_area" ON public.ally_activities
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_area(auth.uid(), area)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_area(auth.uid(), area)
  );

CREATE POLICY "activities_delete_area" ON public.ally_activities
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_area(auth.uid(), area)
  );
