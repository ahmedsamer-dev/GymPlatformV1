import React, { type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, options, style, disabled, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: 'var(--color-neutral-700)',
            }}
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          disabled={disabled}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-main)',
            backgroundColor: disabled ? 'var(--color-neutral-100)' : 'var(--color-bg-surface)',
            border: `1px solid ${error ? 'var(--color-danger-500)' : 'var(--color-neutral-300)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: `border-color var(--duration-fast) var(--ease)`,
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 3.5L11.5 6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            backgroundSize: '16px',
            paddingRight: '32px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
            ...style,
          }}
          onFocus={(e) => {
            if (!error && !disabled) {
              e.currentTarget.style.borderColor = 'var(--color-primary-500)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-100)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-danger-500)' : 'var(--color-neutral-300)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={`${selectId}-error`}
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
            id={`${selectId}-hint`}
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
Select.displayName = 'Select';
