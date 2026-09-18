import React, { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: 'var(--gm-space-6)',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 'var(--gm-font-size-2xl)',
            fontWeight: 700,
            color: 'var(--gm-text-primary)',
            margin: 0,
            lineHeight: 1.25,
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: 'var(--gm-font-size-sm)',
              color: 'var(--gm-text-secondary)',
              marginTop: '4px',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
};
