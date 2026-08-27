import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export const AppLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          height: '56px',
          backgroundColor: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Dumbbell size={22} style={{ color: 'var(--color-primary-600)' }} />
          <span
            style={{
              fontSize: 'var(--font-size-md)',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              letterSpacing: '-0.01em',
            }}
          >
            GymMaster
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/apply"
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            Become a Gym Owner
          </Link>
          <Link
            to="/login"
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-600)',
              color: '#fff',
              textDecoration: 'none',
              transition: `background-color var(--duration-fast) var(--ease)`,
            }}
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-neutral-50)',
          textAlign: 'center',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        © {new Date().getFullYear()} GymMaster. All rights reserved.
      </footer>
    </div>
  );
};
