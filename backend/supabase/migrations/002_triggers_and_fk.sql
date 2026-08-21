-- ============================================================
-- Paste this into: Supabase Dashboard → SQL Editor → New query
-- Run it once after the Drizzle tables are created.
--
-- What this does:
--   1. Links profiles.id → auth.users.id (cascade delete)
--   2. Adds updated_at auto-trigger to profiles + gmail_credentials  
--   3. Auto-creates a profile row when a user signs up via Google OAuth
-- ============================================================

-- 1. FK: profiles → auth.users
ALTER TABLE public.profiles
  ADD CONSTRAINT IF NOT EXISTS profiles_id_auth_users_fk
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_gmail_credentials_updated_at ON public.gmail_credentials;
CREATE TRIGGER set_gmail_credentials_updated_at
  BEFORE UPDATE ON public.gmail_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Auto-create profile on Google sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
