'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, CheckCircle2, ArrowRight, Loader2,
  Mail, User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  saveProfile,
  resolveAuthState,
} from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import AppLogo from '@/components/ui/AppLogo';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '@/lib/auth';

// ── Phone formatter ──────────────────────────────────────────────────────────
function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length <= 5) return d;
  if (d.length <= 10) return `${d.slice(0, 5)} ${d.slice(5)}`;
  return `${d.slice(0, 5)} ${d.slice(5, 10)} ${d.slice(10, 15)}`;
}

// ── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ['Phone', 'Identity'];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  done
                    ? 'bg-primary/20 border-primary/50'
                    : active
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/30'
                    : 'bg-border/30 border-border/50'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <span
                    className={`text-[10px] font-800 ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-700 uppercase tracking-widest transition-colors ${
                  done
                    ? 'text-primary'
                    : active
                    ? 'text-foreground'
                    : 'text-muted-foreground/50'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 mb-5 transition-all duration-500 ${
                  i < current ? 'bg-primary/40' : 'bg-border/40'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── STEP 0 — Phone ───────────────────────────────────────────────────────────
function PhoneStep({
  session,
  user,
  onDone,
}: {
  session: Session;
  user: SupabaseUser;
  onDone: (profile: Profile) => void;
}) {
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      setError('Please enter a valid phone number (7-15 digits).');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const full_name =
        user.user_metadata?.full_name ?? user.email ?? 'User';
      const profile = await saveProfile(session, {
        phone_number: `${countryCode}${digits}`,
        full_name,
      });
      toast({
        title: 'Phone saved!',
        description: 'Your number has been stored securely.',
        variant: 'success',
      });
      onDone(profile);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save. Please try again.';
      setError(msg);
      toast({ title: 'Error', description: msg, variant: 'error' });
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      key="phone-step"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <h2 className="font-800 text-2xl text-foreground tracking-tight">
          Add your phone
        </h2>
        <p className="text-muted-foreground text-sm mt-1.5 font-500">
          Used to verify your identity when you access the Sery bot.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-700 text-muted-foreground uppercase tracking-widest">
          Phone Number
        </label>
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="shrink-0 rounded-xl border border-border/60 bg-background text-foreground text-sm font-600 px-3 py-3 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
            style={{ minWidth: '92px', colorScheme: 'dark' }}
            aria-label="Country code"
          >
            <option value="+91">IN +91</option>
            <option value="+1">US +1</option>
            <option value="+44">GB +44</option>
            <option value="+61">AU +61</option>
            <option value="+65">SG +65</option>
            <option value="+971">AE +971</option>
            <option value="+49">DE +49</option>
            <option value="+33">FR +33</option>
            <option value="+81">JP +81</option>
            <option value="+86">CN +86</option>
            <option value="+82">KR +82</option>
            <option value="+55">BR +55</option>
            <option value="+52">MX +52</option>
            <option value="+92">PK +92</option>
            <option value="+880">BD +880</option>
          </select>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            value={formatPhoneDisplay(phone)}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, '').slice(0, 15));
              setError(null);
            }}
            className="flex-1 rounded-xl border border-border/60 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm font-500 px-4 py-3 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
            style={{ colorScheme: 'dark' }}
            autoFocus
            required
          />
        </div>
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed pl-1">
          Stored in E.164 format. Not shared publicly.
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={submitting || phone.replace(/\D/g, '').length < 7}
        whileHover={!submitting ? { scale: 1.01 } : {}}
        whileTap={!submitting ? { scale: 0.99 } : {}}
        className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary text-primary-foreground py-4 font-700 text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
        style={{ boxShadow: '0 8px 32px rgba(200, 240, 77, 0.2)' }}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.form>
  );
}

// ── STEP 1 — Identity card ───────────────────────────────────────────────────
function IdentityStep({
  user,
  profile,
  onNext,
}: {
  user: SupabaseUser;
  profile: Profile;
  onNext: () => void;
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
    <motion.div
      key="identity-step"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-800 text-2xl text-foreground tracking-tight">
          Your identity
        </h2>
        <p className="text-muted-foreground text-sm mt-1.5 font-500">
          This is how Sery knows who you are across Gmail, Calendar, and Telegram.
        </p>
      </div>

      {/* Avatar + identity card */}
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
            <span className="text-[10px] font-700 text-primary">Verified</span>
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

      <motion.button
        onClick={onNext}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary text-primary-foreground py-4 font-700 text-sm shadow-lg hover:bg-primary/90 transition-all"
        style={{ boxShadow: '0 8px 32px rgba(200, 240, 77, 0.2)' }}
      >
        Enter dashboard
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

// ── Root page ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.replace('/signin'); return; }
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.replace('/signin'); return; }

      const authState = await resolveAuthState(u, data.session);

      // Phone already verified — Telegram now lives on the dashboard.
      if (authState.state === 'needs_telegram' || authState.state === 'complete') {
        router.replace('/dashboard');
        return;
      }

      setSession(data.session);
      setUser(u);
      setSessionLoading(false);
    });
  }, [router]);

  // Loading skeleton
  if (sessionLoading) {
    return (
      <main className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
          <div className="blob-accent absolute top-[-20%] left-[10%] w-[600px] h-[600px] opacity-40" />
          <div className="blob-secondary absolute top-[30%] right-[-10%] w-[500px] h-[500px] opacity-30" />
        </div>
        <div className="relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  const handlePhoneDone = (savedProfile: Profile) => {
    setProfile(savedProfile);
    setStep(1);
  };

  const handleIdentityFinish = () => {
    toast({
      title: "You're all set!",
      description: 'Welcome to Sery. Opening your dashboard.',
      variant: 'success',
      duration: 3000,
    });
    router.push('/dashboard');
  };

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="blob-accent absolute top-[-20%] left-[10%] w-[600px] h-[600px] opacity-40" />
        <div className="blob-secondary absolute top-[30%] right-[-10%] w-[500px] h-[500px] opacity-30" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-3xl border border-border/50 overflow-hidden p-2">
            <div className="px-8 pt-8 pb-8 space-y-7">

              {/* Logo + header */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <AppLogo size={20} />
                </div>
                <div>
                  <p className="text-xs font-700 text-muted-foreground uppercase tracking-widest">
                    Account Setup
                  </p>
                  <p className="text-sm font-700 text-foreground">
                    Step {step + 1} of {STEPS.length}
                  </p>
                </div>
              </div>

              {/* Step bar */}
              <StepBar current={step} />

              {/* Step content */}
              <AnimatePresence mode="wait">
                {step === 0 && session && user && (
                  <PhoneStep
                    key="phone"
                    session={session}
                    user={user}
                    onDone={handlePhoneDone}
                  />
                )}
                {step === 1 && user && profile && (
                  <IdentityStep
                    key="identity"
                    user={user}
                    profile={profile}
                    onNext={handleIdentityFinish}
                  />
                )}
              </AnimatePresence>

            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
