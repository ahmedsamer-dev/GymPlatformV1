import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ClipboardList, Search, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const shortcuts = [
  {
    title: 'Trainers',
    desc: 'Manage your gym staff — add, edit, or deactivate trainers.',
    icon: <Users size={20} />,
    color: 'var(--color-primary-600)',
    bg: 'var(--color-primary-50)',
    path: '/owner/trainers',
  },
  {
    title: 'Membership Plans',
    desc: 'Create and manage the plans available at your gym.',
    icon: <ClipboardList size={20} />,
    color: 'var(--color-success-600)',
    bg: 'var(--color-success-50)',
    path: '/owner/membership-plans',
  },
];

export const OwnerDashboard: React.FC = () => {
  const [memberIdSearch, setMemberIdSearch] = useState('');
  const navigate = useNavigate();

  const handleSearchMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberIdSearch.trim()) {
      navigate(`/owner/members/${memberIdSearch.trim()}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your gym's operations."
      />

      {/* Shortcut Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
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

      {/* Member Search */}
      <Card padding="md">
        <h3
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            color: 'var(--color-text-main)',
            marginBottom: '4px',
          }}
        >
          Find Member
        </h3>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
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
            <Search size={16} />
            Search
          </Button>
        </form>
      </Card>
    </div>
  );
};
