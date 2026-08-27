import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, ExternalLink, Search, X, AlertCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trainerApi } from '../../api/trainer.api';
import { createMemberSchema, updateMemberSchema } from '../../schemas';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';
import type { Member, CreateMemberRequestDto } from '../../types/shared';

type CreateMemberFormValues = z.infer<typeof createMemberSchema>;
type UpdateMemberFormValues = z.infer<typeof updateMemberSchema>;

export const MembersPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [createServerError, setCreateServerError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [activeSearch, setActiveSearch] = useState({ name: '', phone: '' });
  const queryClient = useQueryClient();
  const toast = useToast();

  // Query: Members
  const { data: members, isLoading, isError, refetch } = useQuery({
    queryKey: ['trainer', 'members', activeSearch],
    queryFn: () => trainerApi.getMembers(activeSearch.name || activeSearch.phone ? activeSearch : undefined),
  });

  // Query: Membership Plans for Trainer
  const {
    data: plans,
    isLoading: isLoadingPlans,
    isError: isErrorPlans,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['trainer', 'membership-plans'],
    queryFn: () => trainerApi.getMembershipPlans(),
  });

  // Form for Creating Member
  const createForm = useForm<CreateMemberFormValues>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      membershipPlanId: null,
    },
  });

  // Form for Updating Member
  const updateForm = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberSchema),
  });

  // Mutation: Create Member (Single call - backend handles optional first subscription)
  const createMutation = useMutation({
    mutationFn: (data: CreateMemberFormValues) => {
      const payload: CreateMemberRequestDto = {
        fullName: data.fullName.trim(),
        phoneNumber: data.phoneNumber.trim(),
        membershipPlanId: data.membershipPlanId ? Number(data.membershipPlanId) : null,
      };
      return trainerApi.createMember(payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'members'] });
      setIsCreateModalOpen(false);
      createForm.reset({ fullName: '', phoneNumber: '', membershipPlanId: null });
      setCreateServerError(null);

      if (variables.membershipPlanId) {
        toast.success('Member and subscription created successfully.');
      } else {
        toast.success('Member created successfully.');
      }
    },
    onError: (error: any) => {
      const status = error.response?.status;
      let message = 'Something went wrong. Please try again.';

      if (status === 400) {
        message = error.response?.data?.message || 'Invalid member information.';
      } else if (status === 401) {
        message = 'Your session has expired. Please log in again.';
      } else if (status === 403) {
        message = "You don't have permission to use this membership plan.";
      } else if (status === 404) {
        message = 'Resource not found.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      setCreateServerError(message);
      toast.error(message);
    },
  });

  // Mutation: Update Member
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => trainerApi.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'members'] });
      setEditingMember(null);
      toast.success('Member updated successfully.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update member.';
      toast.error(message);
    },
  });

  const openCreateModal = () => {
    createForm.reset({ fullName: '', phoneNumber: '', membershipPlanId: null });
    setCreateServerError(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    updateForm.reset({
      fullName: member.fullName,
      phoneNumber: member.phoneNumber,
    });
  };

  const handleCreateSubmit = (data: CreateMemberFormValues) => {
    setCreateServerError(null);
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: UpdateMemberFormValues) => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch({ name: searchName, phone: searchPhone });
  };

  const clearSearch = () => {
    setSearchName('');
    setSearchPhone('');
    setActiveSearch({ name: '', phone: '' });
  };

  const hasActiveSearch = activeSearch.name || activeSearch.phone;

  // Plan Options for Combobox / Select
  const planOptions = useMemo(() => {
    if (isLoadingPlans) {
      return [{ label: 'Loading plans...', value: '' }];
    }
    if (isErrorPlans) {
      return [{ label: 'Unable to load membership plans', value: '' }];
    }
    if (!plans || plans.length === 0) {
      return [{ label: 'No membership plans available', value: '' }];
    }
    return [
      { label: 'No membership plan', value: '' },
      ...plans.map((p) => ({
        label: `${p.name} — ${p.price} EGP — ${p.isSessionBased ? `${p.numberOfSessions} sessions` : `${p.durationInDays} days`}`,
        value: p.id,
      })),
    ];
  }, [plans, isLoadingPlans, isErrorPlans]);

  return (
    <div>
      <PageHeader
        title="Members"
        description="Manage the members assigned to you."
        action={
          <Button onClick={openCreateModal} size="sm">
            <Plus size={16} />
            Add Member
          </Button>
        }
      />

      {/* Search */}
      <Card padding="sm" style={{ marginBottom: '16px' }}>
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 180px' }}>
            <Input
              label="Search by Name"
              placeholder="e.g. John Doe"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <Input
              label="Search by Phone"
              placeholder="e.g. 01234567890"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, paddingBottom: '1px' }}>
            <Button type="submit" size="sm">
              <Search size={14} /> Search
            </Button>
            {hasActiveSearch && (
              <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
                <X size={14} /> Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Spinner fullPage />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <Card padding="none">
          <Table
            headers={['ID', 'Name', 'Phone', 'Joined', 'Actions']}
            isEmpty={!members || members.length === 0}
            emptyMessage="No members found."
          >
            {members?.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <span style={{ color: 'var(--color-text-muted)' }}>#{member.id}</span>
                </TableCell>
                <TableCell>
                  <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{member.fullName}</span>
                </TableCell>
                <TableCell>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{member.phoneNumber}</span>
                </TableCell>
                <TableCell>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(member)} title="Edit" iconOnly>
                      <Edit2 size={15} />
                    </Button>
                    <Link to={`/trainer/members/${member.id}`}>
                      <Button variant="ghost" size="sm" title="View Details" iconOnly>
                        <ExternalLink size={15} />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}

      {/* Create Member Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateServerError(null);
        }}
        title="Add New Member"
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
          Add a member to your gym.
        </p>

        {createServerError && (
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
              {createServerError}
            </p>
          </div>
        )}

        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Full Name"
              {...createForm.register('fullName')}
              error={createForm.formState.errors.fullName?.message}
              placeholder="e.g. John Doe"
              autoFocus
            />

            <Input
              label="Phone Number"
              {...createForm.register('phoneNumber')}
              error={createForm.formState.errors.phoneNumber?.message}
              placeholder="e.g. 01234567890"
            />

            <div>
              <Select
                label="Membership Plan"
                disabled={isLoadingPlans || createMutation.isPending}
                {...createForm.register('membershipPlanId', {
                  setValueAs: (v) => (v === '' || isNaN(Number(v)) ? null : Number(v)),
                })}
                error={createForm.formState.errors.membershipPlanId?.message}
                hint="Choose a plan now or add a subscription later."
                options={planOptions}
              />

              {isErrorPlans && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-danger-50)',
                    border: '1px solid var(--color-danger-200)',
                  }}
                >
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger-700)' }}>
                    Unable to load membership plans.
                  </span>
                  <button
                    type="button"
                    onClick={() => refetchPlans()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      color: 'var(--color-primary-600)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={12} />
                    Retry
                  </button>
                </div>
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
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateServerError(null);
              }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Edit Member"
        size="sm"
      >
        <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Full Name"
              {...updateForm.register('fullName')}
              error={updateForm.formState.errors.fullName?.message}
            />
            <Input
              label="Phone Number"
              {...updateForm.register('phoneNumber')}
              error={updateForm.formState.errors.phoneNumber?.message}
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
            <Button variant="ghost" type="button" onClick={() => setEditingMember(null)} disabled={updateMutation.isPending}>
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
