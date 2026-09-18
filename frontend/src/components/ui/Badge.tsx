import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
}

const variantStyles: Record<string, { bg: string; color: string; dot: string; border?: string }> = {
  success: { bg: 'var(--gm-success-soft)', color: 'var(--gm-success-dark)', dot: 'var(--gm-success)', border: 'rgba(16, 185, 129, 0.2)' },
  warning: { bg: 'var(--gm-warning-soft)', color: 'var(--gm-warning-dark)', dot: 'var(--gm-warning)', border: 'rgba(245, 158, 11, 0.25)' },
  danger:  { bg: 'var(--gm-danger-soft)',  color: 'var(--gm-danger-dark)',  dot: 'var(--gm-danger)',  border: 'rgba(239, 68, 68, 0.2)' },
  primary: { bg: 'var(--gm-primary-soft)', color: 'var(--gm-primary-hover)', dot: 'var(--gm-primary)', border: 'rgba(37, 99, 235, 0.2)' },
  neutral: { bg: 'var(--gm-surface-soft)', color: '#334155',                dot: 'var(--gm-text-muted)', border: 'var(--gm-border)' },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const s = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        fontSize: 'var(--gm-text-xs)',
        fontWeight: 600,
        lineHeight: '18px',
        borderRadius: 'var(--gm-radius-full)',
        backgroundColor: s.bg,
        color: s.color,
        border: s.border ? `1px solid ${s.border}` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: s.dot,
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
};
