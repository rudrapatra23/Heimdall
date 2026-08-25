'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const features = [
  {
    id: 'pipeline',
    label: '01 // Learn',
    title: 'Learns How You Work',
    description:
      'Sery reads your Gmail and Calendar to understand your priorities, your relationships, and how you communicate. The more you use it, the sharper it gets.',
    stat: 'Gmail',
    statLabel: '+ Calendar',
    accent: true,
    colSpan: 'lg:col-span-1 lg:row-span-2',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M6 16h4l3-8 4 16 3-8h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'context',
    label: '02 // Remember',
    title: 'Remembers Your Context',
    description:
      'No copy-pasting. No re-explaining. Sery holds your full history and uses it every time — so every response feels like it came from someone who was already in the room.',
    stat: '0×',
    statLabel: 'context re-entry',
    accent: false,
    colSpan: 'lg:col-span-1',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="10" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 18l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'audit',
    label: '03 // Act',
    title: 'Acts — Sounds Like You',
    description:
      'When Sery drafts an email or handles a task, it matches your tone, your style, and your intent. Not generic AI. You — with better execution.',
    stat: '100%',
    statLabel: 'your voice',
    accent: false,
    colSpan: 'lg:col-span-1',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M8 6h16a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
        <path d="M11 12h10M11 16h7M11 20h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function CoreMechanismSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section ref={ref} className="py-24 px-6 relative" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="text-label-upper text-primary mb-4">How It Works</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-section-title text-foreground uppercase">
              Learns. Remembers.
              <br />
              <span className="text-muted-foreground">Sounds Like You.</span>
            </h2>
            <p className="max-w-sm text-base text-muted-foreground font-500 leading-relaxed md:pb-2">
              Sery gets smarter with every interaction — no prompting, no hand-holding.
            </p>
          </div>
        </motion.div>

        {/* BENTO GRID AUDIT:
          Array has 3 cards: [pipeline, context, audit]
          Row 1: [col-1: pipeline cs-1 rs-2] [col-2: context cs-1 rs-1]
          Row 2: [col-1: (occupied)]         [col-2: audit cs-1 rs-1]
          Placed 3/3 cards ✓
        */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Card: pipeline — row-span-2 */}
          {/* col-1: pipeline cs-1 rs-2 */}
          <motion.div
            variants={cardVariants}
            className="glass-card rounded-3xl p-8 flex flex-col justify-between lg:row-span-2 min-h-[400px] relative overflow-hidden group hover:border-primary/20 transition-colors duration-300 border border-border/50"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(200,240,77,0.06) 0%, transparent 60%)' }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <p className="text-label-upper text-primary mb-6">{features?.[0]?.label}</p>
              <div className="text-primary mb-6">{features?.[0]?.icon}</div>
              <h3 className="text-2xl md:text-3xl font-800 text-foreground mb-4 leading-tight">
                {features?.[0]?.title}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {features?.[0]?.description}
              </p>
            </div>
            <div className="relative z-10 mt-8 pt-6 border-t border-border/40">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-900 text-primary">{features?.[0]?.stat}</span>
                <span className="text-sm font-600 text-muted-foreground uppercase tracking-widest">
                  {features?.[0]?.statLabel}
                </span>
              </div>
            </div>
          </motion.div>

          {/* col-2: context cs-1 rs-1 */}
          <motion.div
            variants={cardVariants}
            className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-primary/20 transition-colors duration-300 border border-border/50"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(200,240,77,0.05) 0%, transparent 60%)' }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <p className="text-label-upper text-muted-foreground mb-4">{features?.[1]?.label}</p>
              <div className="text-foreground mb-4">{features?.[1]?.icon}</div>
              <h3 className="text-xl md:text-2xl font-800 text-foreground mb-3 leading-tight">
                {features?.[1]?.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{features?.[1]?.description}</p>
            </div>
            <div className="relative z-10 mt-6 flex items-baseline gap-2">
              <span className="text-3xl font-900 text-foreground">{features?.[1]?.stat}</span>
              <span className="text-xs font-600 text-muted-foreground uppercase tracking-widest">
                {features?.[1]?.statLabel}
              </span>
            </div>
          </motion.div>

          {/* col-2: audit cs-1 rs-1 */}
          <motion.div
            variants={cardVariants}
            className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-primary/20 transition-colors duration-300 border border-border/50"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(200,240,77,0.05) 0%, transparent 60%)' }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <p className="text-label-upper text-muted-foreground mb-4">{features?.[2]?.label}</p>
              <div className="text-foreground mb-4">{features?.[2]?.icon}</div>
              <h3 className="text-xl md:text-2xl font-800 text-foreground mb-3 leading-tight">
                {features?.[2]?.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{features?.[2]?.description}</p>
            </div>
            <div className="relative z-10 mt-6 flex items-baseline gap-2">
              <span className="text-3xl font-900 text-foreground">{features?.[2]?.stat}</span>
              <span className="text-xs font-600 text-muted-foreground uppercase tracking-widest">
                {features?.[2]?.statLabel}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}