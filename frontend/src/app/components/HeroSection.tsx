'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';



const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 pb-20 px-6 overflow-hidden">
      <div className="gradient-radial-primary absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-12 lg:gap-0 items-center"
        >
          <div className="lg:col-span-7 space-y-8">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse-slow" />
                <span className="text-label-upper text-primary tracking-widest">
                  EARLY ACCESS
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-hero-display text-foreground uppercase leading-none"
            >
              Your{' '}
              <span className="text-primary glow-text">AI</span>
              <br />
              Executes.
              <br />
              <span className="text-muted-foreground">You Lead.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg font-500"
            >
              Sery is not a chatbot. It&apos;s an autonomous chief of staff that
              drafts emails, coordinates your team, and executes operations —
              while you stay in the room that matters.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-700 text-base hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                style={{ boxShadow: '0 8px 32px rgba(200, 240, 77, 0.25)' }}
              >
                Apply for Early Access
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border text-foreground font-600 text-base hover:border-primary/40 hover:text-primary transition-all duration-200"
              >
                Get Started
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-6 pt-4"
            >
              <div className="flex -space-x-3">
                {['A', 'R', 'K', 'M']?.map((initial, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-700 text-foreground"
                    style={{ zIndex: 4 - i }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-500">
                <span className="text-foreground font-700">47 founders</span> on the waitlist
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 lg:pl-12"
          >
            <div className="relative">
              <div
                className="absolute -inset-8 rounded-full opacity-60 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(200,240,77,0.25) 0%, rgba(120,80,255,0.12) 45%, transparent 70%)' }}
                aria-hidden="true"
              />

              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-4 rounded-full blur-xl opacity-60 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(200,240,77,0.5) 0%, transparent 70%)' }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }}
        aria-hidden="true"
      />
    </section>
  );
}
