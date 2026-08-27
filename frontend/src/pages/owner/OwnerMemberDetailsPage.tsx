import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Phone, Calendar, Building, Dumbbell } from 'lucide-react';
import { ownerApi } from '../../api/owner.api';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

export const OwnerMemberDetailsPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();

  const { data: details, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['owner', 'member', memberId],
    queryFn: () => ownerApi.getMemberById(Number(memberId)),
    enabled: !!memberId,
    retry: 1,
  });

  if (isLoading) return <Spinner fullPage />;

  if (isError) {
    const errorMsg = (error as any)?.response?.data?.message || 'Member not found or you do not have permission.';
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link
          to="/owner"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-primary-600)',
            fontWeight: 500,
            marginBottom: '16px',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <ErrorState title="Member Not Found" message={errorMsg} onRetry={refetch} />
      </div>
    );
  }

  if (!details) return null;

  const infoItems = [
    { icon: <Phone size={16} />, label: 'Phone Number', value: details.member.phoneNumber },
    { icon: <Calendar size={16} />, label: 'Joined Date', value: new Date(details.member.createdAt).toLocaleDateString() },
    { icon: <Dumbbell size={16} />, label: 'Assigned Trainer', value: details.trainer.fullName, highlight: true },
    { icon: <Building size={16} />, label: 'Gym', value: details.gym.name },
  ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <Link
        to="/owner"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-primary-600)',
          fontWeight: 500,
          marginBottom: '16px',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <Card padding="lg">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            paddingBottom: '20px',
            marginBottom: '20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-neutral-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-neutral-400)',
              flexShrink: 0,
            }}
          >
            <User size={22} />
          </div>
          <div>
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                margin: 0,
              }}
            >
              {details.member.fullName}
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Member ID: {details.member.id}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          {infoItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                }}
              >
                {item.icon}
                {item.label}
              </span>
              <span
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: item.highlight ? 500 : 400,
                  color: item.highlight ? 'var(--color-primary-600)' : 'var(--color-text-main)',
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
