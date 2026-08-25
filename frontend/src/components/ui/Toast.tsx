'use client';

/**
 * Lightweight framer-motion toast system.
 * Usage:
 *   import { Toaster, useToast } from '@/components/ui/Toast';
 *
 *   // In layout: <Toaster />
 *   // In any client component:
 *   const { toast } = useToast();
 *   toast({ title: 'Saved!', variant: 'success' });
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms, default 4000
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
}

// ── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      const duration = item.duration ?? 4000;
      setToasts((prev) => [...prev, { ...item, id }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <Toaster toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Icons per variant ────────────────────────────────────────────────────────

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; bar: string; bg: string; border: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
    bar: 'bg-primary',
    bg: 'bg-primary/8',
    border: 'border-primary/25',
  },
  error: {
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    bar: 'bg-red-400',
    bg: 'bg-red-500/8',
    border: 'border-red-500/25',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    bar: 'bg-yellow-400',
    bg: 'bg-yellow-500/8',
    border: 'border-yellow-500/25',
  },
  info: {
    icon: <Info className="w-4 h-4 text-blue-400" />,
    bar: 'bg-blue-400',
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/25',
  },
};

// ── Single Toast ─────────────────────────────────────────────────────────────

function Toast({
  item,
  dismiss,
}: {
  item: ToastItem;
  dismiss: (id: string) => void;
}) {
  const variant = item.variant ?? 'info';
  const cfg = variantConfig[variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex items-start gap-3 w-full max-w-sm rounded-2xl border px-4 py-3.5 shadow-xl backdrop-blur-sm ${cfg.bg} ${cfg.border}`}
      style={{ background: 'rgba(20,20,32,0.92)' }}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${cfg.bar}`} />

      <div className="mt-0.5 shrink-0">{cfg.icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-700 text-foreground leading-snug">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <button
        onClick={() => dismiss(item.id)}
        className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ── Toaster (portal) ─────────────────────────────────────────────────────────

function Toaster({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}) {
  if (typeof window === 'undefined') return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast item={t} dismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}