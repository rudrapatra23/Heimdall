import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TermsContent from '@/app/terms-and-conditions/components/TermsContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Sery',
  description: 'Terms and conditions governing your use of Sery, the autonomous AI operations platform.',
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="blob-accent absolute top-[-10%] left-[20%] w-[500px] h-[500px] opacity-30" />
        <div className="blob-secondary absolute bottom-[10%] right-[5%] w-[400px] h-[400px] opacity-20" />
      </div>
      <div className="relative z-10">
        <Header />
        <TermsContent />
        <Footer />
      </div>
    </main>
  );
}
