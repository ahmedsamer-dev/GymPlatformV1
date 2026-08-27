import type { JwtPayload, Role } from '../types/auth';

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
  } catch (error) {
    return null;
  }
};

export const getUserRole = (): Role | null => {
  const token = localStorage.getItem('gym_token');
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  // Check expiration
  if (decoded.exp * 1000 < Date.now()) {
    localStorage.removeItem('gym_token');
    return null;
  }
  // Standard ASP.NET Core role claim might be standard claim type, or lowercase 'role'
  const roleClaim = decoded.role || (decoded as any)['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  return roleClaim as Role;
};
