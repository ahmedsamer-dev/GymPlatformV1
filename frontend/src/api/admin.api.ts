import { apiClient } from './client';
import type { GymOwnerApplication } from '../types/shared';

export const adminApi = {
  getApplications: async (): Promise<GymOwnerApplication[]> => {
    const res = await apiClient.get('/admin/gym-owner-applications');
    return res.data;
  },
  getPendingApplications: async (): Promise<GymOwnerApplication[]> => {
    const res = await apiClient.get('/admin/gym-owner-applications/pending');
    return res.data;
  },
  approveApplication: async (id: number): Promise<void> => {
    await apiClient.post(`/admin/gym-owner-applications/${id}/approve`);
  },
  rejectApplication: async (id: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/gym-owner-applications/${id}/reject`, { rejectionReason: reason });
  }
};
