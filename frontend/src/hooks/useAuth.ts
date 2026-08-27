import { useState, useEffect } from 'react';
import type { Role } from '../types/auth';
import { getUserRole } from '../utils/token';

export const useAuth = () => {
  const [role, setRole] = useState<Role | null>(getUserRole());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!role);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentRole = getUserRole();
      setRole(currentRole);
      setIsAuthenticated(!!currentRole);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('unauthorized', handleStorageChange);

    // Initial check
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('unauthorized', handleStorageChange);
    };
  }, []);

  const login = (token: string) => {
    localStorage.setItem('gym_token', token);
    const currentRole = getUserRole();
    setRole(currentRole);
    setIsAuthenticated(true);
    // Trigger storage event for other tabs (optional but good practice)
    window.dispatchEvent(new Event('storage'));
  };

  const logout = () => {
    localStorage.removeItem('gym_token');
    setRole(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('storage'));
  };

  return { isAuthenticated, role, login, logout };
};
