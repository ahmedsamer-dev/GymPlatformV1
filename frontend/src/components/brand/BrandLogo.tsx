import React from 'react';

interface BrandLogoProps {
  /** Rendered width & height in px. */
  size?: number;
}

/**
 * GymMaster brand mark — geometric "G" with a barbell form.
 * Inline SVG (no asset fetch) so it renders identically on every page.
 * Purely presentational; decorated with aria-hidden by the consumer
 * (the wordmark/link provides the accessible name).
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="gm-brand-grad" x1="14" y1="10" x2="84" y2="88" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#38b6f8" />
        <stop offset="0.5" stopColor="#2563eb" />
        <stop offset="1" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>

    {/* Left barbell: outer small plate, inner large plate, handle stub */}
    <rect x="3" y="35" width="10" height="26" rx="5" fill="url(#gm-brand-grad)" />
    <rect x="16" y="21" width="19" height="54" rx="9" fill="url(#gm-brand-grad)" />
    <rect x="35" y="42" width="12" height="12" fill="url(#gm-brand-grad)" />

    {/* Right barbell: handle stub, inner large plate, outer small plate */}
    <rect x="49" y="42" width="12" height="12" fill="url(#gm-brand-grad)" />
    <rect x="61" y="21" width="19" height="54" rx="9" fill="url(#gm-brand-grad)" />
    <rect x="83" y="35" width="10" height="26" rx="5" fill="url(#gm-brand-grad)" />

    {/* "G" swoosh — open arc + crossbar reaching to the right handle */}
    <path
      d="M63 27 A23 23 0 1 0 70 44"
      stroke="url(#gm-brand-grad)"
      strokeWidth="13"
      strokeLinecap="round"
      fill="none"
    />
    <rect x="50" y="40" width="27" height="12" rx="4" fill="url(#gm-brand-grad)" />
  </svg>
);