import { apiClient } from './client';
import type {
  AdminLoginResponse,
  GymOwnerLoginResponse,
  TrainerLoginResponse,
  RefreshTokenResponse,
} from '../types/auth';

export interface LoginCredentials {
  userName: string;
  password: string;
}

export const authApi = {
  // POST /api/auth/admin/login → 200 AdminLoginResponseDto | 401 (failed)
  adminLogin: async (data: LoginCredentials): Promise<AdminLoginResponse> => {
    const response = await apiClient.post('/auth/admin/login', data);
    return response.data;
  },
  // POST /api/auth/owner/login → 200 GymOwnerLoginResponseDto | 400 (failed)
  ownerLogin: async (data: LoginCredentials): Promise<GymOwnerLoginResponse> => {
    const response = await apiClient.post('/auth/owner/login', data);
    return response.data;
  },
  // POST /api/auth/trainer/login → 200 TrainerLoginResponseDto | 400 (failed)
  trainerLogin: async (data: LoginCredentials): Promise<TrainerLoginResponse> => {
    const response = await apiClient.post('/auth/trainer/login', data);
    return response.data;
  },
  // POST /api/auth/refresh → 200 AuthTokenResult (rotated tokens) | 401
  refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
  // POST /api/auth/revoke → 204 | 401
  revoke: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/revoke', { refreshToken });
  },
};
