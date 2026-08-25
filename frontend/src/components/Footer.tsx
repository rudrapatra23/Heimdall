import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Pattern 3: Vercel Horizontal Flow */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <AppLogo size={28} />
            <span className="font-sans font-700 text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
              Sery
            </span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-1 flex-wrap justify-center">
            {[
              { label: 'Product', href: '/' },
              { label: 'Contact', href: '/contact' },
              { label: 'Terms', href: '/terms-and-conditions' },
            ]?.map((link, i, arr) => (
              <React.Fragment key={link?.href}>
                <Link
                  href={link?.href}
                  className="text-sm font-500 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 min-h-[44px] flex items-center"
                >
                  {link?.label}
                </Link>
                {i < arr?.length - 1 && (
                  <span className="text-border text-xs select-none">·</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm font-500 text-muted-foreground">
            © 2026 Sery AI, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}