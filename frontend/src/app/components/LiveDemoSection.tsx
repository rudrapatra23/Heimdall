'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

type DemoStep = 'idle' | 'typing' | 'processing' | 'dispatched' | 'audit';

const PROMPT_TEXT = '"Email Rudra to prepare the Q3 board PPT. Tell him I need it before Friday 3PM. I am his team lead."';

const emailPreview = {
  to: 'rudra.mehta@company.com',
  from: 'alex.chen@company.com (via Sery)',
  subject: 'Q3 Board Deck — Required by Friday 3PM',
  body: `Hi Rudra,

Hope you're well. I need the Q3 board presentation finalized and sent to me before Friday at 3PM — this is going to the board directly.

Please ensure it covers:
- Q3 revenue performance vs targets
- Key product milestones
- Q4 outlook and resource asks

Let me know if you need any data access or support before then.

— Alex`,
};

const auditEntries = [
  { time: '0.0s', action: 'Intent parsed', detail: 'recipient=Rudra, task=PPT, deadline=Friday 3PM' },
  { time: '0.2s', action: 'Context loaded', detail: 'gmail_history, calendar, relationship=direct_report' },
  { time: '0.6s', action: 'Draft generated', detail: '178 words, tone=yours, style_match=97%' },
  { time: '0.8s', action: 'Email dispatched', detail: 'rudra.mehta@company.com · confirmed delivered' },
];

export default function LiveDemoSection() {
  const [step, setStep] = useState<DemoStep>('idle');
  const [typedChars, setTypedChars] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });

  useEffect(() => {
    if (inView && !hasStarted) {
      setHasStarted(true);
      runSequence();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  function runSequence() {
    // Step 1: type
    setStep('typing');
    let i = 0;
    const typingInterval = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= PROMPT_TEXT.length) {
        clearInterval(typingInterval);
        setTimeout(() => {
          setStep('processing');
          setTimeout(() => {
            setStep('dispatched');
            setTimeout(() => setStep('audit'), 1200);
          }, 2000);
        }, 400);
      }
    }, 22);
  }

  function handleReplay() {
    setStep('idle');
    setTypedChars(0);
    setTimeout(() => runSequence(), 300);
  }

  return (
    <section ref={ref} className="py-24 px-6 relative" id="demo">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(200,240,77,0.04) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-label-upper text-primary mb-4">Live Simulation</p>
          <h2 className="text-section-title text-foreground uppercase mb-4">
            AI That Sounds
            <br />
            <span className="text-primary">Like You.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-500">
            Sery learns how you write. When it handles your email, it doesn&apos;t feel like generic AI — it feels like you.
          </p>
        </motion.div>

        {/* Demo Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="demo-terminal p-0 overflow-hidden rounded-3xl">
            {/* Terminal bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">sery — execution_engine v2.4</span>
              <button
                onClick={handleReplay}
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded border border-border/40 hover:border-primary/40"
              >
                ↺ replay
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Input prompt */}
              <div>
                <p className="text-label-upper text-muted-foreground mb-2">
                  <span className="text-primary">›</span> your intent
                </p>
                <div className="bg-muted/20 rounded-xl p-4 border border-border/20 min-h-[72px]">
                  {(step === 'typing' || step === 'processing' || step === 'dispatched' || step === 'audit') && (
                    <p className="text-sm font-mono text-foreground leading-relaxed">
                      {PROMPT_TEXT.slice(0, typedChars)}
                      {step === 'typing' && (
                        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-cursor-blink" />
                      )}
                    </p>
                  )}
                  {step === 'idle' && (
                    <p className="text-sm font-mono text-muted-foreground/40">
                      Waiting for intent...
                    </p>
                  )}
                </div>
              </div>

              {/* Processing state */}
              <AnimatePresence>
                {(step === 'processing' || step === 'dispatched' || step === 'audit') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-3 py-2">
                      {step === 'processing' ? (
                        <>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                                style={{
                                  animation: 'pulse-slow 1.2s ease-in-out infinite',
                                  animationDelay: `${i * 0.15}s`,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-mono text-primary">
                            Reading your Gmail context · Drafting in your voice...
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-primary text-sm">✓</span>
                          <span className="text-xs font-mono text-primary">
                            Sent in 0.8s · sounds like you, not like AI
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email preview */}
              <AnimatePresence>
                {(step === 'dispatched' || step === 'audit') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
                  >
                    <div className="px-5 py-3 border-b border-primary/10 flex items-center justify-between">
                      <span className="text-label-upper text-primary">Email Dispatched</span>
                      <span className="text-xs font-mono text-primary/70">✓ delivered</span>
                    </div>
                    <div className="p-5 space-y-2 font-mono text-xs">
                      <p>
                        <span className="text-muted-foreground">To: </span>
                        <span className="text-foreground">{emailPreview.to}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">From: </span>
                        <span className="text-foreground">{emailPreview.from}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Subject: </span>
                        <span className="text-foreground font-600">{emailPreview.subject}</span>
                      </p>
                      <div className="pt-3 border-t border-border/20">
                        <p className="text-foreground/70 leading-relaxed whitespace-pre-line text-[11px]">
                          {emailPreview.body}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Audit trail */}
              <AnimatePresence>
                {step === 'audit' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="rounded-xl border border-border/30 bg-muted/10 overflow-hidden"
                  >
                    <div className="px-5 py-3 border-b border-border/20">
                      <span className="text-label-upper text-muted-foreground">Audit Trail</span>
                    </div>
                    <div className="divide-y divide-border/20">
                      {auditEntries.map((entry, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="px-5 py-3 flex items-start gap-4"
                        >
                          <span className="text-xs font-mono text-primary/60 shrink-0 w-10">{entry.time}</span>
                          <span className="text-xs font-mono text-foreground/80 shrink-0 w-28">{entry.action}</span>
                          <span className="text-xs font-mono text-muted-foreground">{entry.detail}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}