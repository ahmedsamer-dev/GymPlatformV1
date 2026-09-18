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
        backgroundColor: 'var(--gm-surface)',
        borderRadius: 'var(--gm-radius-xl)',
        border: '1px solid var(--gm-border)',
        boxShadow: 'var(--gm-shadow-sm)',
        padding: paddingMap[padding],
        overflow: 'hidden',
        transition: `border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
