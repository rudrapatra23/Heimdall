import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  telegram_user_id: string | null;
  telegram_username: string | null;
  telegram_linked_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AuthState =
  | { state: 'loading' }
  | { state: 'unauthenticated' }
  | { state: 'needs_profile'; user: User; session: Session }
  | { state: 'needs_telegram'; user: User; session: Session; profile: Profile }
  | { state: 'complete'; user: User; session: Session; profile: Profile };

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export async function signInWithGoogle(): Promise<void> {
  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'http://localhost:4028/auth/callback';

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      scopes: 'https://mail.google.com/ https://www.googleapis.com/auth/calendar',
      queryParams: { access_type: 'offline', prompt: 'consent' }
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getProfile(session: Session): Promise<Profile | null> {
  const res = await fetch(`${BACKEND_URL}/api/profile`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json() as { profile: Profile | null };
  return data.profile;
}

export async function resolveAuthState(
  user: User | null,
  session: Session | null
): Promise<AuthState> {
  if (!user || !session) return { state: 'unauthenticated' };

  const profile = await getProfile(session);

  if (!profile || !profile.phone_number) {
    return { state: 'needs_profile', user, session };
  }

  if (!profile.telegram_user_id) {
    return { state: 'needs_telegram', user, session, profile };
  }

  return { state: 'complete', user, session, profile };
}

export interface EarlyAccessCheckResult {
  exists: boolean;
  approved: boolean;
  status?: string;
  applied_at?: string;
}

export async function saveProfile(
  session: Session,
  data: { phone_number: string; full_name: string }
): Promise<Profile> {
  const res = await fetch(`${BACKEND_URL}/api/profile`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Failed to save profile');
  }
  const json = await res.json() as { profile: Profile };
  return json.profile;
}

export async function checkEarlyAccessStatus(email: string): Promise<EarlyAccessCheckResult> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/early-access/status?email=${encodeURIComponent(email)}`
    );
    if (!res.ok) return { exists: false, approved: false };
    return await res.json() as EarlyAccessCheckResult;
  } catch {
    return { exists: false, approved: false };
  }
}

// ──────────────────────────────────────────────────────────
// Telegram linking
// ──────────────────────────────────────────────────────────
export async function startTelegramLink(session: Session): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/api/telegram/link/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Failed to generate Telegram link');
  }
  const data = await res.json() as { deep_link: string };
  return data.deep_link;
}
