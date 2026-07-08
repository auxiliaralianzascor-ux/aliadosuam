
-- Normalize direction value: allow both hyphen and underscore, prefer underscore
UPDATE public.allies SET direction = 'relaciones_internacionales' WHERE direction = 'relaciones-internacionales';
ALTER TABLE public.allies DROP CONSTRAINT IF EXISTS allies_direction_check;
ALTER TABLE public.allies ADD CONSTRAINT allies_direction_check
  CHECK (direction = ANY (ARRAY['alianzas','investigacion','decanaturas','proyeccion','relaciones_internacionales']));

-- User directions table: which directions each user can create/edit allies in
CREATE TABLE IF NOT EXISTS public.user_directions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction = ANY (ARRAY['alianzas','investigacion','decanaturas','proyeccion','relaciones_internacionales'])),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, direction)
);
GRANT SELECT ON public.user_directions TO authenticated;
GRANT ALL ON public.user_directions TO service_role;
ALTER TABLE public.user_directions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_directions_select_self ON public.user_directions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY user_directions_admin_manage ON public.user_directions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Helper function
CREATE OR REPLACE FUNCTION public.has_direction(_user_id uuid, _direction text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_directions
    WHERE user_id = _user_id AND direction = _direction
  )
$$;

-- Relax allies write policies to allow direction editors (not just admins)
DROP POLICY IF EXISTS allies_insert_admin ON public.allies;
DROP POLICY IF EXISTS allies_update_admin ON public.allies;
DROP POLICY IF EXISTS allies_select_scoped ON public.allies;

CREATE POLICY allies_insert_direction ON public.allies
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_direction(auth.uid(), direction)
  );

CREATE POLICY allies_update_direction ON public.allies
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_direction(auth.uid(), direction)
  );

-- Broaden SELECT to include users assigned to that direction
CREATE POLICY allies_select_scoped ON public.allies
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR created_by = auth.uid()
    OR public.has_direction(auth.uid(), direction)
    OR EXISTS (
      SELECT 1 FROM public.ally_activities a
      WHERE a.ally_id = allies.id
        AND public.has_area(auth.uid(), a.area)
    )
  );

-- Also allow direction editors to manage discounts on their allies
DROP POLICY IF EXISTS "Admins manage discounts" ON public.ally_discounts;
CREATE POLICY ally_discounts_manage ON public.ally_discounts
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_discounts.ally_id
        AND public.has_direction(auth.uid(), al.direction)
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_discounts.ally_id
        AND public.has_direction(auth.uid(), al.direction)
    )
  );
