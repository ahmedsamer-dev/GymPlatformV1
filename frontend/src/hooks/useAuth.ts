import { useState, useEffect } from 'react';
import type { Role } from '../types/auth';
import { getUserRole, getRefreshToken, setTokens, clearTokens } from '../utils/token';
import { authApi } from '../api/auth.api';

export const useAuth = () => {
  const [role, setRole] = useState<Role | null>(getUserRole());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!role);

  useEffect(() => {
    const handleAuthChange = () => {
      const currentRole = getUserRole();
      setRole(currentRole);
      setIsAuthenticated(!!currentRole);
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('unauthorized', handleAuthChange);

    // Initial check
    handleAuthChange();

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('unauthorized', handleAuthChange);
    };
  }, []);

  const login = (accessToken: string, refreshToken?: string | null) => {
    setTokens(accessToken, refreshToken);
    const currentRole = getUserRole();
    setRole(currentRole);
    setIsAuthenticated(!!currentRole);
    // Trigger storage event for other tabs (optional but good practice)
    window.dispatchEvent(new Event('storage'));
  };

  const logout = () => {
    // Best-effort server-side revoke of the refresh token. The endpoint is
    // token-based (no JWT required), so this also works with an expired
    // access token; failures (network/401) are deliberately ignored — the
    // local session ends regardless.
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      authApi.revoke(refreshToken).catch(() => {});
    }

    clearTokens();
    setRole(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('storage'));
  };

  return { isAuthenticated, role, login, logout };
};
