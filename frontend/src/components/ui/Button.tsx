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
    fontWeight: 500,
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
    backgroundColor: 'var(--color-primary-600)',
    color: '#fff',
    borderColor: 'var(--color-primary-600)',
  },
  secondary: {
    backgroundColor: 'var(--color-bg-surface)',
    color: 'var(--color-neutral-700)',
    borderColor: 'var(--color-border-strong)',
  },
  danger: {
    backgroundColor: 'var(--color-danger-600)',
    color: '#fff',
    borderColor: 'var(--color-danger-600)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-neutral-600)',
    borderColor: 'transparent',
  },
  success: {
    backgroundColor: 'var(--color-success-600)',
    color: '#fff',
    borderColor: 'var(--color-success-600)',
  },
};

const sizeMap: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 'var(--font-size-sm)', gap: '6px' },
  md: { padding: '8px 16px', fontSize: 'var(--font-size-base)', gap: '6px' },
  lg: { padding: '10px 20px', fontSize: 'var(--font-size-md)', gap: '8px' },
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
          if (variant === 'primary') t.style.backgroundColor = 'var(--color-primary-700)';
          else if (variant === 'secondary') t.style.backgroundColor = 'var(--color-neutral-50)';
          else if (variant === 'danger') t.style.backgroundColor = 'var(--color-danger-700)';
          else if (variant === 'ghost') t.style.backgroundColor = 'var(--color-neutral-100)';
          else if (variant === 'success') t.style.backgroundColor = 'var(--color-success-700)';
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.backgroundColor = variantMap[variant].backgroundColor as string;
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
