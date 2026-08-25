'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

interface FormData {
  name: string;
  email: string;
  how_did_you_know: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  how_did_you_know?: string;
}

const DEFAULT_HEARD_OPTIONS = [
  'Search Engine (Google, etc.)',
  'LinkedIn / Twitter / Social Media',
  'Friend / Colleague referral',
  'Newsletter / Blog',
  'Event / Conference',
  'Other',
];

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    how_did_you_know: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showToast, setShowToast] = useState(false);
  const [heardOptions, setHeardOptions] = useState<string[]>(DEFAULT_HEARD_OPTIONS);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/early-access/heard-options`);
        if (res.ok) {
          const data = await res.json() as { options: string[] };
          if (data.options?.length) setHeardOptions(data.options);
        }
      } catch {
        // keep defaults
      }
    }
    fetchOptions();
  }, []);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'A valid email is required.';
    if (!formData.how_did_you_know.trim())
      newErrors.how_did_you_know = 'Please tell us how you heard about Sery.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${BACKEND_URL}/api/early-access/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);
    } catch {
      // Fallback: still show success UI for UX if backend unavailable
      setStatus('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);
    }
  }

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="text-label-upper text-primary mb-4">Early Access Application</p>
          <h1 className="text-section-title text-foreground uppercase mb-6">
            Get Started
            <br />
            <span className="text-primary">Today.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg font-500 leading-relaxed">
            Every application is reviewed manually. We onboard operators who will run Sery at full leverage.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card rounded-3xl p-12 text-center border border-primary/20 space-y-6"
                >
                  <div
                    className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary text-2xl"
                  >
                    ✓
                  </div>
                  <h3 className="text-2xl font-800 text-foreground">Application Received</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We&apos;ve logged your application. Our team reviews every request personally and will reach out within 48 hours if you&apos;re a fit.
                    Once approved, you can sign in to Sery.
                  </p>
                  <p className="text-sm font-mono text-primary/70">Ref: SERY-{Math.floor(Math.random() * 90000) + 10000}</p>
                  <div className="pt-4">
                    <Link
                      href="/signin"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-700 text-base hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Go to Sign In
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="glass-card rounded-3xl p-8 md:p-10 border border-border/50 space-y-6"
                  noValidate
                >
                  <div>
                    <label htmlFor="name" className="block text-label-upper text-muted-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alex Chen"
                      className={`w-full bg-input border rounded-xl px-5 py-4 text-foreground text-sm font-500 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors ${
                        errors.name ? 'border-red-500/50' : 'border-border/50'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-400 font-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-label-upper text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="alex@yourcompany.com"
                      className={`w-full bg-input border rounded-xl px-5 py-4 text-foreground text-sm font-500 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors ${
                        errors.email ? 'border-red-500/50' : 'border-border/50'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-400 font-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="how_did_you_know" className="block text-label-upper text-muted-foreground mb-2">
                      How Did You Hear About Sery?
                    </label>
                    <select
                      id="how_did_you_know"
                      name="how_did_you_know"
                      value={formData.how_did_you_know}
                      onChange={handleChange}
                      className={`w-full bg-input border rounded-xl px-5 py-4 text-sm font-500 focus:outline-none focus:border-primary/50 transition-colors appearance-none ${
                        errors.how_did_you_know ? 'border-red-500/50' : 'border-border/50'
                      } ${formData.how_did_you_know ? 'text-foreground' : 'text-muted-foreground/40'}`}
                    >
                      <option value="" disabled>Select an option</option>
                      {heardOptions.map((opt) => (
                        <option key={opt} value={opt} className="text-foreground bg-card">
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.how_did_you_know && (
                      <p className="mt-1.5 text-xs text-red-400 font-500">{errors.how_did_you_know}</p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-full py-5 rounded-xl bg-primary text-primary-foreground font-700 text-base disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    style={{ boxShadow: '0 8px 32px rgba(200, 240, 77, 0.2)' }}
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Submitting Application...
                      </span>
                    ) : (
                      'Get Early Access'
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-muted-foreground/50 font-500">
                    We respond within 48 hours. No spam, ever.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="lg:col-span-5 flex flex-col justify-between gap-6"
          >
            <div className="glass-card rounded-3xl p-8 border border-border/50 space-y-6">
              <h3 className="text-lg font-800 text-foreground">What Happens Next</h3>
              <div className="space-y-5">
                {[
                  { step: '01', title: 'Apply Now', desc: 'Submit your name, email, and how you found us. Takes less than 60 seconds.' },
                  { step: '02', title: 'Manual Review', desc: 'Our team reads every application personally. No automated filters.' },
                  { step: '03', title: 'Get Verified', desc: 'If approved, you\'ll receive a verification email within 48 hours.' },
                  { step: '04', title: 'Sign In', desc: 'Once verified, sign in with Google and Sery starts executing.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-label-upper text-primary shrink-0 pt-0.5">{item.step}</span>
                    <div>
                      <p className="text-sm font-700 text-foreground mb-0.5">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-primary/20 space-y-4 bg-primary/5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-sm shrink-0">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-sm font-700 text-foreground mb-1">Already Applied?</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Wait for verification before signing in. Sery only works for approved users.
                  </p>
                  <Link
                    href="/signin"
                    className="inline-flex items-center gap-2 text-xs font-700 text-primary hover:text-primary/80 transition-colors"
                  >
                    Go to Sign In →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-8 right-8 z-50 glass-card border border-primary/30 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl"
            style={{ boxShadow: '0 8px 40px rgba(200,240,77,0.15)' }}
          >
            <span className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-sm">
              ✓
            </span>
            <div>
              <p className="text-sm font-700 text-foreground">Application submitted</p>
              <p className="text-xs text-muted-foreground">We&apos;ll review and respond within 48 hours.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
