import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, style, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id || `input-${reactId}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: 'var(--gm-text-sm)',
              fontWeight: 600,
              color: 'var(--gm-text-primary)',
              lineHeight: 'var(--line-height-tight)',
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
            padding: '9px 13px',
            fontSize: 'var(--font-size-base)',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--gm-text-primary)',
            backgroundColor: 'var(--gm-surface)',
            border: `1px solid ${error ? 'var(--gm-danger)' : 'var(--gm-border)'}`,
            borderRadius: 'var(--gm-radius-md)',
            transition: `border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)`,
            outline: 'none',
            ...style,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--gm-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.14)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--gm-danger)' : 'var(--gm-border)';
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
              fontSize: 'var(--gm-text-sm)',
              fontWeight: 500,
              color: 'var(--gm-danger-dark)',
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
              fontSize: 'var(--gm-text-xs)',
              color: 'var(--gm-text-muted)',
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
