ALTER TABLE public.allies ADD COLUMN IF NOT EXISTS shared_with_directions text[] DEFAULT '{}';

DROP POLICY IF EXISTS allies_select_scoped ON public.allies;
CREATE POLICY allies_select_scoped ON public.allies
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR created_by = auth.uid()
    OR public.has_direction(auth.uid(), direction)
    OR EXISTS (
      SELECT 1 FROM unnest(shared_with_directions) d
      WHERE public.has_direction(auth.uid(), d)
    )
    OR EXISTS (
      SELECT 1 FROM public.ally_activities a
      WHERE a.ally_id = allies.id
        AND public.has_area(auth.uid(), a.area)
    )
  );

DROP POLICY IF EXISTS "activities_insert_area" ON public.ally_activities;
CREATE POLICY "activities_insert_area" ON public.ally_activities
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_area(auth.uid(), area)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_activities.ally_id
      AND EXISTS (
        SELECT 1 FROM unnest(al.shared_with_directions) d
        WHERE public.has_direction(auth.uid(), d)
      )
    )
  );

DROP POLICY IF EXISTS "activities_update_area" ON public.ally_activities;
CREATE POLICY "activities_update_area" ON public.ally_activities
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_area(auth.uid(), area)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_activities.ally_id
      AND EXISTS (
        SELECT 1 FROM unnest(al.shared_with_directions) d
        WHERE public.has_direction(auth.uid(), d)
      )
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_area(auth.uid(), area)
    OR EXISTS (
      SELECT 1 FROM public.allies al
      WHERE al.id = ally_activities.ally_id
      AND EXISTS (
        SELECT 1 FROM unnest(al.shared_with_directions) d
        WHERE public.has_direction(auth.uid(), d)
      )
    )
  );