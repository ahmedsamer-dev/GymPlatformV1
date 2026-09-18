import React from 'react';
import { User, Phone, Mail, MapPin, Building, Calendar, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { normalizeApplicationStatus } from '../../../types/shared';
import type { ApplicationModalData } from '../../../types/admin';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationModalData | null;
  onApproveClick?: (app: ApplicationModalData) => void;
  onRejectClick?: (app: ApplicationModalData) => void;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  onClose,
  application,
  onApproveClick,
  onRejectClick,
}) => {
  if (!application) return null;

  const normalizedStatus = normalizeApplicationStatus(application.status);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Details" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header summary with status badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--gm-border)',
          }}
        >
          <div>
            <h3 style={{ fontSize: 'var(--gm-font-size-md)', fontWeight: 700, color: 'var(--gm-text-primary)', margin: 0 }}>
              {application.gymName}
            </h3>
            <p style={{ fontSize: 'var(--gm-font-size-xs)', color: 'var(--gm-text-muted)', margin: '2px 0 0 0' }}>
              Application ID #{application.id}
            </p>
          </div>
          <Badge
            variant={
              normalizedStatus === 'Pending'
                ? 'warning'
                : normalizedStatus === 'Approved'
                ? 'success'
                : 'danger'
            }
          >
            {normalizedStatus}
          </Badge>
        </div>

        {/* Rejection reason callout if rejected */}
        {normalizedStatus === 'Rejected' && application.rejectionReason && (
          <div
            style={{
              backgroundColor: 'var(--gm-danger-soft)',
              border: '1px solid var(--gm-danger-border)',
              borderRadius: 'var(--gm-radius-md)',
              padding: '12px 16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={18} strokeWidth={2} style={{ color: 'var(--gm-danger)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: 'var(--gm-font-size-xs)', fontWeight: 700, color: 'var(--gm-danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rejection Reason
              </div>
              <p style={{ fontSize: 'var(--gm-font-size-sm)', color: 'var(--gm-danger)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                {application.rejectionReason}
              </p>
            </div>
          </div>
        )}

        {/* Applicant Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: 'var(--gm-font-size-xs)', fontWeight: 700, color: 'var(--gm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Applicant Information
          </span>
          <div
            style={{
              backgroundColor: 'var(--gm-surface-soft)',
              border: '1px solid var(--gm-border)',
              borderRadius: 'var(--gm-radius-lg)',
              padding: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: 'var(--gm-font-size-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--gm-text-primary)' }}>{application.fullName}</div>
                <div style={{ fontSize: 'var(--gm-font-size-xs)', color: 'var(--gm-text-muted)' }}>@{application.userName}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)' }} />
              <span style={{ color: 'var(--gm-text-secondary)' }}>{application.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)' }} />
              <span style={{ color: 'var(--gm-text-secondary)' }}>{application.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Gym Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: 'var(--gm-font-size-xs)', fontWeight: 700, color: 'var(--gm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gym Details
          </span>
          <div
            style={{
              backgroundColor: 'var(--gm-surface-soft)',
              border: '1px solid var(--gm-border)',
              borderRadius: 'var(--gm-radius-lg)',
              padding: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: 'var(--gm-font-size-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)' }} />
              <span style={{ fontWeight: 600, color: 'var(--gm-text-primary)' }}>{application.gymName}</span>
            </div>
            {application.gymAddress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)' }} />
                <span style={{ color: 'var(--gm-text-secondary)' }}>{application.gymAddress}</span>
              </div>
            )}
            {application.gymPhoneNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)' }} />
                <span style={{ color: 'var(--gm-text-secondary)' }}>{application.gymPhoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: 'var(--gm-font-size-xs)',
            color: 'var(--gm-text-muted)',
            paddingTop: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} strokeWidth={2} />
            <span>Submitted: {new Date(application.createdAt).toLocaleString()}</span>
          </div>
          {application.reviewedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} strokeWidth={2} />
              <span>Reviewed: {new Date(application.reviewedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: normalizedStatus === 'Pending' ? 'space-between' : 'flex-end',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--gm-border)',
            gap: '8px',
          }}
        >
          {normalizedStatus === 'Pending' ? (
            <>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onApproveClick?.(application);
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onRejectClick?.(application);
                  }}
                >
                  Reject
                </Button>
              </div>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
