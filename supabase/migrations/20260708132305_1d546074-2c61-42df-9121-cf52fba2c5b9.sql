
-- Activities: restrict SELECT by area (matches update/delete policy)
DROP POLICY IF EXISTS activities_select_any_role ON public.ally_activities;
CREATE POLICY activities_select_area ON public.ally_activities
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_area(auth.uid(), area)
  );

-- Allies: restrict SELECT to admin, creator, or users with an area assigned
-- to at least one activity on that ally
DROP POLICY IF EXISTS allies_select_any_role ON public.allies;
CREATE POLICY allies_select_scoped ON public.allies
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.ally_activities a
      WHERE a.ally_id = allies.id
        AND public.has_area(auth.uid(), a.area)
    )
  );
