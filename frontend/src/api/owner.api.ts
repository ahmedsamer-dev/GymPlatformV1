import { apiClient } from './client';
import type { Trainer, MembershipPlan, MemberDetails, GymSummary } from '../types/shared';

export const ownerApi = {
  getTrainers: async (): Promise<Trainer[]> => {
    const res = await apiClient.get('/owner/trainers');
    return res.data;
  },
  getTrainerById: async (id: number): Promise<Trainer> => {
    const res = await apiClient.get(`/owner/trainers/${id}`);
    return res.data;
  },
  createTrainer: async (data: any): Promise<Trainer> => {
    const res = await apiClient.post('/owner/trainers', data);
    return res.data;
  },
  updateTrainer: async (id: number, data: any): Promise<Trainer> => {
    const res = await apiClient.put(`/owner/trainers/${id}`, data);
    return res.data;
  },
  setTrainerStatus: async (id: number, active: boolean): Promise<void> => {
    await apiClient.patch(`/owner/trainers/${id}/status?active=${active}`);
  },
  getMyGyms: async (): Promise<GymSummary[]> => {
    const res = await apiClient.get('/owner/gyms');
    return res.data;
  },
  getMembershipPlans: async (): Promise<MembershipPlan[]> => {

    const res = await apiClient.get('/owner/membership-plans');
    return res.data;
  },
  createMembershipPlan: async (data: any): Promise<MembershipPlan> => {
    const res = await apiClient.post('/owner/membership-plans', data);
    return res.data;
  },
  getMemberById: async (id: number): Promise<MemberDetails> => {
    const res = await apiClient.get(`/owner/members/${id}`);
    return res.data;
  }
};
