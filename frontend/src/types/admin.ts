import type { ApplicationStatus } from './shared';

// ── Pagination (backend PagedResponseDto<T>) ─────────────────────────────
export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type SortDirection = 'asc' | 'desc';

// ── Dashboard (backend AdminDashboardResponseDto) ────────────────────────
export interface EntityStatusStatistics {
  total: number;
  active: number;
  inactive: number;
}

export interface ApplicationStatistics {
  pending: number;
  approved: number;
  rejected: number;
}

export interface AdminDashboardStats {
  owners: EntityStatusStatistics;
  gyms: EntityStatusStatistics;
  applications: ApplicationStatistics;
  totalTrainers: number;
  totalMembers: number;
}

// ── Applications ─────────────────────────────────────────────────────────
// Row shape of GET /api/admin/applications (ApplicationListResponseDto).
// `status` serializes as a number (enum) — normalize with
// normalizeApplicationStatus() from types/shared before rendering.
export interface ApplicationListItem {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  gymName: string;
  status: ApplicationStatus | string | number;
  createdAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

// Full shape of GET /api/admin/applications/{id} (GymOwnerApplicationResponseDto)
export interface ApplicationDetails extends ApplicationListItem {
  gymAddress: string;
  gymPhoneNumber: string;
}

/**
 * Application shape accepted by the admin modals — works with both list rows
 * (no gym address/phone) and full details objects.
 */
export type ApplicationModalData = ApplicationListItem &
  Partial<Pick<ApplicationDetails, 'gymAddress' | 'gymPhoneNumber'>>;

// Backend whitelist (GymOwnerApplicationService.GetPagedApplicationsAsync).
// Omitted → backend defaults to CreatedAt desc.
export type ApplicationSortBy = 'fullname' | 'status' | 'gymname';

export interface ApplicationListParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  sortBy?: ApplicationSortBy;
  sortDirection?: SortDirection;
}

// ── Owners ───────────────────────────────────────────────────────────────
// GET /api/admin/owners (OwnerListResponseDto)
export interface OwnerListItem {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  gymCount: number;
}

// GET /api/admin/owners/{id} (OwnerDetailsResponseDto)
export interface OwnerDetails extends OwnerListItem {
  activeGymCount: number;
  trainerCount: number;
  memberCount: number;
}

export type OwnerSortBy = 'fullname' | 'username' | 'email' | 'gymcount';

export interface OwnerListParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  sortBy?: OwnerSortBy;
  sortDirection?: SortDirection;
}

// ── Gyms ─────────────────────────────────────────────────────────────────
// GET /api/admin/gyms (GymListResponseDto)
export interface GymListItem {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  ownerId: number;
  ownerName: string;
  isActive: boolean;
  createdAt: string;
  trainerCount: number;
  memberCount: number;
}

// GET /api/admin/gyms/{id} (GymDetailsResponseDto)
export interface GymDetails extends GymListItem {
  ownerEmail: string;
  membershipPlanCount: number;
}

export type GymSortBy = 'name' | 'ownername' | 'trainercount' | 'membercount';

export interface GymListParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  ownerId?: number;
  sortBy?: GymSortBy;
  sortDirection?: SortDirection;
}