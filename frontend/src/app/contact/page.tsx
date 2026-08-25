import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/app/contact/components/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply for Access — Sery',
  description: 'Submit your early-access application for Sery. We manually review every request and onboard only high-leverage operators.',
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="blob-accent absolute top-[-10%] right-[5%] w-[500px] h-[500px] opacity-40" />
        <div className="blob-secondary absolute bottom-[10%] left-[5%] w-[400px] h-[400px] opacity-30" />
      </div>
      <div className="relative z-10">
        <Header />
        <ContactForm />
        <Footer />
      </div>
    </main>
  );
}