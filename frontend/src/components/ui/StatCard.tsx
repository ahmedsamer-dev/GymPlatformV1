import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface StatCardSubStat {
  label: string;
  value: number | string;
  color?: string;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  /** Icon tile background, e.g. var(--color-primary-50). */
  accentBg?: string;
  /** Icon tile foreground, e.g. var(--color-primary-600). */
  accentColor?: string;
  /** Optional bottom row, e.g. active/inactive split. */
  subStats?: StatCardSubStat[];
  /** When set, the whole card becomes a link. */
  to?: string;
}

const cardBase: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  backgroundColor: 'var(--gm-surface)',
  border: '1px solid var(--gm-border)',
  borderRadius: 'var(--gm-radius-xl)',
  boxShadow: 'var(--gm-shadow-sm)',
  padding: '20px',
  height: '100%',
  textDecoration: 'none',
  transition: `border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease), transform var(--duration-fast) var(--ease)`,
};

/**
 * Dashboard statistic card. Purely presentational — the value comes
 * straight from the backend dashboard endpoint.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accentBg = 'var(--gm-primary-soft)',
  accentColor = 'var(--gm-primary)',
  subStats,
  to,
}) => {
  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <span
          style={{
            fontSize: 'var(--gm-text-sm)',
            fontWeight: 600,
            color: 'var(--gm-text-secondary)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            aria-hidden="true"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--gm-radius-lg)',
              backgroundColor: accentBg,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--gm-text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>

      {subStats && subStats.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--sp-4)',
            marginTop: 'auto',
            paddingTop: 'var(--sp-3)',
            borderTop: '1px solid var(--gm-border)',
          }}
        >
          {subStats.map((sub) => (
            <div key={sub.label} style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span
                style={{
                  fontSize: 'var(--gm-text-sm)',
                  fontWeight: 700,
                  color: sub.color || 'var(--gm-text-primary)',
                }}
              >
                {sub.value}
              </span>
              <span style={{ fontSize: 'var(--gm-text-xs)', color: 'var(--gm-text-muted)' }}>
                {sub.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        style={{ ...cardBase, cursor: 'pointer' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--gm-primary-line)';
          e.currentTarget.style.boxShadow = 'var(--gm-shadow-md)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--gm-border)';
          e.currentTarget.style.boxShadow = 'var(--gm-shadow-sm)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        {content}
      </Link>
    );
  }

  return <div style={cardBase}>{content}</div>;
};