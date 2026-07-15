DROP POLICY IF EXISTS ally_discounts_select_any_direction ON public.ally_discounts;
DROP POLICY IF EXISTS ally_discounts_select ON public.ally_discounts;

CREATE POLICY ally_discounts_select_authenticated
ON public.ally_discounts
FOR SELECT
TO authenticated
USING (true);