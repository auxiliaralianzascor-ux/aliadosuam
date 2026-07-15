
DROP POLICY IF EXISTS ally_discounts_select_scoped ON public.ally_discounts;
CREATE POLICY ally_discounts_select_scoped ON public.ally_discounts
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR public.has_any_role(auth.uid())
       AND EXISTS (
         SELECT 1 FROM public.allies al
         WHERE al.id = ally_discounts.ally_id
           AND has_direction(auth.uid(), al.direction)
       )
  );

DROP POLICY IF EXISTS user_directions_insert_self ON public.user_directions;
