-- La migración anterior (20260830060000) exigía el perfil "cargador" pero
-- solo lo validaba contra la dirección DUEÑA del aliado (al.direction).
-- Esto dejaba fuera a los aliados COMPARTIDOS: un usuario con perfil
-- "cargador" en una dirección a la que el aliado fue compartido
-- (shared_with_directions) no podía registrar aportes para ese aliado,
-- aunque en la interfaz sí lo viera y lo seleccionara.
--
-- Esta migración amplía la regla de escritura para aceptar también el caso
-- "cargador en una dirección con la que el aliado fue compartido".

DROP POLICY IF EXISTS "contributions_write_scoped" ON public.ally_indicator_contributions;
CREATE POLICY "contributions_write_scoped" ON public.ally_indicator_contributions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_indicator_contributions.ally_id
        AND (
          -- dueño del aliado
          (
            public.has_direction(auth.uid(), al.direction)
            AND EXISTS (
              SELECT 1 FROM public.user_indicator_profiles uip
              WHERE uip.user_id = auth.uid()
                AND uip.direction = al.direction
                AND uip.profile = 'cargador'
            )
          )
          OR
          -- dirección con la que el aliado fue compartido
          EXISTS (
            SELECT 1 FROM unnest(al.shared_with_directions) shared_dir
            WHERE public.has_direction(auth.uid(), shared_dir)
              AND EXISTS (
                SELECT 1 FROM public.user_indicator_profiles uip
                WHERE uip.user_id = auth.uid()
                  AND uip.direction = shared_dir
                  AND uip.profile = 'cargador'
              )
          )
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
        AND (
          (
            public.has_direction(auth.uid(), al.direction)
            AND EXISTS (
              SELECT 1 FROM public.user_indicator_profiles uip
              WHERE uip.user_id = auth.uid()
                AND uip.direction = al.direction
                AND uip.profile = 'cargador'
            )
          )
          OR EXISTS (
            SELECT 1 FROM unnest(al.shared_with_directions) shared_dir
            WHERE public.has_direction(auth.uid(), shared_dir)
              AND EXISTS (
                SELECT 1 FROM public.user_indicator_profiles uip
                WHERE uip.user_id = auth.uid()
                  AND uip.direction = shared_dir
                  AND uip.profile = 'cargador'
              )
          )
        )
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_indicator_contributions.ally_id
        AND (
          (
            public.has_direction(auth.uid(), al.direction)
            AND EXISTS (
              SELECT 1 FROM public.user_indicator_profiles uip
              WHERE uip.user_id = auth.uid()
                AND uip.direction = al.direction
                AND uip.profile = 'cargador'
            )
          )
          OR EXISTS (
            SELECT 1 FROM unnest(al.shared_with_directions) shared_dir
            WHERE public.has_direction(auth.uid(), shared_dir)
              AND EXISTS (
                SELECT 1 FROM public.user_indicator_profiles uip
                WHERE uip.user_id = auth.uid()
                  AND uip.direction = shared_dir
                  AND uip.profile = 'cargador'
              )
          )
        )
    )
  );
