import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Building,
  Dumbbell,
  Edit2,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { trainerApi } from '../../api/trainer.api';
import { updateMemberSchema } from '../../schemas';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import type { MemberDetails } from '../../types/shared';

type UpdateMemberFormValues = z.infer<typeof updateMemberSchema>;

export const TrainerMemberDetailsPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const numericMemberId = Number(memberId);
  const isValidId = !isNaN(numericMemberId) && numericMemberId > 0;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editServerError, setEditServerError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch Member Details
  const {
    data: details,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trainer', 'members', memberId],
    queryFn: () => trainerApi.getMemberById(numericMemberId),
    enabled: isValidId,
    retry: 1,
  });

  // Edit Member Form
  const editForm = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberSchema),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateMemberFormValues) => {
      return trainerApi.updateMember(numericMemberId, {
        fullName: data.fullName.trim(),
        phoneNumber: data.phoneNumber.trim(),
      });
    },
    onSuccess: (updatedData: MemberDetails) => {
      queryClient.setQueryData(['trainer', 'members', memberId], updatedData);
      queryClient.invalidateQueries({ queryKey: ['trainer', 'members'] });
      setIsEditModalOpen(false);
      setEditServerError(null);
      toast.success('Member details updated successfully.');
    },
    onError: (err: any) => {
      const status = err.response?.status;
      let message = 'Failed to update member details.';

      if (status === 400) {
        message = err.response?.data?.message || 'Invalid member information.';
      } else if (status === 401) {
        message = 'Your session has expired. Please log in again.';
      } else if (status === 403) {
        message = 'You do not have permission to update this member.';
      } else if (status === 404) {
        message = 'Member not found.';
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      setEditServerError(message);
      toast.error(message);
    },
  });

  const openEditModal = () => {
    if (details) {
      editForm.reset({
        fullName: details.fullName,
        phoneNumber: details.phoneNumber,
      });
      setEditServerError(null);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = (data: UpdateMemberFormValues) => {
    setEditServerError(null);
    updateMutation.mutate(data);
  };

  if (!isValidId) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <Link
          to="/trainer/members"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-primary-600)',
            fontWeight: 500,
            marginBottom: '16px',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Members
        </Link>
        <ErrorState
          title="Invalid Member ID"
          message="The requested member identifier is invalid."
        />
      </div>
    );
  }

  if (isLoading) return <Spinner fullPage />;

  if (isError) {
    const status = (error as any)?.response?.status;
    let errorTitle = 'Unable to Load Member';
    let errorMsg = 'An unexpected error occurred while loading member details.';

    if (status === 401) {
      errorTitle = 'Authentication Required';
      errorMsg = 'Your session has expired. Please log in again.';
    } else if (status === 403) {
      errorTitle = 'Access Denied';
      errorMsg = 'You do not have permission to view this member.';
    } else if (status === 404) {
      errorTitle = 'Member Not Found';
      errorMsg = 'The requested member does not exist or is not assigned to your account.';
    } else if ((error as any)?.response?.data?.message) {
      errorMsg = (error as any).response.data.message;
    }

    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <Link
          to="/trainer/members"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-primary-600)',
            fontWeight: 500,
            marginBottom: '16px',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Members
        </Link>
        <ErrorState title={errorTitle} message={errorMsg} onRetry={refetch} />
      </div>
    );
  }

  if (!details) return null;

  const joinedFormatted = details.createdAt
    ? new Date(details.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          to="/trainer/members"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-primary-600)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Members
        </Link>

        <Link
          to="/trainer/subscriptions"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <CreditCard size={15} /> View Subscriptions
        </Link>
      </div>

      {/* Main Profile Card */}
      <Card padding="lg">
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            paddingBottom: '20px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--color-border)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-600)',
                flexShrink: 0,
              }}
            >
              <User size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 700,
                    color: 'var(--color-text-main)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {details.fullName}
                </h1>
                <Badge variant="neutral">Member #{details.id}</Badge>
              </div>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)',
                  marginTop: '4px',
                  marginBottom: 0,
                }}
              >
                Member since {joinedFormatted}
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={openEditModal}>
            <Edit2 size={14} /> Edit Member
          </Button>
        </div>

        {/* Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Phone Number */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-bg-surface-secondary, var(--color-neutral-50))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Phone size={14} style={{ color: 'var(--color-primary-600)' }} />
              Phone Number
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
              }}
            >
              {details.phoneNumber}
            </span>
          </div>

          {/* Assigned Trainer */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-bg-surface-secondary, var(--color-neutral-50))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Dumbbell size={14} style={{ color: 'var(--color-primary-600)' }} />
              Assigned Trainer
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
              }}
            >
              {details.trainerName || `Trainer #${details.trainerId}`}
            </span>
          </div>

          {/* Gym */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-bg-surface-secondary, var(--color-neutral-50))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Building size={14} style={{ color: 'var(--color-primary-600)' }} />
              Gym
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
              }}
            >
              {details.gymName || `Gym #${details.gymId}`}
            </span>
          </div>

          {/* Joined Date */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-bg-surface-secondary, var(--color-neutral-50))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Calendar size={14} style={{ color: 'var(--color-primary-600)' }} />
              Joined Date
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
              }}
            >
              {joinedFormatted}
            </span>
          </div>
        </div>
      </Card>

      {/* Edit Member Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditServerError(null);
        }}
        title="Edit Member"
        size="sm"
      >
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            marginBottom: '16px',
            marginTop: '-4px',
          }}
        >
          Update member contact information.
        </p>

        {editServerError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-50)',
              border: '1px solid var(--color-danger-200)',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--color-danger-600)', flexShrink: 0 }} />
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-700)', margin: 0 }}>
              {editServerError}
            </p>
          </div>
        )}

        <form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              {...editForm.register('fullName')}
              error={editForm.formState.errors.fullName?.message}
            />

            <Input
              label="Phone Number"
              placeholder="e.g. 01012345678"
              {...editForm.register('phoneNumber')}
              error={editForm.formState.errors.phoneNumber?.message}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              paddingTop: '20px',
              marginTop: '20px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditServerError(null);
              }}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

