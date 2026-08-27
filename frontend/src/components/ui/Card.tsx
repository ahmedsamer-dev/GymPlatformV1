import React, { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

const paddingMap: Record<string, string> = {
  none: '0',
  sm: 'var(--sp-4)',
  md: 'var(--sp-5)',
  lg: 'var(--sp-6)',
};

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md', style }) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
        padding: paddingMap[padding],
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
