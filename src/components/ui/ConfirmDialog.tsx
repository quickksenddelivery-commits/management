import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button red and shows a warning icon — use for destructive actions. */
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {pending && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => close(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              className="relative bg-[#13132A] border border-[rgba(124,58,237,0.3)] rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              {pending.danger && (
                <div className="w-11 h-11 rounded-2xl bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.35)] flex items-center justify-center mb-4">
                  <AlertTriangle size={20} className="text-[#EF4444]" />
                </div>
              )}
              <h2 id="confirm-dialog-title" className="text-white font-black text-lg mb-2">
                {pending.title}
              </h2>
              {pending.description && (
                <p className="text-[#A0A0C0] text-sm leading-relaxed mb-6">{pending.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => close(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A0A0C0] hover:text-white hover:bg-white/4 font-medium text-sm transition-all"
                >
                  {pending.cancelLabel ?? 'Cancel'}
                </button>
                <button
                  onClick={() => close(true)}
                  autoFocus
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all ${
                    pending.danger
                      ? 'bg-[#EF4444] hover:bg-[#DC2626] shadow-[0_0_16px_rgba(239,68,68,0.35)]'
                      : 'accent-btn'
                  }`}
                >
                  {pending.confirmLabel ?? 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return ctx;
}
