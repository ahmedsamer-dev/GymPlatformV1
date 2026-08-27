import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue['toast'] => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
};

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 'var(--z-toast)' as any,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '380px',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

const colorMap: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'var(--color-bg-surface)',
    border: 'var(--color-success-200)',
    icon: 'var(--color-success-600)',
  },
  error: {
    bg: 'var(--color-bg-surface)',
    border: 'var(--color-danger-200)',
    icon: 'var(--color-danger-600)',
  },
  info: {
    bg: 'var(--color-bg-surface)',
    border: 'var(--color-primary-200)',
    icon: 'var(--color-primary-600)',
  },
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const c = colorMap[toast.type];

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        animation: 'toast-in var(--duration-slow) var(--ease)',
        pointerEvents: 'auto',
      }}
    >
      <span style={{ color: c.icon, flexShrink: 0, marginTop: '1px' }}>
        {iconMap[toast.type]}
      </span>
      <p
        style={{
          flex: 1,
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-main)',
          margin: 0,
          lineHeight: 'var(--line-height-normal)',
        }}
      >
        {toast.message}
      </p>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-neutral-400)',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
