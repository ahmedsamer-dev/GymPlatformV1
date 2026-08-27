import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Activity, CreditCard, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const features = [
  {
    icon: <Users size={20} />,
    title: 'Trainer Management',
    desc: 'Onboard trainers, manage access, and organize your gym staff from one place.',
    color: 'var(--color-primary-600)',
    bg: 'var(--color-primary-50)',
  },
  {
    icon: <Activity size={20} />,
    title: 'Member Tracking',
    desc: 'Trainers create and manage member profiles. Keep all member data centralized.',
    color: 'var(--color-success-600)',
    bg: 'var(--color-success-50)',
  },
  {
    icon: <CreditCard size={20} />,
    title: 'Flexible Subscriptions',
    desc: 'Time-based or session-based plans. Session check-ins with one click.',
    color: 'var(--color-warning-600)',
    bg: 'var(--color-warning-50)',
  },
  {
    icon: <Shield size={20} />,
    title: 'Role-Based Access',
    desc: 'Owners, trainers, and admins each see only what they need.',
    color: 'var(--color-neutral-600)',
    bg: 'var(--color-neutral-100)',
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
          backgroundColor: 'var(--color-bg-surface)',
        }}
      >
        <div style={{ maxWidth: '640px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              lineHeight: 'var(--line-height-tight)',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}
          >
            The platform your gym{' '}
            <span style={{ color: 'var(--color-primary-600)' }}>actually needs</span>
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-relaxed)',
              marginBottom: '32px',
              maxWidth: '480px',
              margin: '0 auto 32px',
            }}
          >
            Manage trainers, members, and memberships in one clean system. No complexity, no bloat.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/apply" style={{ textDecoration: 'none' }}>
              <Button size="lg">
                Become a Gym Owner
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: '64px 24px',
          backgroundColor: 'var(--color-bg-base)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                marginBottom: '8px',
              }}
            >
              What you get
            </h2>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)' }}>
              Everything to run your gym operations — nothing more.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '24px',
                  transition: `box-shadow var(--duration-base) var(--ease)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: f.bg,
                    color: f.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 600,
                    color: 'var(--color-text-main)',
                    marginBottom: '6px',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-relaxed)',
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
