import React, { type ReactNode } from 'react';

interface TableProps {
  headers: string[];
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
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-neutral-50)',
            }}
          >
            {headers.map((header, idx) => (
              <th
                key={idx}
                style={{
                  padding: '10px 16px',
                  fontWeight: 500,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  lineHeight: 'var(--line-height-normal)',
                  letterSpacing: '0.01em',
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
                  color: 'var(--color-text-muted)',
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
        borderBottom: '1px solid var(--color-border)',
        transition: `background-color var(--duration-fast) var(--ease)`,
        cursor: onClick ? 'pointer' : undefined,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-neutral-50)';
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
        padding: '12px 16px',
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-text-main)',
        verticalAlign: 'middle',
      }}
    >
      {children}
    </td>
  );
};
