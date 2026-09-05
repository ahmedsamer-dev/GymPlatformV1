import React from 'react';
import { CheckCircle2, User, Building2, Calendar } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { GymOwnerApplication } from '../../../types/shared';

interface ApproveApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  application: GymOwnerApplication | null;
  isLoading: boolean;
}

export const ApproveApplicationModal: React.FC<ApproveApplicationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  application,
  isLoading,
}) => {
  if (!application) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Gym Owner Application?" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Intro */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-success-50)',
              color: 'var(--color-success-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                margin: 0,
              }}
            >
              Are you sure you want to approve this application?
            </h4>
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--line-height-relaxed)',
                margin: '4px 0 0 0',
              }}
            >
              Approving this application will grant the applicant access to manage their gym on the platform.
            </p>
          </div>
        </div>

        {/* Application Summary Box */}
        <div
          style={{
            backgroundColor: 'var(--color-neutral-50)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)' }}>
            <Building2 size={16} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>{application.gymName}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
              ({application.gymAddress})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
            <User size={16} style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
            <span>
              <strong>{application.fullName}</strong> (@{application.userName}) · {application.email}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
            <Calendar size={16} style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
            <span>
              Submitted on {new Date(application.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            paddingTop: '12px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="success"
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Approve Application
          </Button>
        </div>
      </div>
    </Modal>
  );
};
