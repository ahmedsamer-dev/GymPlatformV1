export interface FilterTabOption<T extends string> {
  value: T;
  label: string;
  /** Optional badge (e.g. pending count). */
  badgeCount?: number;
}

interface FilterTabsProps<T extends string> {
  /** Accessible group label. */
  label: string;
  value: T;
  options: ReadonlyArray<FilterTabOption<T>>;
  onChange: (value: T) => void;
}

/** Segmented pill tabs used for status filtering across the admin list pages. */
export function FilterTabs<T extends string>({ label, value, options, onChange }: FilterTabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {options.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: 'var(--gm-font-size-sm)',
              fontWeight: active ? 600 : 500,
              borderRadius: 'var(--gm-radius-full)',
              border: `1px solid ${active ? 'var(--gm-primary)' : 'var(--gm-border)'}`,
              backgroundColor: active ? 'var(--gm-primary-soft)' : 'var(--gm-surface)',
              color: active ? 'var(--gm-primary-dark)' : 'var(--gm-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--gm-transition-fast)',
            }}
          >
            {tab.label}
            {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--gm-warning)',
                  color: '#fff',
                  fontSize: 'var(--gm-font-size-xs)',
                  fontWeight: 700,
                  borderRadius: 'var(--gm-radius-full)',
                  padding: '1px 7px',
                  lineHeight: '16px',
                }}
              >
                {tab.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}