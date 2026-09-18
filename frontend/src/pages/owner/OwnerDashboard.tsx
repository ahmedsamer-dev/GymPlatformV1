import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Building2, ClipboardList, CreditCard, Search, UserCog, Users,
} from 'lucide-react';
import { ownerApi } from '../../api/owner.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatCard } from '../../components/ui/StatCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { Spinner } from '../../components/ui/Spinner';

/* All numbers below come from real backend endpoints — nothing invented. */
export const OwnerDashboard: React.FC = () => {
  const [memberIdSearch, setMemberIdSearch] = useState('');
  const navigate = useNavigate();

  const gymsQuery = useQuery({ queryKey: ['owner', 'gyms'], queryFn: () => ownerApi.getMyGyms() });
  const trainersQuery = useQuery({ queryKey: ['owner', 'trainers'], queryFn: () => ownerApi.getTrainers() });
  const plansQuery = useQuery({ queryKey: ['owner', 'membership-plans'], queryFn: () => ownerApi.getMembershipPlans() });

  const isLoading = gymsQuery.isLoading || trainersQuery.isLoading || plansQuery.isLoading;
  const isError = gymsQuery.isError || trainersQuery.isError || plansQuery.isError;
  const retryAll = () => {
    gymsQuery.refetch();
    trainersQuery.refetch();
    plansQuery.refetch();
  };

  const gyms = gymsQuery.data ?? [];
  const trainers = trainersQuery.data ?? [];
  const plans = plansQuery.data ?? [];
  const activeTrainers = trainers.filter((t) => t.isActive).length;
  const inactiveTrainers = trainers.length - activeTrainers;
  const sessionBasedPlans = plans.filter((p) => p.isSessionBased).length;

  const handleSearchMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberIdSearch.trim()) {
      navigate(`/owner/members/${memberIdSearch.trim()}`);
    }
  };

  if (isLoading) return <Spinner fullPage />;

  if (isError) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Overview of your gyms, trainers, and membership plans." />
        <ErrorState
          title="Couldn't load your dashboard"
          message="Some of your gym data could not be retrieved. Check your connection and try again."
          onRetry={retryAll}
        />
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Trainers',
      desc: 'Manage your gym staff — add, edit, or deactivate trainers.',
      icon: <Users size={18} strokeWidth={2} />,
      color: 'var(--gm-primary)',
      bg: 'var(--gm-primary-soft)',
      path: '/owner/trainers',
    },
    {
      title: 'Membership Plans',
      desc: 'Create and manage the plans available at your gym.',
      icon: <ClipboardList size={18} strokeWidth={2} />,
      color: 'var(--gm-success)',
      bg: 'var(--gm-success-soft)',
      path: '/owner/membership-plans',
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your gyms, trainers, and membership plans." />

      {/* Real statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: 'var(--gm-space-6)',
        }}
      >
        <StatCard
          label="My Gyms"
          value={gyms.length}
          icon={<Building2 size={18} strokeWidth={2} />}
          accentBg="var(--gm-primary-soft)"
          accentColor="var(--gm-primary)"
        />
        <StatCard
          label="Trainers"
          value={trainers.length}
          icon={<UserCog size={18} strokeWidth={2} />}
          subStats={[
            { label: 'Active', value: activeTrainers, color: 'var(--gm-success)' },
            { label: 'Inactive', value: inactiveTrainers, color: 'var(--gm-danger)' },
          ]}
        />
        <StatCard
          label="Membership Plans"
          value={plans.length}
          icon={<CreditCard size={18} strokeWidth={2} />}
          accentBg="var(--gm-success-soft)"
          accentColor="var(--gm-success)"
          subStats={[{ label: 'Session-based', value: sessionBasedPlans }]}
        />
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: 'var(--gm-space-6)',
        }}
      >
        {quickActions.map((s) => (
          <Card key={s.path} padding="md">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div
                aria-hidden="true"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--gm-radius-lg)',
                  backgroundColor: s.bg,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 'var(--gm-font-size-base)',
                    fontWeight: 700,
                    color: 'var(--gm-text-primary)',
                    margin: 0,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--gm-font-size-sm)',
                    color: 'var(--gm-text-secondary)',
                    marginTop: '4px',
                    lineHeight: 1.5,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </div>
            <Link to={s.path} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                Go to {s.title}
                <ArrowRight size={14} strokeWidth={2} />
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      {/* Find member */}
      <Card padding="md">
        <h3
          style={{
            fontSize: 'var(--gm-font-size-base)',
            fontWeight: 700,
            color: 'var(--gm-text-primary)',
            marginBottom: '4px',
          }}
        >
          Find Member
        </h3>
        <p
          style={{
            fontSize: 'var(--gm-font-size-sm)',
            color: 'var(--gm-text-secondary)',
            marginBottom: '16px',
          }}
        >
          Enter a member's ID to view their details.
        </p>
        <form
          onSubmit={handleSearchMember}
          style={{
            display: 'flex',
            gap: '8px',
            maxWidth: '360px',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Member ID (e.g. 1)"
              type="number"
              min="1"
              value={memberIdSearch}
              onChange={(e) => setMemberIdSearch(e.target.value)}
            />
          </div>
          <Button type="submit" size="md" disabled={!memberIdSearch.trim()} style={{ flexShrink: 0 }}>
            <Search size={16} strokeWidth={2} />
            Search
          </Button>
        </form>
      </Card>
    </div>
  );
};
