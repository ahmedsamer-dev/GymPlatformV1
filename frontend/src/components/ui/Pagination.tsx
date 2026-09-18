import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Disables all controls while a query is in flight (prevents duplicate navigations). */
  disabled?: boolean;
}

type PageToken = number | 'start-ellipsis' | 'end-ellipsis';

/** 1 … c-1 c c+1 … N window, or the full list when it fits. */
function buildPageWindow(current: number, total: number): PageToken[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const window: PageToken[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) window.push('start-ellipsis');
  for (let i = start; i <= end; i++) window.push(i);
  if (end < total - 1) window.push('end-ellipsis');
  window.push(total);
  return window;
}

const navButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '34px',
  height: '34px',
  padding: '0 8px',
  borderRadius: 'var(--gm-radius-md)',
  border: '1px solid var(--gm-border)',
  backgroundColor: 'var(--gm-surface)',
  color: 'var(--gm-text-secondary)',
  transition: `all var(--duration-fast) var(--ease)`,
  lineHeight: 1,
};

/**
 * Backend-driven pagination — renders purely from the server's
 * PagedResponseDto fields; the parent refetches on onPageChange.
 */
export const Pagination: React.FC<PaginationProps> = ({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  if (totalCount === 0) return null;

  const rangeStart = (pageNumber - 1) * pageSize + 1;
  const rangeEnd = Math.min(pageNumber * pageSize, totalCount);
  const canPrevious = pageNumber > 1;
  const canNext = pageNumber < totalPages;
  const hoverSurface = 'var(--gm-surface-soft)';

  const handleNav = (page: number) => {
    if (!disabled && page >= 1 && page <= totalPages && page !== pageNumber) onPageChange(page);
  };

  return (
    <nav
      aria-label="Pagination"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        paddingTop: 'var(--sp-4)',
        borderTop: '1px solid var(--gm-border)',
        marginTop: 'var(--sp-2)',
      }}
    >
      <p style={{ fontSize: 'var(--gm-text-sm)', color: 'var(--gm-text-muted)', margin: 0 }}>
        Showing{' '}
        <span style={{ fontWeight: 600, color: 'var(--gm-text-primary)' }}>
          {rangeStart}–{rangeEnd}
        </span>{' '}
        of{' '}
        <span style={{ fontWeight: 600, color: 'var(--gm-text-primary)' }}>{totalCount}</span>
      </p>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleNav(pageNumber - 1)}
            disabled={disabled || !canPrevious}
            aria-label="Previous page"
            style={{ ...navButtonStyle, cursor: canPrevious && !disabled ? 'pointer' : 'not-allowed', opacity: canPrevious && !disabled ? 1 : 0.45 }}
            onMouseEnter={(e) => { if (canPrevious && !disabled) e.currentTarget.style.backgroundColor = hoverSurface; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--gm-surface)'; }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>

          {buildPageWindow(pageNumber, totalPages).map((token, idx) =>
            token === 'start-ellipsis' || token === 'end-ellipsis' ? (
              <span key={`${token}-${idx}`} aria-hidden="true" style={{ minWidth: '24px', textAlign: 'center', fontSize: 'var(--gm-text-sm)', color: 'var(--gm-text-placeholder)', userSelect: 'none' }}>
                …
              </span>
            ) : (
              <button
                key={token}
                type="button"
                onClick={() => handleNav(token)}
                disabled={disabled}
                aria-label={`Page ${token}`}
                aria-current={token === pageNumber ? 'page' : undefined}
                style={{
                  ...navButtonStyle,
                  fontSize: 'var(--gm-text-sm)',
                  fontWeight: token === pageNumber ? 700 : 500,
                  backgroundColor: token === pageNumber ? 'var(--gm-primary)' : 'var(--gm-surface)',
                  borderColor: token === pageNumber ? 'var(--gm-primary)' : 'var(--gm-border)',
                  color: token === pageNumber ? '#ffffff' : 'var(--gm-text-secondary)',
                  boxShadow: token === pageNumber ? 'var(--gm-shadow-xs)' : 'none',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled && token !== pageNumber ? 0.55 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!disabled && token !== pageNumber) {
                    e.currentTarget.style.backgroundColor = hoverSurface;
                    e.currentTarget.style.borderColor = 'var(--gm-border-hover)';
                    e.currentTarget.style.color = 'var(--gm-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (token === pageNumber) {
                    e.currentTarget.style.backgroundColor = 'var(--gm-primary)';
                    e.currentTarget.style.borderColor = 'var(--gm-primary)';
                    e.currentTarget.style.color = '#ffffff';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--gm-surface)';
                    e.currentTarget.style.borderColor = 'var(--gm-border)';
                    e.currentTarget.style.color = 'var(--gm-text-secondary)';
                  }
                }}
              >
                {token}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => handleNav(pageNumber + 1)}
            disabled={disabled || !canNext}
            aria-label="Next page"
            style={{ ...navButtonStyle, cursor: canNext && !disabled ? 'pointer' : 'not-allowed', opacity: canNext && !disabled ? 1 : 0.45 }}
            onMouseEnter={(e) => { if (canNext && !disabled) e.currentTarget.style.backgroundColor = hoverSurface; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--gm-surface)'; }}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      )}
    </nav>
  );
};