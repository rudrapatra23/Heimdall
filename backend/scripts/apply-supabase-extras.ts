/**
 * Applies the Supabase-specific migration (triggers + auth.users FK)
 * using the Supabase Management API.
 *
 * Run once: bun run scripts/apply-supabase-extras.ts
 *
 * Requires: SUPABASE_ACCESS_TOKEN in env (from supabase.com → Account → Access Tokens)
 *           SUPABASE_PROJECT_REF (the project ref, e.g. icberidtctvqyxjmdoop)
 */

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? 'icberidtctvqyxjmdoop';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ Set SUPABASE_ACCESS_TOKEN in your .env');
  console.error('   Get it from: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

// These SQL statements need to run in Supabase context (access to auth.*)
// We send them via the Management API's /query endpoint
const sql = `
-- 1. profiles.id → auth.users(id) FK
-- Postgres has no ADD CONSTRAINT IF NOT EXISTS, so guard with a catalog check.
-- Otherwise this statement errors and aborts the whole batch, leaving the
-- handle_new_user trigger below uninstalled (the FK-violation root cause).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_auth_users_fk'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_auth_users_fk
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Apply updated_at trigger to profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Apply updated_at trigger to gmail_credentials
DROP TRIGGER IF EXISTS set_gmail_credentials_updated_at ON public.gmail_credentials;
CREATE TRIGGER set_gmail_credentials_updated_at
  BEFORE UPDATE ON public.gmail_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Auto-create profile row on new Supabase Auth sign-up
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

-- 6. Backfill profiles for existing auth.users created before the trigger existed
INSERT INTO public.profiles (id, email, full_name)
SELECT u.id, u.email, u.raw_user_meta_data->>'full_name'
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;
`;

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  }
);

const body = await res.json();
if (!res.ok) {
  console.error('❌ API error:', JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log('✅ Supabase extras applied successfully');
console.log('   - profiles → auth.users FK');
console.log('   - set_updated_at triggers (profiles, gmail_credentials)');
console.log('   - handle_new_user trigger (auth.users INSERT)');
console.log('   - backfilled profiles for pre-existing auth.users');
