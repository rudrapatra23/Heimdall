'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';

export default function FinalCTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section ref={ref} className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[2.5rem] overflow-hidden border border-primary/20 p-12 md:p-20 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(200,240,77,0.08) 0%, rgba(10,10,15,0.95) 50%, rgba(120,80,255,0.05) 100%)',
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-20 -left-20 w-80 h-80 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(200,240,77,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -right-20 w-80 h-80 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(120,80,255,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse-slow" />
              <span className="text-label-upper text-primary">Now in Early Access</span>
            </div>

            <h2 className="text-section-title text-foreground uppercase max-w-3xl mx-auto">
              Ready to Stop
              <br />
              <span className="text-primary">Context-Switching</span> and Start
              <br />
              <span className="text-muted-foreground">Moving?</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-500 leading-relaxed">
              Sery learns your Gmail, your Calendar, and the way you communicate. Request access and we&apos;ll review your application personally.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-primary text-primary-foreground font-700 text-base hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ boxShadow: '0 12px 40px rgba(200, 240, 77, 0.3)' }}
              >
                Apply for Access
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground/60 font-mono">
              No credit card. Reviewed personally. Gmail + Calendar to start.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}