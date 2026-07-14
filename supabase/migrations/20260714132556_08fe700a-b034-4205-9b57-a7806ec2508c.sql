
-- 1) Scope discount reads to admins or users with the ally's direction
DROP POLICY IF EXISTS ally_discounts_select_any_role ON public.ally_discounts;
CREATE POLICY ally_discounts_select_scoped ON public.ally_discounts
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_discounts.ally_id
        AND has_direction(auth.uid(), al.direction)
    )
  );

-- 2) Revoke EXECUTE from anon/public on SECURITY DEFINER functions;
--    keep authenticated EXECUTE where RLS policies rely on them.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_any_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_area(uuid, followup_area) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_direction(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_area(uuid, followup_area) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_direction(uuid, text) TO authenticated;

-- 3) Add an explicit self-INSERT policy on user_directions so the intended
--    fail-closed workflow is documented; keeps admin-only management for others.
--    (No non-admin path currently inserts, but this makes the policy explicit.)
DROP POLICY IF EXISTS user_directions_insert_self ON public.user_directions;
CREATE POLICY user_directions_insert_self ON public.user_directions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));
