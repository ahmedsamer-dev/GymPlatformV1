import React from 'react';
import { CheckCircle2, User, Building2, Calendar } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { ApplicationModalData } from '../../../types/admin';

interface ApproveApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  application: ApplicationModalData | null;
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
              borderRadius: 'var(--gm-radius-lg)',
              backgroundColor: 'var(--gm-success-soft)',
              border: '1px solid var(--gm-success-border)',
              color: 'var(--gm-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={24} strokeWidth={2} />
          </div>
          <div>
            <h4
              style={{
                fontSize: 'var(--gm-font-size-base)',
                fontWeight: 700,
                color: 'var(--gm-text-primary)',
                margin: 0,
              }}
            >
              Are you sure you want to approve this application?
            </h4>
            <p
              style={{
                fontSize: 'var(--gm-font-size-sm)',
                color: 'var(--gm-text-secondary)',
                lineHeight: 1.5,
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
            backgroundColor: 'var(--gm-surface-soft)',
            border: '1px solid var(--gm-border)',
            borderRadius: 'var(--gm-radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: 'var(--gm-font-size-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gm-text-primary)' }}>
            <Building2 size={16} strokeWidth={2} style={{ color: 'var(--gm-primary)', flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>{application.gymName}</span>
            {application.gymAddress && (
              <span style={{ color: 'var(--gm-text-muted)', fontSize: 'var(--gm-font-size-xs)' }}>
                ({application.gymAddress})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gm-text-secondary)' }}>
            <User size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)', flexShrink: 0 }} />
            <span>
              <strong>{application.fullName}</strong> (@{application.userName}) · {application.email}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gm-text-muted)' }}>
            <Calendar size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)', flexShrink: 0 }} />
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
            paddingTop: '16px',
            borderTop: '1px solid var(--gm-border)',
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
