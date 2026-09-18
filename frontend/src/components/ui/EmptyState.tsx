import React, { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon }) => {
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
          backgroundColor: 'var(--gm-surface-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--gm-text-muted)',
        }}
      >
        {icon || <Inbox size={24} strokeWidth={2} />}
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
      {description && (
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--gm-text-secondary)',
            marginTop: '6px',
            maxWidth: '380px',
            lineHeight: 'var(--line-height-relaxed)',
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '18px' }}>{action}</div>}
    </div>
  );
};
