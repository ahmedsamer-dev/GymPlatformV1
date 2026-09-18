import React, { useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { publicApi } from '../../api/public.api';
import { gymOwnerApplicationSchema } from '../../schemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BrandLogo } from '../../components/brand/BrandLogo';

type ApplicationFormValues = z.infer<typeof gymOwnerApplicationSchema>;

export const ApplyPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useHookForm<ApplicationFormValues>({
    resolver: zodResolver(gymOwnerApplicationSchema),
  });

  const mutation = useMutation({
    mutationFn: publicApi.submitGymOwnerApplication,
    onSuccess: () => {
      setIsSuccess(true);
      setServerError(null);
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    },
  });

  const onSubmit = (data: ApplicationFormValues) => {
    mutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          backgroundColor: 'var(--gm-bg)',
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'var(--gm-surface)',
            borderRadius: 'var(--gm-radius-xl)',
            border: '1px solid var(--gm-border)',
            boxShadow: 'var(--gm-shadow-md)',
            padding: '36px 32px',
            animation: 'slide-up var(--gm-transition-normal)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--gm-radius-full)',
              backgroundColor: 'var(--gm-success-soft)',
              border: '1px solid var(--gm-success-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle2 size={30} strokeWidth={2} style={{ color: 'var(--gm-success)' }} />
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--gm-text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '10px',
            }}
          >
            Application Submitted
          </h2>
          <p
            style={{
              fontSize: 'var(--gm-font-size-base)',
              color: 'var(--gm-text-secondary)',
              lineHeight: 1.55,
              marginBottom: '28px',
            }}
          >
            Thank you for applying. Our admin team will review your application and contact you soon.
          </p>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button size="lg" style={{ width: '100%' }}>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 24px',
        backgroundColor: 'var(--gm-bg)',
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%' }}>
        {/* Form Card — mirrors the Login card */}
        <div
          style={{
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
              Become a Gym Owner
            </h1>
            <p
              style={{
                fontSize: 'var(--gm-font-size-sm)',
                color: 'var(--gm-text-secondary)',
                marginTop: '6px',
              }}
            >
              Apply to manage your gym with GymMaster.
            </p>
          </div>

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

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Info */}
            <fieldset style={{ border: 'none', padding: 0, margin: 0, marginBottom: '24px' }}>
              <legend
                style={{
                  fontSize: 'var(--gm-font-size-sm)',
                  fontWeight: 700,
                  color: 'var(--gm-text-primary)',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--gm-border)',
                  display: 'block',
                  width: '100%',
                }}
              >
                Personal Information
              </legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <Input label="Full Name" {...register('fullName')} error={errors.fullName?.message} placeholder="John Doe" />
                <Input label="Username" {...register('userName')} error={errors.userName?.message} placeholder="johndoe" />
                <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="john@example.com" />
                <Input label="Phone Number" {...register('phoneNumber')} error={errors.phoneNumber?.message} placeholder="01234567890" />
              </div>
              <div style={{ marginTop: '16px' }}>
                <Input label="Password" type="password" {...register('password')} error={errors.password?.message} placeholder="Create a secure password" />
              </div>
            </fieldset>

            {/* Gym Info */}
            <fieldset style={{ border: 'none', padding: 0, margin: 0, marginBottom: '24px' }}>
              <legend
                style={{
                  fontSize: 'var(--gm-font-size-sm)',
                  fontWeight: 700,
                  color: 'var(--gm-text-primary)',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--gm-border)',
                  display: 'block',
                  width: '100%',
                }}
              >
                Gym Details
              </legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <Input label="Gym Name" {...register('gymName')} error={errors.gymName?.message} placeholder="Iron Fitness" />
                <Input label="Gym Phone" {...register('gymPhoneNumber')} error={errors.gymPhoneNumber?.message} placeholder="01234567890" />
              </div>
              <div style={{ marginTop: '16px' }}>
                <Input label="Gym Address" {...register('gymAddress')} error={errors.gymAddress?.message} placeholder="123 Fitness St, Workout City" />
              </div>
            </fieldset>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                paddingTop: '20px',
                borderTop: '1px solid var(--gm-border)',
              }}
            >
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
              <Button type="submit" size="md" isLoading={mutation.isPending}>
                Submit Application
              </Button>
            </div>
          </form>

          {/* Footer link — mirrors the Login card */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--gm-border)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 'var(--gm-font-size-sm)', color: 'var(--gm-text-secondary)', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--gm-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
