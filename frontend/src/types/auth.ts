export type Role = 'Admin' | 'GymOwner' | 'Trainer';

export interface AdminLoginResponse {
  token: string;
  admin: {
    id: number;
    userName: string;
    email: string;
    role: string;
  };
}

export interface GymOwnerLoginResponse {
  token: string;
  gymOwner: {
    id: number;
    userName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    role: string;
  };
}

export interface TrainerLoginResponse {
  token: string;
  trainer: {
    id: number;
    userName: string;
    fullName: string;
    phoneNumber: string;
    gymId: number;
    isActive: boolean;
    role: string;
  };
}

export interface JwtPayload {
  nameid: string;
  OwnerId?: string;
  role: Role;
  exp: number;
}
