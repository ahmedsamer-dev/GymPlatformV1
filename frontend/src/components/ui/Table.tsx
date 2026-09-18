import React, { type ReactNode } from 'react';

interface TableProps {
  headers: React.ReactNode[];
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export const Table: React.FC<TableProps> = ({ headers, children, emptyMessage = 'No data available', isEmpty = false }) => {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: 'var(--font-size-base)',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--gm-border)',
              backgroundColor: 'var(--gm-bg)',
            }}
          >
            {headers.map((header, idx) => (
              <th
                key={idx}
                style={{
                  padding: '11px 16px',
                  fontWeight: 600,
                  fontSize: 'var(--gm-text-xs)',
                  color: 'var(--gm-text-secondary)',
                  whiteSpace: 'nowrap',
                  lineHeight: 'var(--line-height-normal)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td
                colSpan={headers.length}
                style={{
                  padding: '48px 16px',
                  textAlign: 'center',
                  color: 'var(--gm-text-muted)',
                  fontSize: 'var(--font-size-base)',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow: React.FC<{ children: ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid var(--gm-border)',
        transition: `background-color var(--duration-fast) var(--ease)`,
        cursor: onClick ? 'pointer' : undefined,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gm-surface-soft)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <td
      className={className}
      style={{
        padding: '13px 16px',
        fontSize: 'var(--font-size-base)',
        color: 'var(--gm-text-primary)',
        verticalAlign: 'middle',
      }}
    >
      {children}
    </td>
  );
};
