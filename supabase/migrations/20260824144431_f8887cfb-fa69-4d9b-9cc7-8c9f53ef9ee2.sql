DROP POLICY IF EXISTS "ally_discounts_select_authenticated" ON public.ally_discounts;
DROP POLICY IF EXISTS "ally_discounts_select_scoped" ON public.ally_discounts;
CREATE POLICY "ally_discounts_select_staff" ON public.ally_discounts
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_any_role(auth.uid()));