'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

type ToastVariant = 'default' | 'success' | 'error';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
let fallbackToastId = 0;

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100',
  error: 'border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/60 dark:text-red-100',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((input: Omit<Toast, 'id'>) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `toast-${++fallbackToastId}`;
    setToasts((current) => [...current, { id, ...input }]);
    window.setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((entry) => {
          const Icon = entry.variant === 'error' ? XCircle : CheckCircle2;
          return (
            <div
              key={entry.id}
              className={clsx(
                'pointer-events-auto rounded-xl border p-4 shadow-lg backdrop-blur',
                variantStyles[entry.variant ?? 'default']
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{entry.title}</p>
                  {entry.description && <p className="mt-1 text-sm opacity-80">{entry.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(entry.id)}
                  className="rounded-md p-1 opacity-70 transition hover:opacity-100"
                  aria-label="Dismiss toast"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
