'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const comparisons = [
  {
    them: 'Switch between Gmail, Calendar, and AI tools',
    us: 'One place — Sery handles the context',
  },
  {
    them: 'Re-explain your situation every session',
    us: 'Sery already knows. No re-entry needed.',
  },
  {
    them: 'AI suggests, you still write and send',
    us: 'Sery drafts, sends, and logs it for you',
  },
  {
    them: 'Generic tone that sounds like ChatGPT',
    us: 'Your voice. Your style. Every time.',
  },
  {
    them: 'No memory of what you did last week',
    us: 'Full history. Always in context.',
  },
];

export default function WhyNotForEveryoneSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section ref={ref} className="py-24 px-6 relative overflow-hidden">
      {/* Background block */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-y-0 right-0 w-1/2 opacity-30"
          style={{ background: 'linear-gradient(to left, rgba(200,240,77,0.04), transparent)' }}
        />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="text-label-upper text-primary mb-4">Why Sery</p>
          <div className="grid md:grid-cols-2 gap-8 items-end">
            <h2 className="text-section-title text-foreground uppercase">
              Still Operating
              <br />
              <span className="text-primary">Your AI?</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed font-500 md:pb-2">
              Switching between Gmail, Calendar, and AI tools to get one thing done
              shouldn&apos;t be your job. Sery understands your context and handles
              the work without making you manage every step.
            </p>
          </div>
        </motion.div>

        {/* Comparison table */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Basic tools */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-card rounded-3xl overflow-hidden border border-border/50"
          >
            <div className="px-8 py-5 border-b border-border/30 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              <span className="text-sm font-700 text-muted-foreground uppercase tracking-widest">
                Without Sery
              </span>
              <span className="ml-auto text-xs text-muted-foreground/50 font-mono">the old way</span>
            </div>
            <div className="divide-y divide-border/20">
              {comparisons?.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="px-8 py-5 flex items-center gap-4"
                >
                  <span className="text-muted-foreground/40 text-lg shrink-0">✗</span>
                  <p className="text-sm font-500 text-muted-foreground">{c?.them}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Sery */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="rounded-3xl overflow-hidden border border-primary/20 relative"
            style={{ background: 'linear-gradient(135deg, rgba(200,240,77,0.06) 0%, rgba(10,10,15,0.8) 60%)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(200,240,77,0.08) 0%, transparent 60%)' }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <div className="px-8 py-5 border-b border-primary/15 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-700 text-primary uppercase tracking-widest">
                  Sery
                </span>
                <span className="ml-auto text-xs text-primary/60 font-mono">with Sery</span>
              </div>
              <div className="divide-y divide-primary/10">
                {comparisons?.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className="px-8 py-5 flex items-center gap-4"
                  >
                    <span className="text-primary text-lg shrink-0">✓</span>
                    <p className="text-sm font-600 text-foreground">{c?.us}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Qualifier statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-12 p-8 rounded-3xl border border-border/30 bg-muted/10 text-center"
        >
          <p className="text-lg md:text-xl font-700 text-foreground leading-relaxed max-w-3xl mx-auto">
            Sery is currently in early access. Working with{' '}
            <span className="text-primary">Gmail and Google Calendar</span>
            {' '}— with more integrations on the way. Access is reviewed manually.
          </p>
        </motion.div>
      </div>
    </section>
  );
}