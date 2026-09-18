// ── Roles ──────────────────────────────────────────────────────────────
export type Role = 'Admin' | 'GymOwner' | 'Trainer';

// ── Auth API contracts (mirror backend DTOs, camelCase JSON) ───────────

// Backend: AdminLoginResponseDto (AdminAuthService → AuthController)
export interface AdminLoginResponse {
  success: boolean;
  message?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  admin?: {
    id: number;
    fullName?: string | null;
    userName?: string | null;
    email?: string | null;
  } | null;
}

// Backend: GymOwnerLoginResponseDto (info object is `owner`)
export interface GymOwnerLoginResponse {
  success: boolean;
  message?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  owner?: {
    id: number;
    fullName?: string | null;
    userName?: string | null;
    email?: string | null;
  } | null;
}

// Backend: TrainerLoginResponseDto
export interface TrainerLoginResponse {
  success: boolean;
  message?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  trainer?: {
    id: number;
    fullName?: string | null;
    userName?: string | null;
    gymId?: number | null;
  } | null;
}

// Backend: AuthTokenResult — returned by POST /auth/refresh
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ── JWT payload (as issued by the backend TokenService) ────────────────
// Claims: nameid, unique_name, role, email, FullName,
//         OwnerId (GymOwner tokens only), GymId (Trainer tokens only).
export interface JwtPayload {
  nameid?: string;
  unique_name?: string;
  FullName?: string;
  email?: string;
  OwnerId?: string;
  GymId?: string;
  role?: Role | string;
  exp?: number;
}
