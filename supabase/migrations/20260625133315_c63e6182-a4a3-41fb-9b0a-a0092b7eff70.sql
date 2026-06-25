
-- 1. Restrict profiles SELECT to own row (hides emails of others)
DROP POLICY IF EXISTS profiles_select_all_auth ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- 2. Role-based access for allies (contact info restricted to approved members)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Backfill: grant 'member' to all existing users so the app keeps working
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'member'::public.app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- Auto-assign 'member' role on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Ensure profile trigger also exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tighten allies SELECT to members only (contact info no longer exposed to any random signup)
DROP POLICY IF EXISTS allies_select_auth ON public.allies;
CREATE POLICY allies_select_members ON public.allies
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'member') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS allies_insert_auth ON public.allies;
CREATE POLICY allies_insert_members ON public.allies
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'member') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS allies_update_auth ON public.allies;
CREATE POLICY allies_update_members ON public.allies
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'member') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS allies_delete_auth ON public.allies;
CREATE POLICY allies_delete_admin ON public.allies
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());

-- Activities follow the same membership rule
DROP POLICY IF EXISTS activities_select_auth ON public.ally_activities;
CREATE POLICY activities_select_members ON public.ally_activities
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'member') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS activities_insert_auth ON public.ally_activities;
CREATE POLICY activities_insert_members ON public.ally_activities
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'member') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS activities_update_auth ON public.ally_activities;
CREATE POLICY activities_update_members ON public.ally_activities
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'member') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS activities_delete_auth ON public.ally_activities;
CREATE POLICY activities_delete_members ON public.ally_activities
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR responsible_id = auth.uid());
