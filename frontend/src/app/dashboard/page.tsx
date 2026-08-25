'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Phone, Mail, User, Send, ExternalLink, RefreshCw,
  CheckCircle2, Loader2, LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  resolveAuthState,
  startTelegramLink,
  getProfile,
  signOut,
} from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import AppLogo from '@/components/ui/AppLogo';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '@/lib/auth';

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
const MAX_POLLS = 40;

// ── User details card ────────────────────────────────────────────────────────
function DetailsCard({
  user,
  profile,
}: {
  user: SupabaseUser;
  profile: Profile;
}) {
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const displayName =
    profile.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'You';

  const fields = [
    {
      icon: <User className="w-3.5 h-3.5 text-muted-foreground" />,
      label: 'Name',
      value: displayName,
    },
    {
      icon: <Mail className="w-3.5 h-3.5 text-muted-foreground" />,
      label: 'Email',
      value: profile.email,
    },
    {
      icon: <Phone className="w-3.5 h-3.5 text-muted-foreground" />,
      label: 'Phone',
      value: profile.phone_number ?? '—',
    },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center gap-3 p-4 border-b border-border/30">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-800 text-base">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <p className="text-sm font-700 text-foreground leading-tight">
            {displayName}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Sery account
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-700 text-primary">
            Verified
          </span>
        </div>
      </div>

      {/* Fields */}
      <div className="divide-y divide-border/20">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-3 px-4 py-3">
            <div className="w-6 flex justify-center">{f.icon}</div>
            <span className="text-[11px] font-600 text-muted-foreground uppercase tracking-widest w-12 shrink-0">
              {f.label}
            </span>
            <span className="text-sm text-foreground font-500 truncate">
              {f.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Telegram card ────────────────────────────────────────────────────────────
function TelegramCard({
  session,
  profile,
  onLinked,
}: {
  session: Session;
  profile: Profile;
  onLinked: (p: Profile) => void;
}) {
  const { toast } = useToast();
  const linked = !!profile.telegram_user_id;

  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const needsGeneratedLink = !linked || !BOT_USERNAME;

  const generate = useCallback(async () => {
    setGenerating(true);

    try {
      const url = await startTelegramLink(session);
      setDeepLink(url);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not generate link.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'error',
      });
    } finally {
      setGenerating(false);
    }
  }, [session, toast]);

  useEffect(() => {
    if (needsGeneratedLink) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;

    setPolling(true);
    attemptsRef.current = 0;

    pollRef.current = setInterval(async () => {
      attemptsRef.current += 1;

      if (attemptsRef.current > MAX_POLLS) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setPolling(false);
        return;
      }

      try {
        const fresh = await getProfile(session);

        if (fresh?.telegram_user_id) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setPolling(false);

          toast({
            title: 'Telegram connected!',
            description: `@${fresh.telegram_username ?? 'your account'} linked successfully.`,
            variant: 'success',
          });

          onLinked(fresh);
        }
      } catch {
        // transient network error — keep polling
      }
    }, 4000);
  }, [session, toast, onLinked]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleConnect = () => {
    if (!deepLink) return;
    window.open(deepLink, '_blank');
    startPolling();
  };

  const openUrl = BOT_USERNAME ? `https://t.me/${BOT_USERNAME}` : deepLink;

  const handleOpenBot = () => {
    if (openUrl) window.open(openUrl, '_blank');
  };

  if (linked) {
    const linkedDate = profile.telegram_linked_at
      ? new Date(profile.telegram_linked_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null;

    return (
      <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border/30">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-primary" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-700 text-foreground leading-tight">
              Telegram
            </p>

            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              @{profile.telegram_username ?? 'connected'}
              {linkedDate ? ` · linked ${linkedDate}` : ''}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-700 text-primary">
              Connected
            </span>
          </div>
        </div>

        <div className="p-4">
          <motion.button
            onClick={handleOpenBot}
            disabled={!openUrl}
            whileHover={openUrl ? { scale: 1.01 } : {}}
            whileTap={openUrl ? { scale: 0.99 } : {}}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary text-primary-foreground py-3.5 font-700 text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
            style={{
              boxShadow: '0 8px 32px rgba(200, 240, 77, 0.2)',
            }}
          >
            <Send className="w-4 h-4" />
            Open Sery on Telegram
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-border/30">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Send className="w-4 h-4 text-primary" />
        </div>

        <div>
          <p className="text-sm font-700 text-foreground leading-tight">
            Connect Telegram
          </p>

          <p className="text-[11px] text-muted-foreground mt-0.5">
            Reach Sery straight from the bot.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2.5">
          {[
            'Click the button to open Telegram.',
            'Send the pre-filled /start command to the bot.',
            'Come back — Sery detects the link automatically.',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-800 text-primary">
                  {i + 1}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>

        <motion.button
          onClick={handleConnect}
          disabled={!deepLink || generating}
          whileHover={deepLink ? { scale: 1.01 } : {}}
          whileTap={deepLink ? { scale: 0.99 } : {}}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary text-primary-foreground py-3.5 font-700 text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
          style={{
            boxShadow: '0 8px 32px rgba(200, 240, 77, 0.2)',
          }}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating link…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Open in Telegram
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </>
          )}
        </motion.button>

        <div className="flex items-center justify-between">
          {polling ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Waiting for Telegram confirmation…
            </div>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate link
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Root page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;

      if (!data.session) {
        router.replace('/signin');
        return;
      }

      const {
        data: { user: u },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!u) {
        router.replace('/signin');
        return;
      }

      const authState = await resolveAuthState(u, data.session);

      if (!mounted) return;

      switch (authState.state) {
        case 'needs_profile':
          router.replace('/onboarding');
          return;

        case 'needs_telegram':
        case 'complete':
          setSession(data.session);
          setUser(u);
          setProfile(authState.profile);
          setLoading(false);
          return;

        default:
          router.replace('/signin');
      }
    });

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to sign out.';

      toast({
        title: 'Error',
        description: msg,
        variant: 'error',
      });

      setSigningOut(false);
    }
  };

  if (loading || !session || !user || !profile) {
    return (
      <main className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
        <div
          className="pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
        >
          <div className="blob-accent absolute top-[-20%] left-[10%] w-[600px] h-[600px] opacity-40" />
          <div className="blob-secondary absolute top-[30%] right-[-10%] w-[500px] h-[500px] opacity-30" />
        </div>

        <div className="relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  const firstName = (
    profile.full_name ??
    user.user_metadata?.full_name ??
    user.email ??
    'there'
  )
    .toString()
    .split(' ')[0];

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        <div className="blob-accent absolute top-[-20%] left-[10%] w-[600px] h-[600px] opacity-40" />
        <div className="blob-secondary absolute top-[30%] right-[-10%] w-[500px] h-[500px] opacity-30" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-border/40 bg-background/60 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <AppLogo size={24} />

            <span className="font-sans font-bold text-base tracking-tight text-foreground">
              Sery
            </span>
          </div>

          {/* Profile + Sign out */}
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={profile.full_name ?? 'Profile'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-800 text-sm">
                {(profile.full_name ?? user.email ?? 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-600 hover:border-primary/40 hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              Sign out
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-md space-y-5"
          >
            <div>
              <h1 className="font-sans font-800 text-3xl text-foreground tracking-tight">
                Welcome, {firstName}
              </h1>

              <p className="text-muted-foreground text-sm mt-1.5 font-500">
                Your Sery account is ready. Connect Telegram to start
                delegating.
              </p>
            </div>

            <DetailsCard user={user} profile={profile} />

            <TelegramCard
              session={session}
              profile={profile}
              onLinked={(p) => setProfile(p)}
            />

            {/* Sign out (secondary, always visible at the bottom) */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border text-muted-foreground py-3.5 font-600 text-sm hover:border-red-500/40 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Sign out
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}