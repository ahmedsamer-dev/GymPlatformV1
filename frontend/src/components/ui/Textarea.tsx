import React, { useId, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, maxLength, showCount, id, value, defaultValue, style, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;
    const currentLength = typeof value === 'string' ? value.length : typeof defaultValue === 'string' ? defaultValue.length : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {label && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label
              htmlFor={textareaId}
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
                color: 'var(--color-neutral-700)',
                lineHeight: 'var(--line-height-normal)',
              }}
            >
              {label}
            </label>
            {showCount && maxLength && (
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: currentLength > maxLength ? 'var(--color-danger-500)' : 'var(--color-text-muted)',
                }}
              >
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          style={{
            display: 'block',
            width: '100%',
            minHeight: '96px',
            padding: '8px 12px',
            fontSize: 'var(--font-size-base)',
            fontFamily: 'inherit',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--color-text-main)',
            backgroundColor: 'var(--color-bg-surface)',
            border: `1px solid ${error ? 'var(--color-danger-500)' : 'var(--color-neutral-300)'}`,
            borderRadius: 'var(--radius-md)',
            transition: `border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)`,
            outline: 'none',
            resize: 'vertical',
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
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
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
            id={`${textareaId}-hint`}
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

Textarea.displayName = 'Textarea';
