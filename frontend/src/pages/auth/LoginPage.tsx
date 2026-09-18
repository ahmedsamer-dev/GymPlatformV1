import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../utils/apiError';
import { loginSchema } from '../../schemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { decodeToken } from '../../utils/token';

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setServerError(null);

    // Error classification for the login cascade:
    //  - "inactive" messages from ANY role attempt are meaningful and win
    //    (inactive Owner/Trainer/Admin account, Gym, or GymOwner) — a later
    //    attempt's generic credentials message must never overwrite them.
    //  - Any other backend message is remembered as the last explanation.
    //  - Network failures and 5xx responses bubble to the outer handler,
    //    which shows a safe generic server/network message.
    let inactiveMessage: string | null = null;
    let lastMessage: string | null = null;

    const recordFailure = (raw?: string | null) => {
      if (typeof raw !== 'string') return;
      const message = raw.trim();
      if (!message) return;
      if (/inactive/i.test(message)) {
        if (!inactiveMessage) inactiveMessage = message;
      } else {
        lastMessage = message;
      }
    };

    try {
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      // Try Owner Login. A 4xx answer with a message means "try next role";
      // only network failures and server errors (5xx) abort the cascade.
      try {
        const ownerRes = await authApi.ownerLogin(data);
        if (ownerRes.success && ownerRes.accessToken) {
          accessToken = ownerRes.accessToken;
          refreshToken = ownerRes.refreshToken ?? null;
        } else {
          recordFailure(ownerRes.message);
        }
      } catch (err: any) {
        const status: number | undefined = err?.response?.status;
        if (status === undefined || status >= 500) throw err;
        recordFailure(err?.response?.data?.message);
      }

      // Try Trainer Login
      if (!accessToken) {
        try {
          const trainerRes = await authApi.trainerLogin(data);
          if (trainerRes.success && trainerRes.accessToken) {
            accessToken = trainerRes.accessToken;
            refreshToken = trainerRes.refreshToken ?? null;
          } else {
            recordFailure(trainerRes.message);
          }
        } catch (err: any) {
          const status: number | undefined = err?.response?.status;
          if (status === undefined || status >= 500) throw err;
          recordFailure(err?.response?.data?.message);
        }
      }

      // Try Admin Login
      if (!accessToken) {
        try {
          const adminRes = await authApi.adminLogin(data);
          if (adminRes.success && adminRes.accessToken) {
            accessToken = adminRes.accessToken;
            refreshToken = adminRes.refreshToken ?? null;
          } else {
            recordFailure(adminRes.message);
          }
        } catch (err: any) {
          const status: number | undefined = err?.response?.status;
          if (status === undefined || status >= 500) throw err;
          recordFailure(err?.response?.data?.message);
        }
      }

      if (accessToken) {
        login(accessToken, refreshToken);
        const decoded = decodeToken(accessToken);
        const from = (location.state as any)?.from?.pathname;

        if (from && from !== '/') {
          navigate(from, { replace: true });
        } else {
          const role = decoded?.role || (decoded as any)['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          if (role === 'Admin') navigate('/admin', { replace: true });
          else if (role === 'GymOwner') navigate('/owner', { replace: true });
          else if (role === 'Trainer') navigate('/trainer', { replace: true });
          else navigate('/', { replace: true });
        }
      } else {
        // Prefer a meaningful backend explanation captured from any role
        // attempt (e.g. "GymOwner account is inactive"), then the last
        // backend message, then the generic credentials text.
        setServerError(inactiveMessage || lastMessage || 'Invalid username or password.');
      }
    } catch (error) {
      // Network failure or server error — safe, generic message only.
      setServerError(
        getApiErrorMessage(error, 'Unable to sign in right now. Please check your connection and try again.'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        backgroundColor: 'var(--gm-bg)',
        minHeight: 'calc(100vh - 130px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--gm-surface)',
          borderRadius: 'var(--gm-radius-xl)',
          border: '1px solid var(--gm-border)',
          boxShadow: 'var(--gm-shadow-md)',
          padding: '36px 32px',
          animation: 'slide-up var(--gm-transition-normal)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <BrandLogo size={48} />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--gm-text-primary)',
              letterSpacing: '-0.025em',
              margin: 0,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: 'var(--gm-font-size-sm)',
              color: 'var(--gm-text-secondary)',
              marginTop: '6px',
            }}
          >
            Sign in to your GymMaster account
          </p>
        </div>

        {/* Error */}
        {serverError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: 'var(--gm-radius-md)',
              backgroundColor: 'var(--gm-danger-soft)',
              border: '1px solid var(--gm-danger-border)',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} strokeWidth={2} style={{ color: 'var(--gm-danger)', flexShrink: 0 }} />
            <p style={{ fontSize: 'var(--gm-font-size-sm)', fontWeight: 500, color: 'var(--gm-danger)', margin: 0, lineHeight: 1.4 }}>
              {serverError}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Input
            label="Username"
            {...register('userName')}
            error={errors.userName?.message}
            autoComplete="username"
            placeholder="Enter your username"
          />
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            autoComplete="current-password"
            placeholder="••••••••"
          />
          <Button type="submit" size="lg" isLoading={isLoading} style={{ width: '100%', marginTop: '6px' }}>
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--gm-border)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 'var(--gm-font-size-sm)', color: 'var(--gm-text-secondary)', margin: 0 }}>
            Don't have an account?{' '}
            <Link
              to="/apply"
              style={{
                color: 'var(--gm-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Apply to become a Gym Owner
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
