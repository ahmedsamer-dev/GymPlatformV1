import React, { useState, useEffect, type ReactNode } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, ClipboardList,
  FileText, LogOut, Menu, X, Dumbbell
} from 'lucide-react';
import { BrandLogo } from '../components/brand/BrandLogo';
import { useAuth } from '../hooks/useAuth';
import { decodeToken, getAccessToken } from '../utils/token';
import type { Role } from '../types/auth';

/* ── Navigation config per role ─────────────────────────── */
interface NavItem {
  name: string;
  path: string;
  icon: ReactNode;
}

const ownerNav: NavItem[] = [
  { name: 'Dashboard', path: '/owner', icon: <LayoutDashboard size={18} strokeWidth={2} /> },
  { name: 'Trainers', path: '/owner/trainers', icon: <Users size={18} strokeWidth={2} /> },
  { name: 'Members', path: '/owner/members', icon: <Users size={18} strokeWidth={2} /> },
  { name: 'Membership Plans', path: '/owner/membership-plans', icon: <ClipboardList size={18} strokeWidth={2} /> },
];

const trainerNav: NavItem[] = [
  { name: 'Dashboard', path: '/trainer', icon: <LayoutDashboard size={18} strokeWidth={2} /> },
  { name: 'Members', path: '/trainer/members', icon: <Users size={18} strokeWidth={2} /> },
  { name: 'Subscriptions', path: '/trainer/subscriptions', icon: <CreditCard size={18} strokeWidth={2} /> },
];

const adminNav: NavItem[] = [
  { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} strokeWidth={2} /> },
  { name: 'Applications', path: '/admin/applications', icon: <FileText size={18} strokeWidth={2} /> },
  { name: 'Owners', path: '/admin/owners', icon: <Users size={18} strokeWidth={2} /> },
  { name: 'Gyms', path: '/admin/gyms', icon: <Dumbbell size={18} strokeWidth={2} /> },
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

export const AppShell: React.FC = () => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get user info from token
  const token = getAccessToken();
  const decoded = token ? decodeToken(token) : null;
  const username =
    (decoded as any)?.unique_name || (decoded as any)?.nameid || (role ? roleLabel[role] : '') || 'User';
  const initial = username.charAt(0).toUpperCase();

  const navItems = role ? navMap[role] : [];
  const currentRoleLabel = role ? roleLabel[role] : '';

  // Lock body scroll when the mobile drawer is open (external-system sync)
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeDrawer = () => setMobileOpen(false);

  // Find current page title
  const currentPage = navItems.find((item) => isActive(item.path, location.pathname));
  const pageTitle = currentPage?.name || 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside
        className="sidebar-desktop"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--sidebar-bg)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 'var(--z-sidebar)' as any,
        }}
      >
        <SidebarContent
          navItems={navItems}
          currentPath={location.pathname}
          username={username}
          currentRoleLabel={currentRoleLabel}
          initial={initial}
          onLogout={handleLogout}
          onNavigate={closeDrawer}
        />
      </aside>

      {/* ── Mobile Overlay + Drawer ─────────────────────── */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={closeDrawer}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 44,
            animation: 'overlay-in var(--duration-fast) var(--ease)',
          }}
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
          background: 'var(--sidebar-bg)',
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
          initial={initial}
          onLogout={handleLogout}
          onClose={closeDrawer}
          onNavigate={closeDrawer}
        />
      </aside>

      {/* ── Main Area ───────────────────────────────────── */}
      <div
        className="main-area"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          marginLeft: 'var(--sidebar-width)',
        }}
      >
        {/* TopBar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--gm-radius-md)',
                color: 'var(--gm-text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} strokeWidth={2} />
            </button>
            <span
              style={{
                fontSize: 'var(--gm-font-size-md)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--gm-text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              {pageTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              className="topbar-role-chip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: 'var(--gm-radius-full)',
                backgroundColor: 'var(--gm-primary-soft)',
                color: 'var(--gm-primary-dark)',
                border: '1px solid var(--gm-primary-border)',
                fontSize: 'var(--gm-font-size-xs)',
                fontWeight: 600,
                lineHeight: '16px',
              }}
            >
              {currentRoleLabel}
            </span>
            <span
              className="topbar-username"
              style={{
                fontSize: 'var(--gm-font-size-sm)',
                fontWeight: 600,
                color: 'var(--gm-text-secondary)',
                maxWidth: '140px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {username}
            </span>
            <span
              aria-hidden="true"
              style={{
                display: 'grid',
                placeItems: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gm-primary), var(--gm-primary-dark))',
                color: '#fff',
                fontSize: 'var(--gm-font-size-sm)',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                flexShrink: 0,
              }}
            >
              {initial}
            </span>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--gm-radius-md)',
                color: 'var(--gm-text-muted)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--gm-transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gm-danger-soft)';
                e.currentTarget.style.color = 'var(--gm-danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--gm-text-muted)';
              }}
            >
              <LogOut size={18} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
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
          .main-content { padding: 16px !important; }
          .topbar-username { display: none !important; }
          .topbar-role-chip { display: none !important; }
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
  initial: string;
  onLogout: () => void;
  onClose?: () => void;
  onNavigate?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navItems,
  currentPath,
  username,
  currentRoleLabel,
  initial,
  onLogout,
  onClose,
  onNavigate,
}) => (
  <>
    {/* Brand */}
    <div
      style={{
        minHeight: '64px',
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
        onClick={onNavigate}
        aria-label="GymMaster home"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
      >
        <BrandLogo size={32} />
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
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
            borderRadius: 'var(--gm-radius-md)',
            color: 'var(--gm-text-muted)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X size={18} strokeWidth={2} />
        </button>
      )}
    </div>

    {/* Section label */}
    <span
      style={{
        padding: '18px 20px 6px',
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(148,163,184,0.7)',
        flexShrink: 0,
      }}
    >
      Menu
    </span>

    {/* Nav Links */}
    <nav
      aria-label="Main navigation"
      style={{
        flex: 1,
        padding: '0 10px',
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
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              height: '40px',
              padding: '0 12px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: active ? 600 : 500,
              color: active ? '#fff' : 'var(--sidebar-text)',
              backgroundColor: active ? 'var(--sidebar-item-active)' : 'transparent',
              boxShadow: active ? '0 8px 16px -8px rgba(37,99,235,0.55)' : 'none',
              textDecoration: 'none',
              transition: `all var(--duration-fast) var(--ease)`,
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--sidebar-text)';
              }
            }}
          >
            <span style={{ flexShrink: 0, display: 'flex', color: active ? '#fff' : 'var(--color-neutral-400)' }}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>

    {/* User card + Logout */}
    <div
      style={{
        padding: '12px 10px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          marginBottom: '8px',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))',
            color: '#fff',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initial}
        </span>
        <span style={{ minWidth: 0 }}>
          <span
            style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {username}
          </span>
          <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-400)' }}>
            {currentRoleLabel}
          </span>
        </span>
      </div>
      <button
        onClick={onLogout}
        aria-label="Log out"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          height: '36px',
          padding: '0 10px',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 500,
          color: 'var(--sidebar-text)',
          textAlign: 'left',
          transition: `all var(--duration-fast) var(--ease)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)';
          e.currentTarget.style.color = '#fca5a5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--sidebar-text)';
        }}
      >
        <LogOut size={18} strokeWidth={2} />
        <span>Log out</span>
      </button>
    </div>
  </>
);
