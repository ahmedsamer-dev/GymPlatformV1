import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, Dumbbell, FileText, RefreshCw, User, UserCheck, Users } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { StatCardsSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { getApiErrorMessage } from '../../utils/apiError';

const statGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
  marginBottom: 'var(--gm-space-6)',
};

// Shortcut cards follow the existing OwnerDashboard pattern.
const quickActions = [
  {
    title: 'Applications',
    desc: 'Review, approve or reject gym owner applications.',
    icon: <FileText size={18} strokeWidth={2} />,
    color: 'var(--gm-primary)',
    bg: 'var(--gm-primary-soft)',
    path: '/admin/applications',
  },
  {
    title: 'Owners',
    desc: 'Browse gym owners and manage their account status.',
    icon: <Users size={18} strokeWidth={2} />,
    color: 'var(--gm-success)',
    bg: 'var(--gm-success-soft)',
    path: '/admin/owners',
  },
  {
    title: 'Gyms',
    desc: 'Overview of all gyms with owner and capacity details.',
    icon: <Dumbbell size={18} strokeWidth={2} />,
    color: 'var(--gm-warning)',
    bg: 'var(--gm-warning-soft)',
    path: '/admin/gyms',
  },
];

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Platform-wide overview of owners, gyms and applications."
        />
        <StatCardsSkeleton count={5} />
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton height={64} />
            <Skeleton height={64} />
            <Skeleton height={64} />
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Platform-wide overview of owners, gyms and applications."
        />
        <Card>
          <ErrorState
            title="Unable to load dashboard statistics."
            message={getApiErrorMessage(error)}
            onRetry={() => {
              void refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  const pendingCount = data.applications.pending;
  const totalApplications =
    data.applications.pending + data.applications.approved + data.applications.rejected;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform-wide overview of owners, gyms and applications."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void refetch();
            }}
            isLoading={isFetching}
          >
            <RefreshCw size={14} strokeWidth={2} />
            Refresh
          </Button>
        }
      />

      {pendingCount > 0 && (
        <Link
          to="/admin/applications?status=Pending"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            textDecoration: 'none',
            backgroundColor: 'var(--gm-warning-soft)',
            border: '1px solid var(--gm-warning-border)',
            borderRadius: 'var(--gm-radius-lg)',
            padding: '14px 18px',
            marginBottom: 'var(--gm-space-5)',
            transition: 'border-color var(--gm-transition-fast)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} strokeWidth={2} style={{ color: 'var(--gm-warning)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 'var(--gm-font-size-sm)', fontWeight: 700, color: 'var(--gm-warning)' }}>
                {pendingCount} application{pendingCount === 1 ? '' : 's'} awaiting review
              </div>
              <div style={{ fontSize: 'var(--gm-font-size-xs)', color: 'var(--gm-text-secondary)', marginTop: '2px' }}>
                Approve to create the owner's account and first gym, or reject with a reason.
              </div>
            </div>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--gm-font-size-sm)',
              fontWeight: 600,
              color: 'var(--gm-warning)',
            }}
          >
            Review now <ArrowRight size={14} strokeWidth={2} />
          </span>
        </Link>
      )}

      <div style={statGrid}>
        <StatCard
          label="Gym Owners"
          value={data.owners.total}
          icon={<Users size={18} strokeWidth={2} />}
          subStats={[
            { label: 'Active', value: data.owners.active, color: 'var(--gm-success)' },
            { label: 'Inactive', value: data.owners.inactive, color: 'var(--gm-text-muted)' },
          ]}
          to="/admin/owners"
        />
        <StatCard
          label="Gyms"
          value={data.gyms.total}
          icon={<Dumbbell size={18} strokeWidth={2} />}
          accentBg="var(--gm-success-soft)"
          accentColor="var(--gm-success)"
          subStats={[
            { label: 'Active', value: data.gyms.active, color: 'var(--gm-success)' },
            { label: 'Inactive', value: data.gyms.inactive, color: 'var(--gm-text-muted)' },
          ]}
          to="/admin/gyms"
        />
        <StatCard
          label="Applications"
          value={totalApplications}
          icon={<FileText size={18} strokeWidth={2} />}
          accentBg="var(--gm-warning-soft)"
          accentColor="var(--gm-warning)"
          subStats={[
            { label: 'Pending', value: data.applications.pending, color: 'var(--gm-warning)' },
            { label: 'Approved', value: data.applications.approved, color: 'var(--gm-success)' },
            { label: 'Rejected', value: data.applications.rejected, color: 'var(--gm-danger)' },
          ]}
          to="/admin/applications"
        />
        <StatCard
          label="Trainers"
          value={data.totalTrainers}
          icon={<UserCheck size={18} strokeWidth={2} />}
          accentBg="var(--gm-primary-soft)"
          accentColor="var(--gm-primary)"
        />
        <StatCard
          label="Members"
          value={data.totalMembers}
          icon={<User size={18} strokeWidth={2} />}
          accentBg="var(--gm-surface-soft)"
          accentColor="var(--gm-text-secondary)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {quickActions.map((action) => (
          <Card key={action.path} padding="md">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <div
                aria-hidden="true"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--gm-radius-lg)',
                  backgroundColor: action.bg,
                  color: action.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {action.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--gm-font-size-base)', fontWeight: 700, color: 'var(--gm-text-primary)', margin: 0 }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: 'var(--gm-font-size-sm)', color: 'var(--gm-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {action.desc}
                </p>
              </div>
            </div>
            <Link to={action.path} style={{ textDecoration: 'none', display: 'block' }}>
              <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                Manage {action.title}
                <ArrowRight size={14} strokeWidth={2} />
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};