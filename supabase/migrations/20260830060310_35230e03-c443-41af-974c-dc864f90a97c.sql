DROP POLICY IF EXISTS "contributions_write_scoped" ON public.ally_indicator_contributions;
CREATE POLICY "contributions_write_scoped" ON public.ally_indicator_contributions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_indicator_contributions.ally_id
        AND public.has_direction(auth.uid(), al.direction)
        AND EXISTS (
          SELECT 1 FROM public.user_indicator_profiles uip
          WHERE uip.user_id = auth.uid()
            AND uip.direction = al.direction
            AND uip.profile = 'cargador'
        )
    )
  );

DROP POLICY IF EXISTS "contributions_update_scoped" ON public.ally_indicator_contributions;
CREATE POLICY "contributions_update_scoped" ON public.ally_indicator_contributions
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_indicator_contributions.ally_id
        AND public.has_direction(auth.uid(), al.direction)
        AND EXISTS (
          SELECT 1 FROM public.user_indicator_profiles uip
          WHERE uip.user_id = auth.uid()
            AND uip.direction = al.direction
            AND uip.profile = 'cargador'
        )
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_indicator_contributions.ally_id
        AND public.has_direction(auth.uid(), al.direction)
        AND EXISTS (
          SELECT 1 FROM public.user_indicator_profiles uip
          WHERE uip.user_id = auth.uid()
            AND uip.direction = al.direction
            AND uip.profile = 'cargador'
        )
    )
  );