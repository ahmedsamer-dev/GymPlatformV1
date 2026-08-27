import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const sizeMap = { sm: 18, md: 28, lg: 40 };

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', fullPage = false }) => {
  const s = sizeMap[size];

  const spinner = (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.75s linear infinite' }}
      aria-label="Loading"
      role="status"
    >
      <circle cx="12" cy="12" r="10" stroke="var(--color-neutral-200)" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="var(--color-primary-600)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );

  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};
