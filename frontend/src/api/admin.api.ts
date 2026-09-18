import { apiClient } from './client';
import type {
  PagedResponse,
  AdminDashboardStats,
  ApplicationListItem,
  ApplicationDetails,
  ApplicationListParams,
  OwnerListItem,
  OwnerDetails,
  OwnerListParams,
  GymListItem,
  GymDetails,
  GymListParams,
} from '../types/admin';

// Axios omits `undefined` query params, so optional filters are passed
// through as-is; whitespace-only search is normalized to no filter.
export const adminApi = {
  // ── Dashboard (Admin V2) ──────────────────────────────────────────────
  // GET /api/admin/dashboard → AdminDashboardResponseDto
  getDashboard: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  // ── Applications (Admin V2 — paged, searchable, filterable, sortable) ─
  // GET /api/admin/applications → PagedResponseDto<ApplicationListResponseDto>
  getApplicationsPaged: async (params: ApplicationListParams): Promise<PagedResponse<ApplicationListItem>> => {
    const res = await apiClient.get('/admin/applications', {
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        search: params.search?.trim() || undefined,
        status: params.status,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
      },
    });
    return res.data;
  },

  // GET /api/admin/applications/{id} → GymOwnerApplicationResponseDto
  getApplicationDetails: async (id: number): Promise<ApplicationDetails> => {
    const res = await apiClient.get(`/admin/applications/${id}`);
    return res.data;
  },

  // ── Owners (Admin V2) ─────────────────────────────────────────────────
  // GET /api/admin/owners → PagedResponseDto<OwnerListResponseDto>
  getOwnersPaged: async (params: OwnerListParams): Promise<PagedResponse<OwnerListItem>> => {
    const res = await apiClient.get('/admin/owners', {
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        search: params.search?.trim() || undefined,
        isActive: params.isActive,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
      },
    });
    return res.data;
  },

  // GET /api/admin/owners/{id} → OwnerDetailsResponseDto (404 → axios error)
  getOwnerDetails: async (id: number): Promise<OwnerDetails> => {
    const res = await apiClient.get(`/admin/owners/${id}`);
    return res.data;
  },

  // PATCH /api/admin/owners/{id}/activate | /deactivate → 204
  // 404 = unknown owner, 409 = already in the requested state.
  setOwnerStatus: async (id: number, active: boolean): Promise<void> => {
    await apiClient.patch(`/admin/owners/${id}/${active ? 'activate' : 'deactivate'}`);
  },

  // ── Gyms (Admin V2) ───────────────────────────────────────────────────
  // GET /api/admin/gyms → PagedResponseDto<GymListResponseDto>
  getGymsPaged: async (params: GymListParams): Promise<PagedResponse<GymListItem>> => {
    const res = await apiClient.get('/admin/gyms', {
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        search: params.search?.trim() || undefined,
        isActive: params.isActive,
        ownerId: params.ownerId,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
      },
    });
    return res.data;
  },

  // GET /api/admin/gyms/{id} → GymDetailsResponseDto (404 → axios error)
  getGymDetails: async (id: number): Promise<GymDetails> => {
    const res = await apiClient.get(`/admin/gyms/${id}`);
    return res.data;
  },

  // PATCH /api/admin/gyms/{id}/activate | /deactivate → 204
  setGymStatus: async (id: number, active: boolean): Promise<void> => {
    await apiClient.patch(`/admin/gyms/${id}/${active ? 'activate' : 'deactivate'}`);
  },

  // ── Application review mutations (V1 routes, unchanged by Admin V2) ────
  // POST /api/admin/gym-owner-applications/{id}/approve → 204
  approveApplication: async (id: number): Promise<void> => {
    await apiClient.post(`/admin/gym-owner-applications/${id}/approve`);
  },
  // POST /api/admin/gym-owner-applications/{id}/reject → 204
  rejectApplication: async (id: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/gym-owner-applications/${id}/reject`, { rejectionReason: reason });
  },
};
