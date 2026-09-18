import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading the data.',
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--gm-radius-xl)',
          backgroundColor: 'var(--gm-danger-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--gm-danger)',
        }}
      >
        <AlertTriangle size={24} strokeWidth={2} />
      </div>
      <h3
        style={{
          fontSize: '1.1875rem',
          fontWeight: 700,
          color: 'var(--gm-text-primary)',
          margin: 0,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--gm-text-secondary)',
          marginTop: '6px',
          maxWidth: '380px',
          lineHeight: 'var(--line-height-relaxed)',
        }}
      >
        {message}
      </p>
      {onRetry && (
        <div style={{ marginTop: '18px' }}>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
