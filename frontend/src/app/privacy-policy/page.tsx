import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PrivacyContent from '@/app/privacy-policy/components/PrivacyContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Sery',
  description:
    'Privacy Policy explaining how Sery collects, uses, protects, and processes information when you use the autonomous AI operations platform.',
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        <div className="blob-accent absolute top-[-10%] left-[20%] w-[500px] h-[500px] opacity-30" />
        <div className="blob-secondary absolute bottom-[10%] right-[5%] w-[400px] h-[400px] opacity-20" />
      </div>

      <div className="relative z-10">
        <Header />
        <PrivacyContent />
        <Footer />
      </div>
    </main>
  );
}