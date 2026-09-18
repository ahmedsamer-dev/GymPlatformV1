import React, { useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { ToastContext, type ToastMessage, type ToastType } from './ToastContext';

export { useToast } from './ToastContext';
export type { ToastType, ToastMessage, ToastContextValue } from './ToastContext';

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
  success: <CheckCircle size={18} strokeWidth={2} />,
  error: <AlertCircle size={18} strokeWidth={2} />,
  info: <Info size={18} strokeWidth={2} />,
};

const colorMap: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'var(--gm-surface)',
    border: 'var(--gm-success-border)',
    icon: 'var(--gm-success)',
  },
  error: {
    bg: 'var(--gm-surface)',
    border: 'var(--gm-danger-border)',
    icon: 'var(--gm-danger)',
  },
  info: {
    bg: 'var(--gm-surface)',
    border: 'var(--gm-primary-border)',
    icon: 'var(--gm-primary)',
  },
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  const c = colorMap[toast.type];

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--gm-radius-lg)',
        boxShadow: 'var(--gm-shadow-lg)',
        animation: 'toast-in 0.25s var(--gm-ease)',
        pointerEvents: 'auto',
      }}
    >
      <span style={{ color: c.icon, flexShrink: 0, display: 'flex' }}>
        {iconMap[toast.type]}
      </span>
      <p
        style={{
          flex: 1,
          fontSize: 'var(--gm-font-size-sm)',
          fontWeight: 500,
          color: 'var(--gm-text-primary)',
          margin: 0,
          lineHeight: 1.45,
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
          width: '24px',
          height: '24px',
          borderRadius: 'var(--gm-radius-sm)',
          color: 'var(--gm-text-muted)',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'color var(--gm-transition-fast)',
        }}
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
};
