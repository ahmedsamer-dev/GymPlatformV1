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
        gap: '12px',
        marginBottom: 'var(--sp-6)',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 600,
            color: 'var(--color-text-main)',
            margin: 0,
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginTop: '4px',
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
