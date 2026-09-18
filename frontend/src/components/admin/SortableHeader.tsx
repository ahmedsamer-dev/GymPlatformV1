import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  /** Whether this column is the currently sorted one. */
  active: boolean;
  direction: 'asc' | 'desc';
  onSort: () => void;
}

/** Clickable table header for a server-side sortable column. */
export const SortableHeader: React.FC<SortableHeaderProps> = ({ label, active, direction, onSort }) => {
  const Icon = active ? (direction === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={onSort}
      aria-label={`Sort by ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: 0,
        fontWeight: active ? 700 : 600,
        fontSize: 'var(--gm-font-size-xs)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: active ? 'var(--gm-text-primary)' : 'var(--gm-text-secondary)',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      <Icon size={14} strokeWidth={2} style={{ color: active ? 'var(--gm-primary)' : 'var(--gm-text-muted)' }} />
    </button>
  );
};