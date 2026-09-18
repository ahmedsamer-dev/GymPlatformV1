import type { JwtPayload, Role } from '../types/auth';

export const ACCESS_TOKEN_KEY = 'gym_token';
export const REFRESH_TOKEN_KEY = 'gym_refresh_token';

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

/** Persists the session tokens. A null/undefined refresh token keeps the existing one (e.g. after refresh-rotation). */
export const setTokens = (accessToken: string, refreshToken?: string | null): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/** Removes both session tokens (logout / dead session). */
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
};

export const getUserRole = (): Role | null => {
  const token = getAccessToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) {
    clearTokens();
    return null;
  }
  // Access token expired. If a refresh token exists, keep the provisional role
  // so the app can render — the axios interceptor will transparently refresh
  // on the first 401 (or fully log out if the refresh fails). Without a
  // refresh token the session is dead, so clear everything.
  const isExpired = typeof decoded.exp === 'number' && decoded.exp * 1000 < Date.now();
  if (isExpired && !getRefreshToken()) {
    clearTokens();
    return null;
  }
  // ASP.NET Core maps ClaimTypes.Role when issuing, but the long-form claim
  // name is handled defensively for robustness.
  const roleClaim =
    decoded.role ||
    (decoded as Record<string, unknown>)['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  return (roleClaim as Role) ?? null;
};
