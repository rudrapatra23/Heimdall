'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { resolveAuthState } from '@/lib/auth';
import AppLogo from '@/components/ui/AppLogo';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'storing' | 'done'>('loading');

  useEffect(() => {
    let mounted = true;

    async function storeGmailCredentials(
      session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>
    ) {
      if (session.provider_token && session.provider_refresh_token) {
        try {
          await fetch(`${BACKEND_URL}/api/gmail/store-credentials`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token,
            }),
          });
        } catch (err) {
          console.error('Failed to store Gmail credentials:', err);
        }
      }
    }

    async function finalize(
      session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>
    ) {
      await storeGmailCredentials(session);
      if (!mounted) return;

      setStatus('done');

      // Resolve auth state to decide where to send the user
      const { data: { user } } = await supabase.auth.getUser();
      const authState = await resolveAuthState(user, session);

      if (!mounted) return;

      if (authState.state === 'needs_profile') {
        router.push('/onboarding');
      } else {
        setTimeout(() => {
          router.push('/dashboard');
        }, 300);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session) {
        setStatus('storing');
        finalize(session).catch((err) => {
          console.error('Finalize error:', err);
          if (mounted) setError('Something went wrong. Please try again.');
        });
      } else if (event === 'USER_UPDATED') {
        // no-op
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) {
        setStatus('storing');
        finalize(data.session).catch((err) => {
          console.error('Finalize error:', err);
          if (mounted) setError('Something went wrong. Please try again.');
        });
      }
    });

    const timeout = setTimeout(() => {
      if (!mounted) return;
      setError('Authentication timed out. Please try again.');
    }, 30000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="blob-accent absolute top-[-20%] left-[10%] w-[600px] h-[600px] opacity-40" />
        <div className="blob-secondary absolute top-[30%] right-[-10%] w-[500px] h-[500px] opacity-30" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-3xl border border-border/50 p-2">
            <div className="text-center space-y-6 py-12 px-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <AppLogo size={32} />
              </div>

              <div>
                <h1 className="font-sans font-800 text-2xl text-foreground tracking-tight mb-2">
                  {status === 'loading' && 'Signing you in...'}
                  {status === 'storing' && 'Setting up your account...'}
                  {status === 'done' && 'Welcome to Sery!'}
                </h1>
                <p className="text-muted-foreground text-sm font-500">
                  {status === 'loading' && 'Connecting to your Google account'}
                  {status === 'storing' && 'Syncing Gmail and Calendar credentials'}
                  {status === 'done' && 'Redirecting you...'}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                </div>

                {error && (
                  <div className="w-full text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
                    {error}
                  </div>
                )}
              </div>

              {error && (
                <a
                  href="/signin"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground text-sm font-700 hover:border-primary/40 hover:text-primary transition-all"
                >
                  Back to Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

