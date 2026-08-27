import { apiClient } from './client';
import type { GymOwnerApplication } from '../types/shared';

export const publicApi = {
  submitGymOwnerApplication: async (data: any): Promise<GymOwnerApplication> => {
    const res = await apiClient.post('/gym-owner-applications', data);
    return res.data;
  }
};
