import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '320px',
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--gm-text-placeholder)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '9px 34px 9px 36px',
          fontSize: 'var(--font-size-base)',
          color: 'var(--gm-text-primary)',
          backgroundColor: 'var(--gm-surface)',
          border: '1px solid var(--gm-border)',
          borderRadius: 'var(--gm-radius-md)',
          outline: 'none',
          transition: `border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)`,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--gm-primary)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.14)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--gm-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: 'var(--gm-radius-sm)',
            color: 'var(--gm-text-muted)',
            transition: 'all var(--duration-fast) var(--ease)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gm-surface-soft)';
            e.currentTarget.style.color = 'var(--gm-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--gm-text-muted)';
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
