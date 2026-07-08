
-- Tighten discounts SELECT policy: only users with a role can read
DROP POLICY IF EXISTS "Authenticated can read discounts" ON public.ally_discounts;
CREATE POLICY "ally_discounts_select_any_role" ON public.ally_discounts
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));

-- Expand direction check to include all current directions
ALTER TABLE public.allies DROP CONSTRAINT IF EXISTS allies_direction_check;
ALTER TABLE public.allies ADD CONSTRAINT allies_direction_check
  CHECK (direction = ANY (ARRAY['alianzas','investigacion','decanaturas','proyeccion','relaciones-internacionales']));
