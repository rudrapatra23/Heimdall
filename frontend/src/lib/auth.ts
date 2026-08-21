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

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
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
const backendUrl = process.env.BUN_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
  const res = await fetch(`${backendUrl}/api/profile`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json() as { profile: Profile | null };
  return data.profile;
}

export async function completeProfile(
  session: Session,
  full_name: string,
  phone_number: string
): Promise<Profile> {
  const backendUrl = process.env.BUN_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
  const res = await fetch(`${backendUrl}/api/profile`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ full_name, phone_number }),
  });
  const data = await res.json() as { profile?: Profile; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to save profile');
  return data.profile!;
}

export async function startTelegramLinking(session: Session): Promise<string> {
    const backendUrl = process.env.BUN_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
  const res = await fetch(`${backendUrl}/api/telegram/link/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  const data = await res.json() as { deep_link?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to generate Telegram link');
  return data.deep_link!;
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
