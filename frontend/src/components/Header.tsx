'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import AppLogo from '@/components/ui/AppLogo';

export default function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  // null = still resolving the session; render the signed-out CTAs until known.
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthed(!!data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) setAuthed(!!session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push('/');
    } catch {
      // ignore — the auth listener will keep state in sync
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border/50 bg-background/90 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <AppLogo size={28} />
          <span className="font-sans font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
            Sery
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Why Sery
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Contact Us
          </Link>
        </nav>

        {/* CTA Group */}
        <div className="flex items-center gap-3">
          {authed ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4" />
                Account
              </Link>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg border border-border text-foreground text-sm font-semibold hover:border-red-500/40 hover:text-red-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg border border-border text-foreground text-sm font-semibold hover:border-primary/40 hover:text-primary transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Sign In
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Get Early Access
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
