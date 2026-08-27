import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, style, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: 'var(--color-neutral-700)',
              lineHeight: 'var(--line-height-normal)',
            }}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            fontSize: 'var(--font-size-base)',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--color-text-main)',
            backgroundColor: 'var(--color-bg-surface)',
            border: `1px solid ${error ? 'var(--color-danger-500)' : 'var(--color-neutral-300)'}`,
            borderRadius: 'var(--radius-md)',
            transition: `border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)`,
            outline: 'none',
            ...style,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--color-primary-500)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-100)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-danger-500)' : 'var(--color-neutral-300)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-danger-600)',
              margin: 0,
            }}
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
