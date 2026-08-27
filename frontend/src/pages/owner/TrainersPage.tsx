import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, UserX, UserCheck } from 'lucide-react';
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

  const { data: trainers, isLoading, isError, refetch } = useQuery({
    queryKey: ['owner', 'trainers'],
    queryFn: () => ownerApi.getTrainers(),
  });

  const createMutation = useMutation({
    mutationFn: ownerApi.createTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'trainers'] });
      setIsCreateModalOpen(false);
      createForm.reset();
      toast.success('Trainer created successfully.');
    },
    onError: () => {
      toast.error('Failed to create trainer.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => ownerApi.updateTrainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'trainers'] });
      setEditingTrainer(null);
      toast.success('Trainer updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update trainer.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => ownerApi.setTrainerStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'trainers'] });
      setStatusConfirm(null);
      toast.success('Trainer status updated.');
    },
    onError: () => {
      toast.error('Failed to update trainer status.');
    },
  });

  const createForm = useForm<CreateTrainerFormValues>({
    resolver: zodResolver(createTrainerSchema),
  });

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

  if (isLoading) return <Spinner fullPage />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Trainers"
        description="Manage your gym's training staff."
        action={
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
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
                    variant={trainer.isActive ? 'ghost' : 'ghost'}
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

      {/* Status Confirm Dialog */}
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Trainer"
        size="lg"
      >
        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Input label="Full Name" {...createForm.register('fullName')} error={createForm.formState.errors.fullName?.message} />
            <Input label="Username" {...createForm.register('userName')} error={createForm.formState.errors.userName?.message} />
            <Input label="Password" type="password" {...createForm.register('password')} error={createForm.formState.errors.password?.message} />
            <Input label="Phone Number" {...createForm.register('phoneNumber')} error={createForm.formState.errors.phoneNumber?.message} />
            <Input label="Salary" type="number" {...createForm.register('salary', { valueAsNumber: true })} error={createForm.formState.errors.salary?.message} />
            <Input label="Address" {...createForm.register('address')} error={createForm.formState.errors.address?.message} />
            <Input label="Gym ID" type="number" {...createForm.register('gymId', { valueAsNumber: true })} error={createForm.formState.errors.gymId?.message} />
            <Input label="Hire Date" type="date" {...createForm.register('hireDate')} error={createForm.formState.errors.hireDate?.message} />
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
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Create Trainer</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
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
