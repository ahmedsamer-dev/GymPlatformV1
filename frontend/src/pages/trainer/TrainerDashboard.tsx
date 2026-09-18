import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CreditCard, Search, Timer, Users,
} from 'lucide-react';
import { trainerApi } from '../../api/trainer.api';
import { normalizeSubscriptionStatus } from '../../types/shared';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatCard } from '../../components/ui/StatCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { Spinner } from '../../components/ui/Spinner';

/* All numbers below come from real backend endpoints — nothing invented. */
export const TrainerDashboard: React.FC = () => {
  const [memberIdSearch, setMemberIdSearch] = useState('');
  const navigate = useNavigate();

  const membersQuery = useQuery({ queryKey: ['trainer', 'members'], queryFn: () => trainerApi.getMembers() });
  const subscriptionsQuery = useQuery({
    queryKey: ['trainer', 'subscriptions'],
    queryFn: () => trainerApi.getSubscriptions(),
  });

  const isLoading = membersQuery.isLoading || subscriptionsQuery.isLoading;
  const isError = membersQuery.isError || subscriptionsQuery.isError;
  const retryAll = () => {
    membersQuery.refetch();
    subscriptionsQuery.refetch();
  };

  const members = membersQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const activeSubscriptions = subscriptions.filter((s) => normalizeSubscriptionStatus(s.status) === 'Active');
  const expiredSubscriptions = subscriptions.filter((s) => normalizeSubscriptionStatus(s.status) === 'Expired');
  const remainingSessions = activeSubscriptions.reduce((sum, s) => sum + (s.remainingSessions || 0), 0);

  const handleSearchMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberIdSearch.trim()) {
      navigate(`/trainer/members/${memberIdSearch.trim()}`);
    }
  };

  if (isLoading) return <Spinner fullPage />;

  if (isError) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Your members and subscriptions at a glance." />
        <ErrorState
          title="Couldn't load your dashboard"
          message="Your member or subscription data could not be retrieved. Check your connection and try again."
          onRetry={retryAll}
        />
      </div>
    );
  }

  const quickActions = [
    {
      title: 'My Members',
      desc: 'Add new members, view their details, and update their information.',
      icon: <Users size={18} strokeWidth={2} />,
      color: 'var(--gm-primary)',
      bg: 'var(--gm-primary-soft)',
      path: '/trainer/members',
    },
    {
      title: 'Subscriptions',
      desc: 'Create subscriptions, view active plans, and deduct sessions.',
      icon: <CreditCard size={18} strokeWidth={2} />,
      color: 'var(--gm-success)',
      bg: 'var(--gm-success-soft)',
      path: '/trainer/subscriptions',
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Your members and subscriptions at a glance." />

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
          label="My Members"
          value={members.length}
          icon={<Users size={18} strokeWidth={2} />}
          accentBg="var(--gm-primary-soft)"
          accentColor="var(--gm-primary)"
        />
        <StatCard
          label="Subscriptions"
          value={subscriptions.length}
          icon={<CreditCard size={18} strokeWidth={2} />}
          accentBg="var(--gm-success-soft)"
          accentColor="var(--gm-success)"
          subStats={[
            { label: 'Active', value: activeSubscriptions.length, color: 'var(--gm-success)' },
            { label: 'Expired', value: expiredSubscriptions.length, color: 'var(--gm-danger)' },
          ]}
        />
        <StatCard
          label="Sessions Remaining"
          value={remainingSessions}
          icon={<Timer size={18} strokeWidth={2} />}
          subStats={[{ label: 'Across active subscriptions', value: activeSubscriptions.length }]}
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

