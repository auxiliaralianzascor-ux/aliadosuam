
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Enums
CREATE TYPE public.ally_status AS ENUM ('conversation','pending','active');
CREATE TYPE public.ally_category AS ENUM ('latente','emergente','estrategico','activo');
CREATE TYPE public.traffic_light AS ENUM ('green','yellow','red');
CREATE TYPE public.followup_area AS ENUM ('direccion','econti','mercadeo','graduados','general');

-- Allies table
CREATE TABLE public.allies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT,
  status public.ally_status NOT NULL DEFAULT 'conversation',
  category public.ally_category,
  traffic_light public.traffic_light NOT NULL DEFAULT 'yellow',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  valid_from DATE,
  valid_until DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.allies TO authenticated;
GRANT ALL ON public.allies TO service_role;
ALTER TABLE public.allies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allies_select_auth" ON public.allies FOR SELECT TO authenticated USING (true);
CREATE POLICY "allies_insert_auth" ON public.allies FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "allies_update_auth" ON public.allies FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "allies_delete_auth" ON public.allies FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE INDEX allies_status_idx ON public.allies(status);
CREATE INDEX allies_traffic_light_idx ON public.allies(traffic_light);

-- Activities / follow-ups
CREATE TABLE public.ally_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ally_id UUID NOT NULL REFERENCES public.allies(id) ON DELETE CASCADE,
  area public.followup_area NOT NULL DEFAULT 'general',
  activity_type TEXT NOT NULL DEFAULT 'observacion',
  description TEXT NOT NULL,
  activity_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  responsible_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responsible_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ally_activities TO authenticated;
GRANT ALL ON public.ally_activities TO service_role;
ALTER TABLE public.ally_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_select_auth" ON public.ally_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "activities_insert_auth" ON public.ally_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "activities_update_auth" ON public.ally_activities FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "activities_delete_auth" ON public.ally_activities FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE INDEX activities_ally_idx ON public.ally_activities(ally_id);
CREATE INDEX activities_area_idx ON public.ally_activities(area);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_allies_updated BEFORE UPDATE ON public.allies
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
