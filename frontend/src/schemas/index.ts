import { z } from 'zod';

// Public Schemas
export const gymOwnerApplicationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  userName: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gymName: z.string().min(2, 'Gym name is required'),
  gymAddress: z.string().min(5, 'Gym address is required'),
  gymPhoneNumber: z.string().min(10, 'Gym phone number is required'),
});

// Auth Schemas
export const loginSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Owner Schemas
export const createTrainerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  userName: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  salary: z.number().min(0, 'Salary must be a positive number'),
  address: z.string().min(5, 'Address is required'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  hireDate: z.string().min(1, 'Hire date is required'),
  gymId: z.number().min(1, 'Gym is required'),
});

export const updateTrainerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  salary: z.number().min(0, 'Salary must be a positive number'),
  address: z.string().min(5, 'Address is required'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export const createMembershipPlanSchema = z.object({
  gymId: z.number().min(1, 'Gym is required'),
  name: z.string().min(2, 'Plan name is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  isSessionBased: z.boolean(),
  durationInDays: z.number().min(0, 'Duration must be 0 or more'),
  numberOfSessions: z.number().min(0, 'Sessions must be 0 or more'),
}).refine(data => {
  if (data.isSessionBased && data.numberOfSessions <= 0) return false;
  if (!data.isSessionBased && data.durationInDays <= 0) return false;
  return true;
}, {
  message: "Either duration (for time-based) or sessions (for session-based) must be greater than 0",
  path: ["isSessionBased"]
});

// Trainer Schemas
export const createMemberSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  membershipPlanId: z.union([z.number().positive('Membership plan must be valid'), z.null()]).optional(),
});

export const updateMemberSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
});

export const createSubscriptionSchema = z.object({
  memberId: z.number().min(1, 'Member is required'),
  membershipPlanId: z.number().min(1, 'Plan is required'),
});

// Admin Schemas
export const rejectApplicationSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, 'Rejection reason is required')
    .min(5, 'Rejection reason must be between 5 and 500 characters')
    .max(500, 'Rejection reason must be between 5 and 500 characters'),
});

