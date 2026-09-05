export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 1 | 2 | 3;

export interface GymOwnerApplication {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  gymName: string;
  gymAddress: string;
  gymPhoneNumber: string;
  status: ApplicationStatus | string | number;
  createdAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

export function normalizeApplicationStatus(status: ApplicationStatus | string | number | undefined | null): 'Pending' | 'Approved' | 'Rejected' {
  if (status === 1 || status === '1' || status === 'Pending' || status === 'pending') {
    return 'Pending';
  }
  if (status === 2 || status === '2' || status === 'Approved' || status === 'approved') {
    return 'Approved';
  }
  if (status === 3 || status === '3' || status === 'Rejected' || status === 'rejected') {
    return 'Rejected';
  }
  return 'Pending';
}

export interface Trainer {
  id: number;
  fullName: string;
  userName: string;
  phoneNumber: string;
  salary: number;
  address: string;
  imageUrl: string;
  hireDate: string;
  isActive: boolean;
  gymId: number;
  gymName: string;
  ownerId: number;
}

export interface MembershipPlan {
  id: number;
  gymId: number;
  name: string;
  price: number;
  durationInDays: number;
  isSessionBased: boolean;
  numberOfSessions: number;
  createdAt: string;
}

export interface GymSummary {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
}

export interface Member {

  id: number;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
  trainerId: number;
  gymId: number;
}

export interface CreateMemberRequestDto {
  fullName: string;
  phoneNumber: string;
  membershipPlanId?: number | null;
}

export interface MemberDetails {
  id: number;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
  trainerId: number;
  trainerName?: string | null;
  gymId: number;
  gymName?: string | null;
}

export type SubscriptionStatus = 'Pending' | 'Active' | 'Expired' | 'Cancelled' | 1 | 2 | 3 | 4;

export function normalizeSubscriptionStatus(
  status: SubscriptionStatus | string | number | undefined | null
): 'Pending' | 'Active' | 'Expired' | 'Cancelled' {
  if (status === 1 || status === '1' || status === 'Pending' || status === 'pending') {
    return 'Pending';
  }
  if (status === 2 || status === '2' || status === 'Active' || status === 'active') {
    return 'Active';
  }
  if (status === 3 || status === '3' || status === 'Expired' || status === 'expired') {
    return 'Expired';
  }
  if (status === 4 || status === '4' || status === 'Cancelled' || status === 'cancelled') {
    return 'Cancelled';
  }
  return 'Active';
}

export interface Subscription {
  id: number;
  memberId: number;
  membershipPlanId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: SubscriptionStatus | string | number;
  remainingSessions: number;
  createdAt: string;
  memberName: string;
  membershipPlanName: string;
}
