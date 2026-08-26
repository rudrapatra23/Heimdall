'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { resolveAuthState } from '@/lib/auth';
import AppLogo from '@/components/ui/AppLogo';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type CallbackStatus = 'loading' | 'storing' | 'done';

export default function AuthCallbackPage() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<CallbackStatus>('loading');

  useEffect(() => {
    let mounted = true;

    async function storeGmailCredentials(
      session: NonNullable<
        Awaited<ReturnType<typeof supabase.auth.getSession>>
      >['data']['session']
    ) {
      if (!session) return;

      if (
        session.provider_token &&
        session.provider_refresh_token
      ) {
        try {
          const response = await fetch(
            `${BACKEND_URL}/api/gmail/store-credentials`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                access_token: session.provider_token,
                refresh_token: session.provider_refresh_token,
              }),
            }
          );

          if (!response.ok) {
            console.error(
              'Failed to store Gmail credentials:',
              await response.text().catch(() => '')
            );
          }
        } catch (err) {
          console.error(
            'Failed to store Gmail credentials:',
            err
          );
        }
      }
    }

    async function finalize(session: NonNullable<
      Awaited<ReturnType<typeof supabase.auth.getSession>>
    >['data']['session']) {
      if (!session || !mounted) return;

      setStatus('storing');

      await storeGmailCredentials(session);

      if (!mounted) return;

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error('No authenticated user found');
        }

        const authState = await resolveAuthState(user, session);

        if (!mounted) return;

        setStatus('done');

        if (authState.state === 'needs_profile') {
          router.replace('/onboarding');
          return;
        }

        if (authState.state === 'needs_telegram') {
          router.replace('/onboarding');
          return;
        }

        router.replace('/dashboard');
      } catch (err) {
        console.error('Finalize error:', err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Something went wrong. Please try again.'
          );
        }
      }
    }

    async function handleCallback() {
      try {
        /*
         * Supabase OAuth can return a `code` when using the
         * PKCE flow.
         */
        const url = new URL(window.location.href);

        const code = url.searchParams.get('code');
        const oauthError = url.searchParams.get('error');
        const oauthErrorDescription =
          url.searchParams.get('error_description');

        if (oauthError) {
          throw new Error(
            oauthErrorDescription || oauthError
          );
        }

        /*
         * If a code exists, explicitly exchange it for a
         * Supabase session.
         */
        if (code) {
          const {
            data,
            error: exchangeError,
          } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          if (!data.session) {
            throw new Error(
              'Authentication succeeded but no session was created.'
            );
          }

          if (!mounted) return;

          await finalize(data.session);
          return;
        }

        /*
         * Some Supabase OAuth configurations return the
         * session through the URL hash instead.
         *
         * Give Supabase's browser client a moment to restore
         * that session.
         */
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          await finalize(session);
          return;
        }

        /*
         * Supabase may still be processing the OAuth response.
         * Listen for the resulting SIGNED_IN event.
         */
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          async (event, authSession) => {
            if (!mounted) return;

            if (
              (event === 'SIGNED_IN' ||
                event === 'INITIAL_SESSION') &&
              authSession
            ) {
              await finalize(authSession);
            }
          }
        );

        /*
         * Give the client some time to establish the session.
         */
        setTimeout(async () => {
          if (!mounted) return;

          const {
            data: { session: latestSession },
          } = await supabase.auth.getSession();

          if (latestSession) {
            await finalize(latestSession);
          } else {
            setError(
              'Authentication completed, but the session could not be established. Please try again.'
            );
          }
        }, 2000);

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('OAuth callback error:', err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Authentication failed. Please try again.'
          );
        }
      }
    }

    handleCallback();

    const timeout = setTimeout(() => {
      if (!mounted) return;

      setError(
        'Authentication timed out. Please try again.'
      );
    }, 30000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
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
                  {status === 'loading' &&
                    'Signing you in...'}

                  {status === 'storing' &&
                    'Setting up your account...'}

                  {status === 'done' &&
                    'Welcome to Sery!'}
                </h1>

                <p className="text-muted-foreground text-sm font-500">
                  {status === 'loading' &&
                    'Connecting to your Google account'}

                  {status === 'storing' &&
                    'Syncing Gmail and Calendar credentials'}

                  {status === 'done' &&
                    'Redirecting you...'}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {!error && (
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-primary/20" />

                    <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                  </div>
                )}

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