import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
}

const variantStyles: Record<string, { bg: string; color: string; dot: string }> = {
  success: { bg: 'var(--color-success-50)', color: 'var(--color-success-700)', dot: 'var(--color-success-500)' },
  warning: { bg: 'var(--color-warning-50)', color: 'var(--color-warning-700)', dot: 'var(--color-warning-500)' },
  danger:  { bg: 'var(--color-danger-50)',  color: 'var(--color-danger-700)',  dot: 'var(--color-danger-500)' },
  primary: { bg: 'var(--color-primary-50)', color: 'var(--color-primary-700)', dot: 'var(--color-primary-500)' },
  neutral: { bg: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)', dot: 'var(--color-neutral-400)' },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const s = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 10px',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 500,
        lineHeight: '20px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: s.bg,
        color: s.color,
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
