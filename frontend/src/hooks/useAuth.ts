import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { resolveAuthState, type AuthState } from '@/lib/auth';
import type { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ state: 'loading' });

  const refresh = useCallback(async (user: User | null, session: Session | null) => {
    setAuthState({ state: 'loading' });
    const resolved = await resolveAuthState(user, session);
    setAuthState(resolved);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      const { session } = data;
      if (session) {
        void refresh(session.user, session);
      } else {
        setAuthState({ state: 'unauthenticated' });
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        void refresh(session.user, session);
      } else {
        setAuthState({ state: 'unauthenticated' });
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  return { authState, refresh };
}
