import React, { type CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  style?: CSSProperties;
}

/** Shimmering placeholder block (uses the .skeleton utility from index.css). */
export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 14, radius = 'var(--gm-radius-md)', style }) => {
  return (
    <div
      aria-hidden="true"
      className="skeleton"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/** Table-shaped placeholder used while list queries load. */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 5 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 0' }}>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} style={{ display: 'flex', gap: '16px' }}>
          {Array.from({ length: columns }).map((_, col) => {
            // First column wider (name), last narrower (actions).
            const flex = col === 0 ? 1.6 : col === columns - 1 ? 0.6 : 1;
            return <Skeleton key={col} height={14} style={{ flex }} />;
          })}
        </div>
      ))}
    </div>
  );
};

interface StatCardsSkeletonProps {
  count?: number;
}

/** Stat-card grid placeholder used while the dashboard loads. */
export const StatCardsSkeleton: React.FC<StatCardsSkeletonProps> = ({ count = 4 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: 'var(--gm-space-6)',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: 'var(--gm-surface)',
            border: '1px solid var(--gm-border)',
            borderRadius: 'var(--gm-radius-xl)',
            boxShadow: 'var(--gm-shadow-sm)',
            padding: '20px',
          }}
        >
          <Skeleton height={12} width="55%" />
          <Skeleton height={28} width="38%" style={{ marginTop: '14px' }} />
          <Skeleton height={10} width="85%" style={{ marginTop: '18px' }} />
        </div>
      ))}
    </div>
  );
};