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
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-danger-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--color-danger-500)',
        }}
      >
        <AlertTriangle size={22} />
      </div>
      <h3
        style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 600,
          color: 'var(--color-text-main)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
          marginTop: '4px',
          maxWidth: '320px',
        }}
      >
        {message}
      </p>
      {onRetry && (
        <div style={{ marginTop: '16px' }}>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
