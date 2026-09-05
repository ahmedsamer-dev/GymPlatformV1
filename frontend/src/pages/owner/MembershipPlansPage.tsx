import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Building2 } from 'lucide-react';
import { ownerApi } from '../../api/owner.api';
import { createMembershipPlanSchema } from '../../schemas';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';

type CreatePlanFormValues = z.infer<typeof createMembershipPlanSchema>;

export const MembershipPlansPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  // ─── Membership Plans ───────────────────────────────────────────────────────
  const { data: plans, isLoading, isError, refetch } = useQuery({
    queryKey: ['owner', 'membership-plans'],
    queryFn: () => ownerApi.getMembershipPlans(),
  });

  // ─── Owner's Gyms ───────────────────────────────────────────────────────────
  // Fetched from GET /api/owner/gyms — only returns gyms the authenticated
  // Owner actually owns. The JWT bearer token is sent automatically.
  // We fetch on mount so the selector is ready when the modal opens.
  const {
    data: gyms,
    isLoading: isGymsLoading,
    isError: isGymsError,
  } = useQuery({
    queryKey: ['owner', 'gyms'],
    queryFn: () => ownerApi.getMyGyms(),
  });

  // ─── Form ────────────────────────────────────────────────────────────────────
  const createForm = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createMembershipPlanSchema),
    defaultValues: {
      gymId: 0,
      isSessionBased: false,
      durationInDays: 30,
      numberOfSessions: 0,
    },
  });

  const isSessionBased = createForm.watch('isSessionBased');
  const selectedGymId = createForm.watch('gymId');

  // Auto-select the gym when the owner has exactly one
  useEffect(() => {
    if (gyms && gyms.length === 1) {
      createForm.setValue('gymId', gyms[0].id, { shouldValidate: true });
    }
  }, [gyms, createForm]);

  // Reset the form (including gymId) when the modal is closed
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    createForm.reset({
      gymId: gyms?.length === 1 ? gyms[0].id : 0,
      isSessionBased: false,
      durationInDays: 30,
      numberOfSessions: 0,
    });
  };

  // ─── Mutation ────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: ownerApi.createMembershipPlan,
    onSuccess: () => {
      // Invalidate only the plans list — no full-page reload
      queryClient.invalidateQueries({ queryKey: ['owner', 'membership-plans'] });
      handleCloseModal();
      toast.success('Membership plan created successfully.');
    },
    onError: (error: any) => {
      const serverMessage =
        error?.response?.data?.message ||
        (error?.response?.status === 403
          ? 'You do not have permission to create a plan in this gym.'
          : error?.response?.status === 404
          ? 'Selected gym not found or does not belong to your account.'
          : 'Failed to create membership plan. Please try again.');
      toast.error(serverMessage);
    },
  });

  const handleCreateSubmit = (data: CreatePlanFormValues) => {
    createMutation.mutate(data);
  };

  // ─── Gym selector helpers ────────────────────────────────────────────────────
  const hasNoGyms = !isGymsLoading && !isGymsError && gyms !== undefined && gyms.length === 0;
  const hasSingleGym = gyms?.length === 1;
  const hasMultipleGyms = (gyms?.length ?? 0) > 1;

  // Build options for the Select component
  const gymOptions = gyms
    ? gyms.map((gym) => ({
        label: gym.address ? `${gym.name} — ${gym.address}` : gym.name,
        value: gym.id,
      }))
    : [];

  // The Create Plan button is disabled when:
  // - gyms are still loading
  // - there are no gyms
  // - the mutation is in flight
  const isCreateDisabled =
    isGymsLoading || hasNoGyms || isGymsError || createMutation.isPending;

  // ─── Page loading / error ────────────────────────────────────────────────────
  if (isLoading) return <Spinner fullPage />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Membership Plans"
        description="Manage the pricing plans available at your gym."
        action={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            disabled={hasNoGyms || isGymsError}
            title={hasNoGyms ? 'No gym available for your account' : undefined}
          >
            <Plus size={16} />
            Create Plan
          </Button>
        }
      />

      <Card padding="none">
        <Table
          headers={['Name', 'Type', 'Price', 'Duration / Sessions', 'Created']}
          isEmpty={!plans || plans.length === 0}
          emptyMessage="No membership plans found. Create one to get started."
        >
          {plans?.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>
                <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{plan.name}</span>
              </TableCell>
              <TableCell>
                <Badge variant={plan.isSessionBased ? 'primary' : 'success'}>
                  {plan.isSessionBased ? 'Session-Based' : 'Time-Based'}
                </Badge>
              </TableCell>
              <TableCell>
                <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>
                  ${plan.price.toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {plan.isSessionBased
                    ? `${plan.numberOfSessions} Sessions`
                    : `${plan.durationInDays} Days`}
                </span>
              </TableCell>
              <TableCell>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(plan.createdAt).toLocaleDateString()}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      {/* ── Create Modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title="Create Membership Plan"
      >
        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Plan Name */}
            <Input
              label="Plan Name"
              {...createForm.register('name')}
              error={createForm.formState.errors.name?.message}
              placeholder="e.g. Monthly Premium"
            />

            {/* ── Gym Selector ──────────────────────────────────────────────── */}
            {/* The owner selects from their own gyms. The gymId is stored    */}
            {/* internally and sent to the backend — the user never types it. */}
            {isGymsLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 500,
                    color: 'var(--color-neutral-700)',
                  }}
                >
                  Gym
                </span>
                <div
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--color-neutral-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-neutral-100)',
                  }}
                >
                  Loading gyms…
                </div>
              </div>
            )}

            {isGymsError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-50, #fff1f2)',
                  border: '1px solid var(--color-danger-200, #fecdd3)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-danger-700, #b91c1c)',
                }}
              >
                Unable to load your gyms. Please close and try again.
              </div>
            )}

            {hasNoGyms && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-neutral-50, #f8fafc)',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                <Building2 size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  No gym is available for your account. Please set up a gym before creating a plan.
                </p>
              </div>
            )}

            {/* Single gym — show as a read-only display so the owner sees their gym clearly */}
            {hasSingleGym && gyms && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 500,
                    color: 'var(--color-neutral-700)',
                  }}
                >
                  Gym
                </span>
                <div
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--color-neutral-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-text-main)',
                    backgroundColor: 'var(--color-neutral-50, #f8fafc)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Building2 size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 500 }}>{gyms[0].name}</span>
                  {gyms[0].address && (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      — {gyms[0].address}
                    </span>
                  )}
                </div>
                {/* Validation error still shown if somehow gymId is not set */}
                {createForm.formState.errors.gymId && (
                  <p
                    role="alert"
                    style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-600)', margin: 0 }}
                  >
                    {createForm.formState.errors.gymId.message}
                  </p>
                )}
              </div>
            )}

            {/* Multiple gyms — show a dropdown */}
            {hasMultipleGyms && (
              <Select
                label="Gym"
                id="gym-select"
                options={[{ label: 'Select a gym…', value: 0 }, ...gymOptions]}
                value={selectedGymId}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  createForm.setValue('gymId', val, { shouldValidate: true });
                }}
                error={createForm.formState.errors.gymId?.message}
              />
            )}

            {/* Price */}
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min="0"
              {...createForm.register('price', { valueAsNumber: true })}
              error={createForm.formState.errors.price?.message}
              placeholder="e.g. 500"
            />

            {/* Session-based toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="isSessionBased"
                {...createForm.register('isSessionBased')}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--color-primary-600)',
                  cursor: 'pointer',
                }}
              />
              <label
                htmlFor="isSessionBased"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                Session-based plan
              </label>
            </div>

            {isSessionBased ? (
              <Input
                label="Number of Sessions"
                type="number"
                min="1"
                {...createForm.register('numberOfSessions', { valueAsNumber: true })}
                error={createForm.formState.errors.numberOfSessions?.message}
                placeholder="e.g. 12"
              />
            ) : (
              <Input
                label="Duration in Days"
                type="number"
                min="1"
                {...createForm.register('durationInDays', { valueAsNumber: true })}
                error={createForm.formState.errors.durationInDays?.message}
                placeholder="e.g. 30"
              />
            )}

            {/* Refine-level validation error (session/duration mismatch) */}
            {createForm.formState.errors.isSessionBased && (
              <p
                role="alert"
                style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-600)', margin: 0 }}
              >
                {createForm.formState.errors.isSessionBased.message}
              </p>
            )}
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
            <Button variant="ghost" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              disabled={isCreateDisabled}
            >
              Create Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
