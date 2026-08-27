import { apiClient } from './client';
import type { AdminLoginResponse, GymOwnerLoginResponse, TrainerLoginResponse } from '../types/auth';

export const authApi = {
  adminLogin: async (data: any): Promise<AdminLoginResponse> => {
    const response = await apiClient.post('/auth/admin/login', data);
    return response.data;
  },
  ownerLogin: async (data: any): Promise<GymOwnerLoginResponse> => {
    const response = await apiClient.post('/auth/owner/login', data);
    return response.data;
  },
  trainerLogin: async (data: any): Promise<TrainerLoginResponse> => {
    const response = await apiClient.post('/auth/trainer/login', data);
    return response.data;
  },
};
