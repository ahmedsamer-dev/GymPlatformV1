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
          padding: 'var(--sp-6)',
        }}
      >
        <div
          style={{
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            padding: 'var(--sp-8)',
            animation: 'slide-up var(--duration-slow) var(--ease)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-success-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle2 size={28} style={{ color: 'var(--color-success-600)' }} />
          </div>
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              marginBottom: '8px',
            }}
          >
            Application Submitted
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-relaxed)',
              marginBottom: '24px',
            }}
          >
            Thank you for applying. Our admin team will review your application and contact you soon.
          </p>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button style={{ width: '100%' }}>Return Home</Button>
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
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div style={{ maxWidth: '600px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              marginBottom: '6px',
            }}
          >
            Apply for Gym Ownership
          </h1>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)' }}>
            Fill out the details below to start managing your gym on GymMaster.
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--sp-6)',
            animation: 'slide-up var(--duration-slow) var(--ease)',
          }}
        >
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

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Info */}
            <fieldset style={{ border: 'none', padding: 0, margin: 0, marginBottom: '24px' }}>
              <legend
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-main)',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--color-border)',
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
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-main)',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--color-border)',
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
                gap: '8px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
              <Button type="submit" isLoading={mutation.isPending}>
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
