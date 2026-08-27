import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Users, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Applications', path: '/admin/applications', icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col shrink-0" style={{ backgroundColor: 'var(--color-neutral-900)' }}>
        <div className="h-16 flex items-center px-6 border-b border-neutral-800" style={{ borderColor: 'var(--color-neutral-800)' }}>
          <ShieldCheck className="text-primary-500 mr-3" style={{ color: 'var(--color-primary-500)' }} />
          <span className="font-bold text-lg tracking-wide text-white">Admin Panel</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
                style={isActive ? { backgroundColor: 'var(--color-primary-600)' } : undefined}
              >
                <span className={`mr-3 ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800" style={{ borderColor: 'var(--color-neutral-800)' }}>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 rounded-md text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <LogOut size={20} className="mr-3 text-neutral-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 shrink-0 shadow-sm" style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold text-lg" style={{ color: 'var(--color-neutral-900)' }}>
            Welcome, Administrator
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
