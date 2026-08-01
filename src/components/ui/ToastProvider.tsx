import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const STYLES: Record<ToastType, { icon: typeof CheckCircle; border: string; iconColor: string }> = {
  success: { icon: CheckCircle, border: 'border-emerald-500/40', iconColor: 'text-emerald-400' },
  error: { icon: XCircle, border: 'border-[#EF4444]/40', iconColor: 'text-[#EF4444]' },
  info: { icon: Info, border: 'border-[rgba(124,58,237,0.4)]', iconColor: 'text-[#A78BFA]' },
};

const DURATION_MS = { success: 3500, error: 5000, info: 4000 };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => dismiss(id), DURATION_MS[type]);
  }, [dismiss]);

  const value: ToastContextValue = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const s = STYLES[t.type];
            const Icon = s.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#13132A]/95 backdrop-blur-sm border ${s.border} shadow-[0_8px_24px_rgba(0,0,0,0.4)]`}
              >
                <Icon size={16} className={`shrink-0 mt-0.5 ${s.iconColor}`} />
                <p className="text-white text-sm flex-1 leading-snug">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="shrink-0 text-[#6060A0] hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
