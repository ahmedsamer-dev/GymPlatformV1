import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types/auth';

interface RoleRouteProps {
  allowedRole: Role;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRole }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    // Redirect to their respective dashboard if they try to access wrong role
    if (role === 'Admin') return <Navigate to="/admin" replace />;
    if (role === 'GymOwner') return <Navigate to="/owner" replace />;
    if (role === 'Trainer') return <Navigate to="/trainer" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
