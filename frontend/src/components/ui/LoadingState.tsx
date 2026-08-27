import React from 'react';
import { Spinner } from './Spinner';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: '12px',
      }}
    >
      <Spinner size="md" />
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}
      >
        {message}
      </p>
    </div>
  );
};
