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
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-neutral-400)',
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
          padding: '8px 32px 8px 34px',
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-main)',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-neutral-300)',
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          transition: `border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)`,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary-500)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-100)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-neutral-300)';
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
            width: '20px',
            height: '20px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-neutral-400)',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
