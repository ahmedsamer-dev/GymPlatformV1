export interface GymOwnerApplication {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  gymName: string;
  gymAddress: string;
  gymPhoneNumber: string;
  status: string;
  createdAt: string;
  rejectionReason?: string;
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
  member: {
    id: number;
    fullName: string;
    phoneNumber: string;
    createdAt: string;
  };
  trainer: {
    id: number;
    fullName: string;
  };
  gym: {
    id: number;
    name: string;
  };
}

export interface Subscription {
  id: number;
  memberId: number;
  membershipPlanId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  remainingSessions: number;
  createdAt: string;
  memberName: string;
  membershipPlanName: string;
}
