import React from 'react';
import { Badge } from '../ui/Badge';

/** Green "Active" / gray "Inactive" pill for boolean entity status. */
export const ActiveBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <Badge variant={isActive ? 'success' : 'neutral'}>{isActive ? 'Active' : 'Inactive'}</Badge>
);