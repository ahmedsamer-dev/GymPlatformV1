import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
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
import { useToast } from '../../components/ui/Toast';

type CreatePlanFormValues = z.infer<typeof createMembershipPlanSchema>;

export const MembershipPlansPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: plans, isLoading, isError, refetch } = useQuery({
    queryKey: ['owner', 'membership-plans'],
    queryFn: () => ownerApi.getMembershipPlans(),
  });

  const createMutation = useMutation({
    mutationFn: ownerApi.createMembershipPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'membership-plans'] });
      setIsCreateModalOpen(false);
      createForm.reset();
      toast.success('Membership plan created successfully.');
    },
    onError: () => {
      toast.error('Failed to create membership plan.');
    },
  });

  const createForm = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createMembershipPlanSchema),
    defaultValues: {
      isSessionBased: false,
      durationInDays: 30,
      numberOfSessions: 0,
    },
  });

  const isSessionBased = createForm.watch('isSessionBased');

  const handleCreateSubmit = (data: CreatePlanFormValues) => {
    createMutation.mutate(data);
  };

  if (isLoading) return <Spinner fullPage />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Membership Plans"
        description="Manage the pricing plans available at your gym."
        action={
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
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
                  {plan.isSessionBased ? `${plan.numberOfSessions} Sessions` : `${plan.durationInDays} Days`}
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Membership Plan"
      >
        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Plan Name" {...createForm.register('name')} error={createForm.formState.errors.name?.message} placeholder="e.g. Monthly Premium" />
            <Input label="Gym ID" type="number" {...createForm.register('gymId', { valueAsNumber: true })} error={createForm.formState.errors.gymId?.message} />
            <Input label="Price ($)" type="number" step="0.01" {...createForm.register('price', { valueAsNumber: true })} error={createForm.formState.errors.price?.message} />

            {/* Session Toggle */}
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
                }}
              >
                Session-based plan
              </label>
            </div>

            {isSessionBased ? (
              <Input label="Number of Sessions" type="number" {...createForm.register('numberOfSessions', { valueAsNumber: true })} error={createForm.formState.errors.numberOfSessions?.message} />
            ) : (
              <Input label="Duration in Days" type="number" {...createForm.register('durationInDays', { valueAsNumber: true })} error={createForm.formState.errors.durationInDays?.message} />
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
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Create Plan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
