import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase handles the code exchange automatically via onAuthStateChange
    // We just need to wait and then redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Redirect to home — App will pick up the new session
        window.location.href = '/';
      } else if (event === 'SIGNED_OUT') {
        setError('Authentication failed. Please try again.');
      }
    });

    // Also check if there's already a session (e.g., page reload)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <a href="/" className="text-sm underline mt-4 block">Go back</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
