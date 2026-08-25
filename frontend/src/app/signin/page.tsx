'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { signInWithGoogle, checkEarlyAccessStatus } from '@/lib/auth';
import AppLogo from '@/components/ui/AppLogo';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="blob-accent absolute top-[-20%] left-[10%] w-[600px] h-[600px] opacity-40" />
        <div className="blob-secondary absolute top-[30%] right-[-10%] w-[500px] h-[500px] opacity-30" />
      </div>

      <div className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <Link
            href="/"
            className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-card/80 border border-border/50 px-3.5 py-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <div className="glass-card rounded-3xl border border-border/50 overflow-hidden p-2">
              <div className="text-center space-y-4 pt-10 pb-6 px-8">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                  <AppLogo size={28} />
                </div>
                <div>
                  <h1 className="font-sans font-800 text-3xl text-foreground tracking-tight">
                    Welcome Back
                  </h1>
                  <p className="text-muted-foreground text-sm mt-2 font-500">
                    Sign in to your Sery account to get started.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 px-8 pb-10">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-800 text-foreground mb-1">
                        ⚠️ Sign In Only After Verification
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your Sery will <span className="text-primary font-700">only work</span> if you log in after verification. Don&apos;t sign in if you did not apply for early access before.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.99 } : {}}
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary text-primary-foreground py-4 font-700 text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                  style={{ boxShadow: '0 8px 32px rgba(200, 240, 77, 0.2)' }}
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Connecting to Google...
                    </span>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </>
                  )}
                </motion.button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card/0 px-4 text-[11px] font-600 text-muted-foreground/60 uppercase tracking-widest">
                      Not Applied Yet?
                    </span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border text-foreground py-4 font-600 text-sm hover:border-primary/40 hover:text-primary transition-all"
                >
                  <span>Apply for Early Access First</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>

                <div className="text-center space-y-2 pt-2 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                    By continuing, you agree to Sery&apos;s{' '}
                    <Link
                      href="/terms-and-conditions"
                      className="text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Terms &amp; Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/terms-and-conditions"
                      className="text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Privacy Policy
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
