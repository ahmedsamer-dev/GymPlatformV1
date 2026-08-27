import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const shortcuts = [
  {
    title: 'My Members',
    desc: 'Add new members, view their details, and update their information.',
    icon: <Users size={20} />,
    color: 'var(--color-primary-600)',
    bg: 'var(--color-primary-50)',
    path: '/trainer/members',
  },
  {
    title: 'Subscriptions',
    desc: 'Create subscriptions, view active plans, and deduct sessions.',
    icon: <CreditCard size={20} />,
    color: 'var(--color-success-600)',
    bg: 'var(--color-success-50)',
    path: '/trainer/subscriptions',
  },
];

export const TrainerDashboard: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Manage your members and their subscriptions."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {shortcuts.map((s) => (
          <Card key={s.path} padding="md">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
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
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 600,
                    color: 'var(--color-text-main)',
                    margin: 0,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                    marginTop: '2px',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </div>
            <Link to={s.path} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                Go to {s.title}
                <ArrowRight size={14} />
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};
