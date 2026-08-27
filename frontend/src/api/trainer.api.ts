import { apiClient } from './client';
import type { Member, MemberDetails, MembershipPlan, Subscription, CreateMemberRequestDto } from '../types/shared';

export const trainerApi = {
  getMembers: async (search?: { name?: string; phone?: string }): Promise<Member[]> => {
    const params = new URLSearchParams();
    if (search?.name) params.append('name', search.name);
    if (search?.phone) params.append('phone', search.phone);
    const res = await apiClient.get(`/trainer/members?${params.toString()}`);
    return res.data;
  },
  getMemberById: async (id: number): Promise<MemberDetails> => {
    const res = await apiClient.get(`/trainer/members/${id}`);
    return res.data;
  },
  createMember: async (data: CreateMemberRequestDto): Promise<Member> => {
    const res = await apiClient.post('/trainer/members', data);
    return res.data;
  },
  updateMember: async (id: number, data: any): Promise<MemberDetails> => {
    const res = await apiClient.put(`/trainer/members/${id}`, data);
    return res.data;
  },
  getMembershipPlans: async (): Promise<MembershipPlan[]> => {
    const res = await apiClient.get('/trainer/membership-plans');
    return res.data;
  },
  getSubscriptions: async (): Promise<Subscription[]> => {
    const res = await apiClient.get('/trainer/subscriptions');
    return res.data;
  },
  createSubscription: async (data: { memberId: number, membershipPlanId: number }): Promise<Subscription> => {
    const res = await apiClient.post('/trainer/subscriptions', data);
    return res.data;
  },
  useSession: async (subscriptionId: number): Promise<Subscription> => {
    const res = await apiClient.post(`/trainer/subscriptions/${subscriptionId}/use-session`);
    return res.data;
  }
};
