import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ClipboardList, Dumbbell, Mail, Phone, Power, PowerOff, User, UserCheck, Users } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCardsSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/ui/StatCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';
import { getApiErrorMessage, isNotFoundError } from '../../utils/apiError';
import { ActiveBadge } from '../../components/admin/ActiveBadge';
import type { GymDetails } from '../../types/admin';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export const GymDetailsPage: React.FC = () => {
  const { gymId } = useParams<{ gymId: string }>();
  const id = gymId ? parseInt(gymId, 10) : NaN;
  const isValidId = Number.isInteger(id) && id > 0;

  const [statusTarget, setStatusTarget] = useState<GymDetails | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const gymQuery = useQuery({
    queryKey: ['admin', 'gym-details', id],
    queryFn: () => adminApi.getGymDetails(id),
    enabled: isValidId,
  });

  const gym = gymQuery.data;

  const statusMutation = useMutation({
    mutationFn: (active: boolean) => adminApi.setGymStatus(id, active),
    onSuccess: (_result, active) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'gym-details'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'gyms'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owner-details'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owners'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setStatusTarget(null);
      toast.success(
        active
          ? 'Gym activated — its owner and trainers can operate it again.'
          : 'Gym deactivated — operations on it are blocked. Trainers, members, plans and history are preserved.'
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update the gym status.'));
    },
  });

  const backLink = (
    <Link
      to="/admin/gyms"
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
      Back to Gyms
    </Link>
  );

  if (!isValidId) {
    return (
      <div>
        {backLink}
        <Card>
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="Invalid gym"
            description="The gym identifier in the URL is not valid."
            action={
              <Link to="/admin/gyms">
                <Button variant="secondary" size="sm">Back to Gyms</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  if (gymQuery.isError) {
    return isNotFoundError(gymQuery.error) ? (
      <div>
        {backLink}
        <Card>
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="Gym not found"
            description="This gym does not exist or was removed."
            action={
              <Link to="/admin/gyms">
                <Button variant="secondary" size="sm">Back to Gyms</Button>
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
            title="Unable to load gym details."
            message={getApiErrorMessage(gymQuery.error)}
            onRetry={() => {
              void gymQuery.refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  if (gymQuery.isLoading || !gym) {
    return (
      <div>
        {backLink}
        <StatCardsSkeleton count={3} />
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton height={64} />
            <Skeleton height={64} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {backLink}
      <PageHeader
        title={gym.name}
        description={`Gym profile — created ${formatDate(gym.createdAt)}`}
        action={
          gym.isActive ? (
            <Button variant="danger" size="sm" onClick={() => setStatusTarget(gym)} isLoading={statusMutation.isPending}>
              <PowerOff size={14} />
              Deactivate
            </Button>
          ) : (
            <Button variant="success" size="sm" onClick={() => setStatusTarget(gym)} isLoading={statusMutation.isPending}>
              <Power size={14} />
              Activate
            </Button>
          )
        }
      />

      {/* Gym information */}
      <Card padding="md" style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
          <div
            aria-hidden="true"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-success-50)',
              color: 'var(--color-success-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Dumbbell size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', color: 'var(--color-text-main)' }}>
                {gym.name}
              </span>
              <ActiveBadge isActive={gym.isActive} />
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{gym.address}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} style={{ color: 'var(--color-neutral-400)' }} />
              {gym.phoneNumber}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} style={{ color: 'var(--color-neutral-400)' }} />
              Owner:{' '}
              <Link to={`/admin/owners/${gym.ownerId}`} style={{ fontWeight: 500 }}>
                {gym.ownerName}
              </Link>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} style={{ color: 'var(--color-neutral-400)' }} />
              {gym.ownerEmail}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} style={{ color: 'var(--color-neutral-400)' }} />
              Created {formatDate(gym.createdAt)}
            </span>
          </div>
        </div>
      </Card>

      {/* Capacity statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: 'var(--sp-6)' }}>
        <StatCard
          label="Trainers"
          value={gym.trainerCount}
          icon={<UserCheck size={18} />}
          accentBg="var(--color-primary-50)"
          accentColor="var(--color-primary-600)"
        />
        <StatCard
          label="Members"
          value={gym.memberCount}
          icon={<Users size={18} />}
          accentBg="var(--color-success-50)"
          accentColor="var(--color-success-600)"
        />
        <StatCard
          label="Membership Plans"
          value={gym.membershipPlanCount}
          icon={<ClipboardList size={18} />}
          accentBg="var(--color-warning-50)"
          accentColor="var(--color-warning-600)"
        />
      </div>

      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => {
          if (statusTarget) statusMutation.mutate(!statusTarget.isActive);
        }}
        title={statusTarget?.isActive ? 'Deactivate this gym?' : 'Activate this gym?'}
        message={
          statusTarget?.isActive
            ? `${statusTarget.name} will be operationally inactive — its owner and trainers cannot work with it. Trainers, members, plans and history are NOT deleted and are restored when the gym is re-activated.`
            : `${statusTarget?.name ?? 'This gym'} will be operationally active again for its owner and trainers.`
        }
        confirmLabel={statusTarget?.isActive ? 'Deactivate Gym' : 'Activate Gym'}
        variant={statusTarget?.isActive ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
};