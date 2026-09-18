import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronLeft, Dumbbell, Eye, Mail, Phone, Power, PowerOff, Users, UserCheck } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton, StatCardsSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/ui/StatCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';
import { getApiErrorMessage, isNotFoundError } from '../../utils/apiError';
import { ActiveBadge } from '../../components/admin/ActiveBadge';
import type { OwnerDetails } from '../../types/admin';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export const OwnerDetailsPage: React.FC = () => {
  const { ownerId } = useParams<{ ownerId: string }>();
  const id = ownerId ? parseInt(ownerId, 10) : NaN;
  const isValidId = Number.isInteger(id) && id > 0;

  const [statusTarget, setStatusTarget] = useState<OwnerDetails | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const ownerQuery = useQuery({
    queryKey: ['admin', 'owner-details', id],
    queryFn: () => adminApi.getOwnerDetails(id),
    enabled: isValidId,
  });

  // The owner's gyms via the real backend owner filter (GET /admin/gyms?ownerId=)
  const gymsQuery = useQuery({
    queryKey: ['admin', 'gyms', { ownerDetails: id }],
    queryFn: () => adminApi.getGymsPaged({ pageNumber: 1, pageSize: 100, ownerId: id }),
    enabled: isValidId,
  });

  const owner = ownerQuery.data;

  const statusMutation = useMutation({
    mutationFn: (active: boolean) => adminApi.setOwnerStatus(id, active),
    onSuccess: (_result, active) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owner-details'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'gyms'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owners'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setStatusTarget(null);
      toast.success(
        active
          ? 'Owner activated — they can log in and operate again.'
          : 'Owner deactivated — login and operations are blocked. All business data is preserved.'
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update the owner status.'));
    },
  });

  const backLink = (
    <Link
      to="/admin/owners"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-muted)',
        textDecoration: 'none',
        marginBottom: 'var(--sp-3)',
      }}
    >
      <ChevronLeft size={14} />
      Back to Owners
    </Link>
  );

  if (!isValidId) {
    return (
      <div>
        {backLink}
        <Card>
          <EmptyState
            icon={<Users size={22} />}
            title="Invalid owner"
            description="The owner identifier in the URL is not valid."
            action={
              <Link to="/admin/owners">
                <Button variant="secondary" size="sm">Back to Owners</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  if (ownerQuery.isError) {
    return isNotFoundError(ownerQuery.error) ? (
      <div>
        {backLink}
        <Card>
          <EmptyState
            icon={<Users size={22} />}
            title="Owner not found"
            description="This owner does not exist or was removed."
            action={
              <Link to="/admin/owners">
                <Button variant="secondary" size="sm">Back to Owners</Button>
              </Link>
            }
          />
        </Card>
      </div>
    ) : (
      <div>
        {backLink}
        <Card>
          <ErrorState
            title="Unable to load owner details."
            message={getApiErrorMessage(ownerQuery.error)}
            onRetry={() => {
              void ownerQuery.refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  if (ownerQuery.isLoading || !owner) {
    return (
      <div>
        {backLink}
        <StatCardsSkeleton count={3} />
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton height={64} />
            <Skeleton height={140} />
          </div>
        </Card>
      </div>
    );
  }

  const initials = (owner.fullName || '?')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const gyms = gymsQuery.data?.items ?? [];

  return (
    <div>
      {backLink}
      <PageHeader
        title={owner.fullName}
        description={`Owner account since ${formatDate(owner.createdAt)}`}
        action={
          owner.isActive ? (
            <Button variant="danger" size="sm" onClick={() => setStatusTarget(owner)} isLoading={statusMutation.isPending}>
              <PowerOff size={14} />
              Deactivate
            </Button>
          ) : (
            <Button variant="success" size="sm" onClick={() => setStatusTarget(owner)} isLoading={statusMutation.isPending}>
              <Power size={14} />
              Activate
            </Button>
          )
        }
      />

      {/* Profile summary */}
      <Card padding="md" style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              aria-hidden="true"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 'var(--font-size-md)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', color: 'var(--color-text-main)' }}>
                  {owner.fullName}
                </span>
                <ActiveBadge isActive={owner.isActive} />
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>@{owner.userName}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} style={{ color: 'var(--color-neutral-400)' }} />
              {owner.email}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} style={{ color: 'var(--color-neutral-400)' }} />
              {owner.phoneNumber}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} style={{ color: 'var(--color-neutral-400)' }} />
              Joined {formatDate(owner.createdAt)}
            </span>
          </div>
        </div>
      </Card>

      {/* Business statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: 'var(--sp-6)' }}>
        <StatCard
          label="Gyms"
          value={owner.gymCount}
          icon={<Dumbbell size={18} />}
          accentBg="var(--color-success-50)"
          accentColor="var(--color-success-600)"
          subStats={[
            { label: 'Active', value: owner.activeGymCount, color: 'var(--color-success-600)' },
            { label: 'Inactive', value: owner.gymCount - owner.activeGymCount, color: 'var(--color-neutral-500)' },
          ]}
        />
        <StatCard
          label="Trainers"
          value={owner.trainerCount}
          icon={<UserCheck size={18} />}
        />
        <StatCard
          label="Members"
          value={owner.memberCount}
          icon={<Users size={18} />}
          accentBg="var(--color-neutral-100)"
          accentColor="var(--color-neutral-600)"
        />
      </div>

      {/* Gyms owned — fetched through the backend's owner filter */}
      <Card padding="none">
        <div style={{ padding: 'var(--sp-4) var(--sp-4) var(--sp-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
            Gyms ({gymsQuery.data?.totalCount ?? gyms.length})
          </h2>
          {gyms.length > 0 && (
            <Link
              to={`/admin/gyms?ownerId=${id}`}
              style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, textDecoration: 'none' }}
            >
              Manage in Gyms
            </Link>
          )}
        </div>
        {gymsQuery.isLoading ? (
          <div style={{ padding: 'var(--sp-4)' }}>
            <TableSkeleton rows={3} columns={6} />
          </div>
        ) : gymsQuery.isError ? (
          <ErrorState
            title="Unable to load this owner's gyms."
            message={getApiErrorMessage(gymsQuery.error)}
            onRetry={() => {
              void gymsQuery.refetch();
            }}
          />
        ) : gyms.length === 0 ? (
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="No gyms yet"
            description="This owner does not have any gyms registered."
          />
        ) : (
          <div style={{ padding: '0 var(--sp-4) var(--sp-4)' }}>
            <Table headers={['Gym', 'Address', 'Status', 'Trainers', 'Members', '']}>
              {gyms.map((gym) => (
                <TableRow key={gym.id}>
                  <TableCell>
                    <Link to={`/admin/gyms/${gym.id}`} style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>
                      {gym.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{gym.address}</span>
                  </TableCell>
                  <TableCell><ActiveBadge isActive={gym.isActive} /></TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{gym.trainerCount}</span>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{gym.memberCount}</span>
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/gyms/${gym.id}`} aria-label={`View details of ${gym.name}`}>
                      <Button variant="secondary" size="sm" iconOnly>
                        <Eye size={14} />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => {
          if (statusTarget) statusMutation.mutate(!statusTarget.isActive);
        }}
        title={statusTarget?.isActive ? 'Deactivate this owner?' : 'Activate this owner?'}
        message={
          statusTarget?.isActive
            ? `${statusTarget.fullName} will no longer be able to log in or operate. Their gyms, trainers, members and history are NOT deleted — everything is preserved and restored if the account is re-activated.`
            : `${statusTarget?.fullName ?? 'This owner'} will be able to log in and operate their gyms again.`
        }
        confirmLabel={statusTarget?.isActive ? 'Deactivate Owner' : 'Activate Owner'}
        variant={statusTarget?.isActive ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
};