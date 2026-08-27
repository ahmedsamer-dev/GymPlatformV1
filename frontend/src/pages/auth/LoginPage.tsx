import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Dumbbell } from 'lucide-react';
import { authApi } from '../../api/auth.api';
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

    try {
      let token = null;

      // Try Owner Login
      try {
        const ownerRes = await authApi.ownerLogin(data);
        token = ownerRes.token;
      } catch (err: any) {
        if (err.response?.status !== 401 && err.response?.status !== 400 && err.response?.status !== 404) {
          throw err;
        }
      }

      // Try Trainer Login
      if (!token) {
        try {
          const trainerRes = await authApi.trainerLogin(data);
          token = trainerRes.token;
        } catch (err: any) {
          if (err.response?.status !== 401 && err.response?.status !== 400 && err.response?.status !== 404) {
            throw err;
          }
        }
      }

      // Try Admin Login
      if (!token) {
        try {
          const adminRes = await authApi.adminLogin(data);
          token = adminRes.token;
        } catch (err: any) {
          if (err.response?.status !== 401 && err.response?.status !== 400 && err.response?.status !== 404) {
            throw err;
          }
        }
      }

      if (token) {
        login(token);
        const decoded = decodeToken(token);
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
        setServerError('Invalid username or password.');
      }
    } catch (error: any) {
      setServerError('An unexpected error occurred. Please try again.');
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
        padding: 'var(--sp-6)',
        backgroundColor: 'var(--color-bg-base)',
        minHeight: 'calc(100vh - 130px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--sp-8)',
          animation: 'slide-up var(--duration-slow) var(--ease)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Dumbbell size={22} style={{ color: 'var(--color-primary-600)' }} />
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              margin: 0,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginTop: '4px',
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
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-50)',
              border: '1px solid var(--color-danger-200)',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--color-danger-600)', flexShrink: 0 }} />
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-700)', margin: 0 }}>
              {serverError}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <Button type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: '4px' }}>
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            Don't have an account?{' '}
            <Link
              to="/apply"
              style={{
                color: 'var(--color-primary-600)',
                fontWeight: 500,
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
