
CREATE TABLE public.ally_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ally_id UUID NOT NULL UNIQUE REFERENCES public.allies(id) ON DELETE CASCADE,
  pregrado TEXT,
  posgrado TEXT,
  ingles TEXT,
  econti TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ally_discounts TO authenticated;
GRANT ALL ON public.ally_discounts TO service_role;

ALTER TABLE public.ally_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read discounts"
  ON public.ally_discounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage discounts"
  ON public.ally_discounts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_ally_discounts_updated_at
  BEFORE UPDATE ON public.ally_discounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
