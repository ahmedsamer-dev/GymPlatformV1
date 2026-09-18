import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BrandLogo } from '../components/brand/BrandLogo';

/**
 * Shared layout for the authentication pages (/login and /apply):
 * same navbar, page background, and minimal footer on both.
 * Route-aware nav actions only — no behavioral logic.
 */
export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--gm-bg)',
      }}
    >
      {/* Navbar */}
      <header
        style={{
          height: '64px',
          backgroundColor: 'var(--gm-surface)',
          borderBottom: '1px solid var(--gm-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <Link
          to="/"
          aria-label="GymMaster home"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
        >
          <BrandLogo size={34} />
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--gm-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            GymMaster
          </span>
        </Link>

        <nav aria-label="Account" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isLogin ? (
            <>
              <span style={{ fontSize: 'var(--gm-font-size-sm)', color: 'var(--gm-text-secondary)', display: 'none' }}>
                Looking to manage a gym?
              </span>
              <Link
                to="/apply"
                className="gm-btn-primary"
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--gm-radius-md)',
                  fontSize: 'var(--gm-font-size-sm)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Become a Gym Owner
              </Link>
            </>
          ) : (
            <>
              <span style={{ fontSize: 'var(--gm-font-size-sm)', color: 'var(--gm-text-secondary)' }}>
                Already have an account?
              </span>
              <Link
                to="/login"
                className="gm-btn-primary"
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--gm-radius-md)',
                  fontSize: 'var(--gm-font-size-sm)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '18px 24px',
          borderTop: '1px solid var(--gm-border)',
          backgroundColor: 'var(--gm-surface)',
          textAlign: 'center',
          fontSize: 'var(--gm-font-size-sm)',
          color: 'var(--gm-text-muted)',
        }}
      >
        © {new Date().getFullYear()} GymMaster. All rights reserved.
      </footer>
    </div>
  );
};
