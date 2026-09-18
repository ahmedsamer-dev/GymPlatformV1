import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  iconOnly?: boolean;
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    borderRadius: 'var(--radius-md)',
    transition: `all var(--duration-base) var(--ease)`,
    cursor: 'pointer',
    border: '1px solid transparent',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
};

const variantMap: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--gm-primary)',
    color: '#ffffff',
    borderColor: 'var(--gm-primary)',
    boxShadow: 'var(--gm-shadow-xs)',
  },
  secondary: {
    backgroundColor: 'var(--gm-surface)',
    color: 'var(--gm-text-primary)',
    borderColor: 'var(--gm-border)',
    boxShadow: 'var(--gm-shadow-xs)',
  },
  danger: {
    backgroundColor: 'var(--gm-danger)',
    color: '#ffffff',
    borderColor: 'var(--gm-danger)',
    boxShadow: 'var(--gm-shadow-xs)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--gm-text-secondary)',
    borderColor: 'transparent',
  },
  success: {
    backgroundColor: 'var(--gm-success)',
    color: '#ffffff',
    borderColor: 'var(--gm-success)',
    boxShadow: 'var(--gm-shadow-xs)',
  },
};

const sizeMap: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 'var(--gm-text-sm)', gap: '6px' },
  md: { padding: '8px 16px', fontSize: 'var(--font-size-base)', gap: '7px' },
  lg: { padding: '10px 22px', fontSize: 'var(--gm-text-lg)', gap: '8px' },
};

const Loader: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
  >
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
    <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, iconOnly, children, disabled, style, ...props }, ref) => {
    const isDisabled = disabled || isLoading;

    const mergedStyle: React.CSSProperties = {
      ...styles.base,
      ...variantMap[variant],
      ...sizeMap[size],
      ...(iconOnly ? { padding: size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px' } : {}),
      ...(isDisabled ? { opacity: 0.55, cursor: 'not-allowed', pointerEvents: 'none' as const } : {}),
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={mergedStyle}
        onMouseEnter={(e) => {
          if (isDisabled) return;
          const t = e.currentTarget;
          if (variant === 'primary') {
            t.style.backgroundColor = 'var(--gm-primary-hover)';
            t.style.borderColor = 'var(--gm-primary-hover)';
          } else if (variant === 'secondary') {
            t.style.backgroundColor = 'var(--gm-surface-soft)';
            t.style.borderColor = 'var(--gm-border-hover)';
          } else if (variant === 'danger') {
            t.style.backgroundColor = 'var(--gm-danger-dark)';
            t.style.borderColor = 'var(--gm-danger-dark)';
          } else if (variant === 'ghost') {
            t.style.backgroundColor = 'var(--gm-surface-soft)';
          } else if (variant === 'success') {
            t.style.backgroundColor = 'var(--gm-success-dark)';
            t.style.borderColor = 'var(--gm-success-dark)';
          }
          if (variant !== 'ghost') t.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.backgroundColor = variantMap[variant].backgroundColor as string;
          t.style.borderColor = variantMap[variant].borderColor as string;
          t.style.transform = '';
        }}
        {...props}
      >
        {isLoading && <Loader />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
