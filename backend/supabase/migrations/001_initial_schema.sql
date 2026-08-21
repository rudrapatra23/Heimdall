-- ============================================================
-- Heimdall: Supabase-specific additions
-- Run AFTER Drizzle's generated migration (0000_living_inertia.sql)
--
-- Drizzle Kit manages table DDL (CREATE TABLE, indexes, FKs).
-- This file adds what Drizzle cannot generate:
--   1. FK from profiles.id → auth.users.id
--   2. Auto-create-profile trigger on auth.users INSERT
--   3. updated_at auto-trigger
--   4. Row Level Security policies
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. profiles.id → auth.users(id) FK
--    (Drizzle doesn't know about the auth schema)
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_auth_users_fk
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────
-- 2. updated_at auto-trigger
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_gmail_credentials_updated_at
  BEFORE UPDATE ON public.gmail_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────
-- 3. Auto-create profile row when a user signs up via Supabase Auth
-- ──────────────────────────────────────────────────────────
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────────────────
-- 4. Row Level Security
-- ──────────────────────────────────────────────────────────

-- profiles: users read/update only their own row.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- telegram_link_tokens & gmail_credentials: backend (service role) only.
-- No client-facing policies → anon/authenticated roles have no access.
ALTER TABLE public.telegram_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_credentials    ENABLE ROW LEVEL SECURITY;
