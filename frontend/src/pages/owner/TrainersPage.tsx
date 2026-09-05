import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, UserX, UserCheck, Building2 } from 'lucide-react';
import { ownerApi } from '../../api/owner.api';
import { createTrainerSchema, updateTrainerSchema } from '../../schemas';
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
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import type { Trainer } from '../../types/shared';

type CreateTrainerFormValues = z.infer<typeof createTrainerSchema>;
type UpdateTrainerFormValues = z.infer<typeof updateTrainerSchema>;

export const TrainersPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<Trainer | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  // ─── Trainers ─────────────────────────────────────────────────────────────
  const { data: trainers, isLoading, isError, refetch } = useQuery({
    queryKey: ['owner', 'trainers'],
    queryFn: () => ownerApi.getTrainers(),
  });

  // ─── Owner's Gyms ─────────────────────────────────────────────────────────
  // Reuses GET /api/owner/gyms — only returns gyms the authenticated Owner
  // actually owns. The JWT bearer token is sent automatically.
  const {
    data: gyms,
    isLoading: isGymsLoading,
    isError: isGymsError,
  } = useQuery({
    queryKey: ['owner', 'gyms'],
    queryFn: () => ownerApi.getMyGyms(),
  });

  // ─── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: ownerApi.createTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'trainers'] });
      handleCloseCreateModal();
      toast.success('Trainer created successfully.');
    },
    onError: (error: any) => {
      const serverMessage =
        error?.response?.data?.message ||
        (error?.response?.status === 403
          ? 'You do not have permission to add a trainer to this gym.'
          : error?.response?.status === 404
          ? 'Selected gym not found or does not belong to your account.'
          : 'Failed to create trainer. Please check the provided information.');
      toast.error(serverMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => ownerApi.updateTrainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'trainers'] });
      setEditingTrainer(null);
      toast.success('Trainer updated successfully.');
    },
    onError: (error: any) => {
      const serverMessage = error?.response?.data?.message || 'Failed to update trainer.';
      toast.error(serverMessage);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => ownerApi.setTrainerStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'trainers'] });
      setStatusConfirm(null);
      toast.success('Trainer status updated.');
    },
    onError: (error: any) => {
      const serverMessage = error?.response?.data?.message || 'Failed to update trainer status.';
      toast.error(serverMessage);
    },
  });

  // ─── Forms ────────────────────────────────────────────────────────────────
  const createForm = useForm<CreateTrainerFormValues>({
    resolver: zodResolver(createTrainerSchema),
    defaultValues: {
      gymId: 0,
      salary: 0,
      hireDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedGymId = createForm.watch('gymId');

  // Auto-select gym when the owner has exactly one
  useEffect(() => {
    if (gyms && gyms.length === 1) {
      createForm.setValue('gymId', gyms[0].id, { shouldValidate: true });
    }
  }, [gyms, createForm]);

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.reset({
      fullName: '',
      userName: '',
      password: '',
      phoneNumber: '',
      salary: 0,
      address: '',
      imageUrl: '',
      hireDate: new Date().toISOString().split('T')[0],
      gymId: gyms?.length === 1 ? gyms[0].id : 0,
    });
  };

  const updateForm = useForm<UpdateTrainerFormValues>({
    resolver: zodResolver(updateTrainerSchema),
  });

  const openEditModal = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    updateForm.reset({
      fullName: trainer.fullName,
      phoneNumber: trainer.phoneNumber,
      salary: trainer.salary,
      address: trainer.address,
      imageUrl: trainer.imageUrl || '',
    });
  };

  const handleCreateSubmit = (data: CreateTrainerFormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: UpdateTrainerFormValues) => {
    if (editingTrainer) {
      updateMutation.mutate({ id: editingTrainer.id, data });
    }
  };

  // ─── Gym selector helpers ─────────────────────────────────────────────────
  const hasNoGyms = !isGymsLoading && !isGymsError && gyms !== undefined && gyms.length === 0;
  const hasSingleGym = gyms?.length === 1;
  const hasMultipleGyms = (gyms?.length ?? 0) > 1;

  const gymOptions = gyms
    ? gyms.map((gym) => ({
        label: gym.address ? `${gym.name} — ${gym.address}` : gym.name,
        value: gym.id,
      }))
    : [];

  const isCreateDisabled =
    isGymsLoading || hasNoGyms || isGymsError || createMutation.isPending;

  // ─── Loading / Error ──────────────────────────────────────────────────────
  if (isLoading) return <Spinner fullPage />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Trainers"
        description="Manage your gym's training staff."
        action={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            disabled={hasNoGyms || isGymsError}
            title={hasNoGyms ? 'No gym available for your account' : undefined}
          >
            <Plus size={16} />
            Add Trainer
          </Button>
        }
      />

      <Card padding="none">
        <Table
          headers={['Name', 'Phone', 'Gym', 'Status', 'Actions']}
          isEmpty={!trainers || trainers.length === 0}
          emptyMessage="No trainers found. Add a trainer to get started."
        >
          {trainers?.map((trainer) => (
            <TableRow key={trainer.id}>
              <TableCell>
                <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{trainer.fullName}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '1px' }}>@{trainer.userName}</div>
              </TableCell>
              <TableCell>
                <span style={{ color: 'var(--color-text-secondary)' }}>{trainer.phoneNumber}</span>
              </TableCell>
              <TableCell>
                <span style={{ color: 'var(--color-text-secondary)' }}>{trainer.gymName}</span>
              </TableCell>
              <TableCell>
                <Badge variant={trainer.isActive ? 'success' : 'neutral'}>
                  {trainer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(trainer)} title="Edit" iconOnly>
                    <Edit2 size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusConfirm(trainer)}
                    title={trainer.isActive ? 'Deactivate' : 'Activate'}
                    iconOnly
                  >
                    {trainer.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      {/* ── Status Confirm Dialog ────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        onConfirm={() => {
          if (statusConfirm) {
            statusMutation.mutate({ id: statusConfirm.id, active: !statusConfirm.isActive });
          }
        }}
        title={statusConfirm?.isActive ? 'Deactivate Trainer' : 'Activate Trainer'}
        message={`Are you sure you want to ${statusConfirm?.isActive ? 'deactivate' : 'activate'} ${statusConfirm?.fullName}?`}
        confirmLabel={statusConfirm?.isActive ? 'Deactivate' : 'Activate'}
        variant={statusConfirm?.isActive ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
      />

      {/* ── Create Modal ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Add New Trainer"
        size="lg"
      >
        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              {...createForm.register('fullName')}
              error={createForm.formState.errors.fullName?.message}
            />
            <Input
              label="Username"
              placeholder="e.g. johndoe"
              {...createForm.register('userName')}
              error={createForm.formState.errors.userName?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...createForm.register('password')}
              error={createForm.formState.errors.password?.message}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. 01012345678"
              {...createForm.register('phoneNumber')}
              error={createForm.formState.errors.phoneNumber?.message}
            />
            <Input
              label="Salary ($)"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 5000"
              {...createForm.register('salary', { valueAsNumber: true })}
              error={createForm.formState.errors.salary?.message}
            />
            <Input
              label="Address"
              placeholder="e.g. 123 Main St, Cairo"
              {...createForm.register('address')}
              error={createForm.formState.errors.address?.message}
            />
            <Input
              label="Hire Date"
              type="date"
              {...createForm.register('hireDate')}
              error={createForm.formState.errors.hireDate?.message}
            />

            {/* ── Gym Selector ──────────────────────────────────────────────── */}
            {/* The owner selects from their own gyms. The gymId is stored    */}
            {/* internally and sent to backend — user never types a raw ID.   */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                    No gym is available for your account. Please set up a gym before adding a trainer.
                  </p>
                </div>
              )}

              {/* Single gym — auto-selected read-only card */}
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

              {/* Multiple gyms — dropdown selection */}
              {hasMultipleGyms && (
                <Select
                  label="Gym"
                  id="trainer-gym-select"
                  options={[{ label: 'Select a gym…', value: 0 }, ...gymOptions]}
                  value={selectedGymId}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    createForm.setValue('gymId', val, { shouldValidate: true });
                  }}
                  error={createForm.formState.errors.gymId?.message}
                />
              )}
            </div>
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
            <Button variant="ghost" type="button" onClick={handleCloseCreateModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending} disabled={isCreateDisabled}>Create Trainer</Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editingTrainer}
        onClose={() => setEditingTrainer(null)}
        title="Edit Trainer"
      >
        <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Full Name" {...updateForm.register('fullName')} error={updateForm.formState.errors.fullName?.message} />
            <Input label="Phone Number" {...updateForm.register('phoneNumber')} error={updateForm.formState.errors.phoneNumber?.message} />
            <Input label="Salary" type="number" {...updateForm.register('salary', { valueAsNumber: true })} error={updateForm.formState.errors.salary?.message} />
            <Input label="Address" {...updateForm.register('address')} error={updateForm.formState.errors.address?.message} />
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
            <Button variant="ghost" type="button" onClick={() => setEditingTrainer(null)}>Cancel</Button>
            <Button type="submit" isLoading={updateMutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
