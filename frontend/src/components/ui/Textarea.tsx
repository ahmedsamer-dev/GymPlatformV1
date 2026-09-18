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
                fontSize: 'var(--gm-text-sm)',
                fontWeight: 600,
                color: 'var(--gm-text-primary)',
                lineHeight: 'var(--line-height-tight)',
              }}
            >
              {label}
            </label>
            {showCount && maxLength && (
              <span
                style={{
                  fontSize: 'var(--gm-text-xs)',
                  color: currentLength > maxLength ? 'var(--gm-danger)' : 'var(--gm-text-muted)',
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
            padding: '9px 13px',
            fontSize: 'var(--font-size-base)',
            fontFamily: 'inherit',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--gm-text-primary)',
            backgroundColor: 'var(--gm-surface)',
            border: `1px solid ${error ? 'var(--gm-danger)' : 'var(--gm-border)'}`,
            borderRadius: 'var(--gm-radius-md)',
            transition: `border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)`,
            outline: 'none',
            resize: 'vertical',
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
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
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
            id={`${textareaId}-hint`}
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

Textarea.displayName = 'Textarea';
