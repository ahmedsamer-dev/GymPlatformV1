import React from 'react';
import { User, Phone, Mail, MapPin, Building, Calendar, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { normalizeApplicationStatus, type GymOwnerApplication } from '../../../types/shared';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: GymOwnerApplication | null;
  onApproveClick?: (app: GymOwnerApplication) => void;
  onRejectClick?: (app: GymOwnerApplication) => void;
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
            paddingBottom: '12px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
              {application.gymName}
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
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
              backgroundColor: 'var(--color-danger-50)',
              border: '1px solid var(--color-danger-200)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={18} style={{ color: 'var(--color-danger-500)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-danger-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rejection Reason
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-700)', margin: '4px 0 0 0', lineHeight: 'var(--line-height-normal)' }}>
                {application.rejectionReason}
              </p>
            </div>
          </div>
        )}

        {/* Applicant Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Applicant Information
          </span>
          <div
            style={{
              backgroundColor: 'var(--color-neutral-50)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={15} style={{ color: 'var(--color-neutral-400)' }} />
              <div>
                <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{application.fullName}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>@{application.userName}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} style={{ color: 'var(--color-neutral-400)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>{application.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} style={{ color: 'var(--color-neutral-400)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>{application.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Gym Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gym Details
          </span>
          <div
            style={{
              backgroundColor: 'var(--color-neutral-50)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={15} style={{ color: 'var(--color-neutral-400)' }} />
              <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{application.gymName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} style={{ color: 'var(--color-neutral-400)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>{application.gymAddress}</span>
            </div>
            {application.gymPhoneNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} style={{ color: 'var(--color-neutral-400)' }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>{application.gymPhoneNumber}</span>
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
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            paddingTop: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>Submitted: {new Date(application.createdAt).toLocaleString()}</span>
          </div>
          {application.reviewedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
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
            paddingTop: '12px',
            borderTop: '1px solid var(--color-border)',
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
