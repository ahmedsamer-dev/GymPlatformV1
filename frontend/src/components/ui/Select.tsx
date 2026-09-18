import React, { type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, options, style, disabled, ...props }, ref) => {
    const reactId = React.useId();
    const selectId = id || `select-${reactId}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
        {label && (
          <label
            htmlFor={selectId}
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
        <select
          id={selectId}
          ref={ref}
          disabled={disabled}
          style={{
            display: 'block',
            width: '100%',
            padding: '9px 36px 9px 13px',
            fontSize: 'var(--font-size-base)',
            color: 'var(--gm-text-primary)',
            backgroundColor: disabled ? 'var(--gm-surface-soft)' : 'var(--gm-surface)',
            border: `1px solid ${error ? 'var(--gm-danger)' : 'var(--gm-border)'}`,
            borderRadius: 'var(--gm-radius-md)',
            outline: 'none',
            transition: `border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)`,
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
            ...style,
          }}
          onFocus={(e) => {
            if (!error && !disabled) {
              e.currentTarget.style.borderColor = 'var(--gm-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.14)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--gm-danger)' : 'var(--gm-border)';
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
            id={`${selectId}-hint`}
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
Select.displayName = 'Select';
