import React, { useState, useEffect, type ReactNode } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, ClipboardList,
  FileText, LogOut, Menu, X, Dumbbell
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { decodeToken } from '../utils/token';
import type { Role } from '../types/auth';

/* ── Navigation config per role ─────────────────────────── */
interface NavItem {
  name: string;
  path: string;
  icon: ReactNode;
}

const ownerNav: NavItem[] = [
  { name: 'Dashboard', path: '/owner', icon: <LayoutDashboard size={18} /> },
  { name: 'Trainers', path: '/owner/trainers', icon: <Users size={18} /> },
  { name: 'Members', path: '/owner/members', icon: <Users size={18} /> },
  { name: 'Membership Plans', path: '/owner/membership-plans', icon: <ClipboardList size={18} /> },
];

const trainerNav: NavItem[] = [
  { name: 'Dashboard', path: '/trainer', icon: <LayoutDashboard size={18} /> },
  { name: 'Members', path: '/trainer/members', icon: <Users size={18} /> },
  { name: 'Subscriptions', path: '/trainer/subscriptions', icon: <CreditCard size={18} /> },
];

const adminNav: NavItem[] = [
  { name: 'Applications', path: '/admin', icon: <FileText size={18} /> },
];

const navMap: Record<Role, NavItem[]> = {
  GymOwner: ownerNav,
  Trainer: trainerNav,
  Admin: adminNav,
};

const roleLabel: Record<Role, string> = {
  GymOwner: 'Gym Owner',
  Trainer: 'Trainer',
  Admin: 'Admin',
};

/* ── Helpers ─────────────────────────────────────────────── */
function isActive(path: string, currentPath: string): boolean {
  if (path === '/owner' || path === '/trainer' || path === '/admin') {
    return currentPath === path || currentPath === path + '/';
  }
  return currentPath.startsWith(path);
}

/* ── AppShell Component ──────────────────────────────────── */
export const AppShell: React.FC = () => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get user info from token
  const token = localStorage.getItem('gym_token');
  const decoded = token ? decodeToken(token) : null;
  const username = (decoded as any)?.unique_name || (decoded as any)?.nameid || roleLabel[role!] || 'User';

  const navItems = role ? navMap[role] : [];
  const currentRoleLabel = role ? roleLabel[role] : '';

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Find current page title
  const currentPage = navItems.find((item) => isActive(item.path, location.pathname));
  const pageTitle = currentPage?.name || 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--sidebar-bg)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 'var(--z-sidebar)' as any,
        }}
        className="sidebar-desktop"
      >
        <SidebarContent
          navItems={navItems}
          currentPath={location.pathname}
          username={username}
          currentRoleLabel={currentRoleLabel}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile Overlay + Drawer ─────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 44,
            animation: 'overlay-in var(--duration-fast) var(--ease)',
          }}
          className="sidebar-mobile-overlay"
        />
      )}
      <aside
        className="sidebar-mobile"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--sidebar-bg)',
          zIndex: 45,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: `transform var(--duration-slow) var(--ease)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SidebarContent
          navItems={navItems}
          currentPath={location.pathname}
          username={username}
          currentRoleLabel={currentRoleLabel}
          onLogout={handleLogout}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* ── Main Area ───────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          marginLeft: 'var(--sidebar-width)',
        }}
        className="main-area"
      >
        {/* TopBar */}
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
            position: 'sticky',
            top: 0,
            zIndex: 'var(--z-topbar)' as any,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="mobile-menu-btn"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-neutral-600)',
              }}
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 600,
                  color: 'var(--color-text-main)',
                }}
              >
                {pageTitle}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>{currentRoleLabel}</span>
            <span style={{ color: 'var(--color-neutral-300)' }}>·</span>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{username}</span>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Responsive CSS — injected via style tag */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .main-area { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar-mobile { display: none !important; }
          .sidebar-mobile-overlay { display: none !important; }
        }
      `}</style>
    </div>
  );
};

/* ── Sidebar Content (shared between desktop & mobile) ─── */
interface SidebarContentProps {
  navItems: NavItem[];
  currentPath: string;
  username: string;
  currentRoleLabel: string;
  onLogout: () => void;
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navItems,
  currentPath,
  onLogout,
  onClose,
}) => (
  <>
    {/* Logo */}
    <div
      style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}
      >
        <Dumbbell size={22} style={{ color: 'var(--color-primary-400)' }} />
        <span
          style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.01em',
          }}
        >
          GymMaster
        </span>
      </Link>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-neutral-400)',
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>

    {/* Nav Links */}
    <nav
      style={{
        flex: 1,
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        overflowY: 'auto',
      }}
    >
      {navItems.map((item) => {
        const active = isActive(item.path, currentPath);
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: active ? 500 : 400,
              color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
              backgroundColor: active ? 'var(--sidebar-item-active)' : 'transparent',
              textDecoration: 'none',
              transition: `all var(--duration-fast) var(--ease)`,
              lineHeight: '20px',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover)';
                e.currentTarget.style.color = 'var(--sidebar-text-active)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--sidebar-text)';
              }
            }}
          >
            <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>

    {/* Footer / Logout */}
    <div
      style={{
        padding: '12px 8px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}
    >
      <button
        onClick={onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--sidebar-text)',
          width: '100%',
          textAlign: 'left',
          transition: `all var(--duration-fast) var(--ease)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover)';
          e.currentTarget.style.color = 'var(--sidebar-text-active)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--sidebar-text)';
        }}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  </>
);
