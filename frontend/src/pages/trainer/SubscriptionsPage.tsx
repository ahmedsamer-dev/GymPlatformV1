import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MinusCircle, Search, X, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { trainerApi } from '../../api/trainer.api';
import { createSubscriptionSchema } from '../../schemas';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import type { Member } from '../../types/shared';

type CreateSubscriptionFormValues = z.infer<typeof createSubscriptionSchema>;

export const SubscriptionsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [useSessionTarget, setUseSessionTarget] = useState<{ id: number; name: string } | null>(null);
  const [createServerError, setCreateServerError] = useState<string | null>(null);

  // Searchable Member State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const comboboxRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(memberSearchQuery, 350);
  const isSearchActive = debouncedSearch.trim().length >= 2;

  const queryClient = useQueryClient();
  const toast = useToast();

  // Queries
  const { data: subscriptions, isLoading: subsLoading, isError: subsError, refetch: refetchSubs } = useQuery({
    queryKey: ['trainer', 'subscriptions'],
    queryFn: () => trainerApi.getSubscriptions(),
  });

  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useQuery({
    queryKey: ['trainer', 'membership-plans'],
    queryFn: () => trainerApi.getMembershipPlans(),
  });

  // Server-side member search query (only runs when query >= 2 chars, modal open, and no member selected)
  const searchParams = useMemo(() => {
    const trimmed = debouncedSearch.trim();
    const isFullPhone = /^01[0125][0-9]{8}$/.test(trimmed);
    return isFullPhone ? { phone: trimmed } : { name: trimmed };
  }, [debouncedSearch]);

  const {
    data: searchedMembers,
    isLoading: isSearchingMembers,
    isError: isSearchMembersError,
    refetch: refetchSearchMembers,
  } = useQuery({
    queryKey: ['trainer', 'members', 'search', debouncedSearch],
    queryFn: () => trainerApi.getMembers(searchParams),
    enabled: isSearchActive && isCreateModalOpen && !selectedMember,
    staleTime: 30_000,
  });

  // Form setup
  const createForm = useForm<CreateSubscriptionFormValues>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      memberId: undefined,
      membershipPlanId: undefined,
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateSubscriptionFormValues) => {
      return trainerApi.createSubscription({
        memberId: Number(data.memberId),
        membershipPlanId: Number(data.membershipPlanId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'subscriptions'] });
      setIsCreateModalOpen(false);
      setSelectedMember(null);
      setMemberSearchQuery('');
      setCreateServerError(null);
      createForm.reset();
      toast.success('Subscription created successfully.');
    },
    onError: (error: any) => {
      const status = error.response?.status;
      let message = 'Something went wrong. Please try again.';

      if (status === 400) {
        message = error.response?.data?.message || 'Invalid subscription data.';
      } else if (status === 401) {
        message = 'Your session has expired. Please log in again.';
      } else if (status === 403) {
        message = "You don't have permission to create a subscription for this member or plan.";
      } else if (status === 404) {
        message = 'Resource not found.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      setCreateServerError(message);
      toast.error(message);
    },
  });

  const useSessionMutation = useMutation({
    mutationFn: trainerApi.useSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'subscriptions'] });
      setUseSessionTarget(null);
      toast.success('Session deducted successfully.');
    },
    onError: () => {
      toast.error('Failed to deduct session.');
    },
  });

  const openCreateModal = () => {
    createForm.reset({ memberId: undefined, membershipPlanId: undefined });
    setSelectedMember(null);
    setMemberSearchQuery('');
    setCreateServerError(null);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    setIsCreateModalOpen(true);
  };

  const selectMember = (member: Member) => {
    setSelectedMember(member);
    createForm.setValue('memberId', member.id, { shouldValidate: true });
    setMemberSearchQuery('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchedMembers || searchedMembers.length === 0) {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex((prev) => (prev + 1 < searchedMembers.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : searchedMembers.length - 1));
    } else if (e.key === 'Enter') {
      if (isDropdownOpen && highlightedIndex >= 0 && highlightedIndex < searchedMembers.length) {
        e.preventDefault();
        selectMember(searchedMembers[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleCreateSubmit = (data: CreateSubscriptionFormValues) => {
    setCreateServerError(null);
    createMutation.mutate(data);
  };

  // Plan Options for Select
  const planOptions = useMemo(() => {
    if (plansLoading) {
      return [{ label: 'Loading plans...', value: '' }];
    }
    if (plansError) {
      return [{ label: 'Unable to load plans', value: '' }];
    }
    if (!plans || plans.length === 0) {
      return [{ label: 'No membership plans available', value: '' }];
    }
    return [
      { label: 'Select a membership plan...', value: '' },
      ...plans.map((p) => ({
        label: `${p.name} — ${p.price} EGP — ${p.isSessionBased ? `${p.numberOfSessions} sessions` : `${p.durationInDays} days`}`,
        value: p.id,
      })),
    ];
  }, [plans, plansLoading, plansError]);

  if (subsLoading) return <Spinner fullPage />;
  if (subsError) return <ErrorState onRetry={refetchSubs} />;

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Manage member subscriptions and sessions."
        action={
          <Button onClick={openCreateModal} size="sm">
            <Plus size={16} />
            New Subscription
          </Button>
        }
      />

      <Card padding="none">
        <Table
          headers={['Member', 'Plan', 'Status', 'Start', 'End', 'Sessions', 'Actions']}
          isEmpty={!subscriptions || subscriptions.length === 0}
          emptyMessage="No subscriptions found."
        >
          {subscriptions?.map((sub) => {
            const isSessionBased = sub.remainingSessions !== null && sub.remainingSessions !== undefined;
            return (
              <TableRow key={sub.id}>
                <TableCell>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{sub.memberName}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                    ID: {sub.memberId}
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{sub.membershipPlanName}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                    ${sub.totalPrice.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={sub.status === 'Active' ? 'success' : sub.status === 'Expired' ? 'danger' : 'neutral'}>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(sub.startDate).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  {isSessionBased ? (
                    <span
                      style={{
                        fontWeight: 500,
                        color: sub.remainingSessions > 0 ? 'var(--color-primary-600)' : 'var(--color-danger-600)',
                      }}
                    >
                      {sub.remainingSessions} left
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-text-faint)' }}>—</span>
                  )}
                </TableCell>
                <TableCell>
                  {isSessionBased && sub.status === 'Active' && sub.remainingSessions > 0 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setUseSessionTarget({ id: sub.id, name: sub.memberName })}
                    >
                      <MinusCircle size={14} />
                      Use Session
                    </Button>
                  ) : (
                    <span style={{ color: 'var(--color-text-faint)' }}>—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </Card>

      {/* Use Session Confirm */}
      <ConfirmDialog
        isOpen={!!useSessionTarget}
        onClose={() => setUseSessionTarget(null)}
        onConfirm={() => {
          if (useSessionTarget) {
            useSessionMutation.mutate(useSessionTarget.id);
          }
        }}
        title="Use Session"
        message={`Deduct one session from ${useSessionTarget?.name}'s subscription? This action cannot be undone.`}
        confirmLabel="Use Session"
        variant="primary"
        isLoading={useSessionMutation.isPending}
      />

      {/* Create Subscription Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateServerError(null);
        }}
        title="Create Subscription"
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
          Add a subscription to an existing member.
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
            
            {/* Searchable Member Combobox */}
            <div ref={comboboxRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                htmlFor="member-search-input"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  color: 'var(--color-neutral-700)',
                }}
              >
                Member
              </label>

              {selectedMember ? (
                /* Selected Member Display */
                <div
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-primary-50)',
                    border: '1px solid var(--color-primary-200)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-primary-700)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Selected
                    </span>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {selectedMember.fullName}{' '}
                      <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                        (ID: #{selectedMember.id})
                      </span>
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      Phone: {selectedMember.phoneNumber}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(null);
                      createForm.setValue('memberId', undefined as any, { shouldValidate: true });
                      setMemberSearchQuery('');
                    }}
                    style={{ color: 'var(--color-primary-700)', flexShrink: 0 }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                /* Member Search Input & Dropdown */
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-neutral-400)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="member-search-input"
                      type="text"
                      role="combobox"
                      aria-expanded={isDropdownOpen}
                      aria-autocomplete="list"
                      aria-controls="member-search-results"
                      placeholder="Search member by name or phone..."
                      value={memberSearchQuery}
                      onChange={(e) => {
                        setMemberSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onKeyDown={handleSearchKeyDown}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 36px 8px 34px',
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--color-text-main)',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: `1px solid ${
                          createForm.formState.errors.memberId ? 'var(--color-danger-500)' : 'var(--color-neutral-300)'
                        }`,
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                        transition:
                          'border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)',
                      }}
                    />

                    {isSearchingMembers && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-primary-600)' }} />
                        <span>Searching...</span>
                      </div>
                    )}

                    {!isSearchingMembers && memberSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setMemberSearchQuery('');
                          setIsDropdownOpen(false);
                        }}
                        aria-label="Clear search"
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-neutral-400)',
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Options */}
                  {isDropdownOpen && memberSearchQuery.trim().length >= 2 && (
                    <div
                      id="member-search-results"
                      role="listbox"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 60,
                        marginTop: '4px',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        maxHeight: '220px',
                        overflowY: 'auto',
                      }}
                    >
                      {isSearchingMembers ? (
                        <div
                          style={{
                            padding: '16px',
                            textAlign: 'center',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          Searching members...
                        </div>
                      ) : isSearchMembersError ? (
                        <div
                          style={{
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                          }}
                        >
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger-700)' }}>
                            Unable to search members.
                          </span>
                          <button
                            type="button"
                            onClick={() => refetchSearchMembers()}
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 600,
                              color: 'var(--color-primary-600)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Retry
                          </button>
                        </div>
                      ) : searchedMembers && searchedMembers.length > 0 ? (
                        searchedMembers.map((m, idx) => (
                          <div
                            key={m.id}
                            role="option"
                            aria-selected={highlightedIndex === idx}
                            onClick={() => selectMember(m)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom:
                                idx < searchedMembers.length - 1 ? '1px solid var(--color-border)' : 'none',
                              backgroundColor:
                                highlightedIndex === idx ? 'var(--color-neutral-100)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontSize: 'var(--font-size-base)',
                                  fontWeight: 500,
                                  color: 'var(--color-text-main)',
                                }}
                              >
                                {m.fullName}
                              </span>
                              <span
                                style={{
                                  fontSize: 'var(--font-size-xs)',
                                  color: 'var(--color-text-muted)',
                                  marginLeft: '6px',
                                }}
                              >
                                (#{m.id})
                              </span>
                            </div>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                              {m.phoneNumber}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            padding: '16px',
                            textAlign: 'center',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          No members found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {createForm.formState.errors.memberId && (
                <p
                  role="alert"
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-danger-600)',
                    margin: 0,
                  }}
                >
                  {createForm.formState.errors.memberId.message}
                </p>
              )}
            </div>

            {/* Membership Plan Select */}
            <div>
              <Select
                label="Membership Plan"
                disabled={plansLoading || createMutation.isPending}
                {...createForm.register('membershipPlanId', {
                  setValueAs: (v) => (v === '' || isNaN(Number(v)) ? undefined : Number(v)),
                })}
                error={createForm.formState.errors.membershipPlanId?.message}
                options={planOptions}
              />

              {plansError && (
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
              Create Subscription
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
