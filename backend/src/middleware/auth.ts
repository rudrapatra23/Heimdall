import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { db, profiles } from '../db/index.ts';
import type { Profile } from '../db/schema.ts';

// Supabase anon client — used ONLY for JWT validation (getUser).
// All DB reads go through Drizzle.
const supabaseUrl     = process.env.BUN_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export interface AuthUser {
  id:      string;   // = auth.users.id (Supabase UUID)
  email:   string;
  profile: Profile | null;
}

/**
 * Validates the Bearer JWT from the Authorization header using Supabase's
 * auth.getUser(), then loads the matching profile row via Drizzle.
 *
 * Returns null when the token is missing, invalid, or expired.
 * The caller must check the return value and respond 401 if null.
 */
export async function getCurrentUser(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);

  // Per-request Supabase client carrying the user's own access token.
  // This is the correct way to call auth.getUser() — it validates the JWT
  // against Supabase Auth without needing the service role key.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth:   { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user?.email) return null;

  // Fetch profile via Drizzle (bypasses RLS — Drizzle uses DATABASE_URL
  // with the service-role equivalent connection, not a user-scoped one).
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return {
    id:      user.id,
    email:   user.email,
    profile: profile ?? null,
  };
}

/**
 * Returns a 401 Response if authUser is null, otherwise null.
 * Usage:
 *   const err = requireAuth(authUser);
 *   if (err) return err;
 */
export function requireAuth(authUser: AuthUser | null): Response | null {
  if (!authUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
