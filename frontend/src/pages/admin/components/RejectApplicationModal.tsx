import React, { useState } from 'react';
import { AlertCircle, Building2, User } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import type { ApplicationModalData } from '../../../types/admin';

interface RejectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  application: ApplicationModalData | null;
  isLoading: boolean;
}

export const RejectApplicationModal: React.FC<RejectApplicationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  application,
  isLoading,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleClose = () => {
    setReason('');
    setError(null);
    setTouched(false);
    onClose();
  };

  if (!isOpen || !application) return null;

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Rejection reason is required.';
    }
    if (trimmed.length < 5) {
      return 'Rejection reason must be at least 5 characters.';
    }
    if (trimmed.length > 500) {
      return 'Rejection reason cannot exceed 500 characters.';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReason(val);
    if (touched) {
      setError(validate(val));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(reason));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const validationError = validate(reason);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(reason.trim());
  };

  const isValid = !validate(reason);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Application" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Intro */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--gm-radius-lg)',
              backgroundColor: 'var(--gm-danger-soft)',
              border: '1px solid var(--gm-danger-border)',
              color: 'var(--gm-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertCircle size={22} strokeWidth={2} />
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
              Why are you rejecting this application?
            </h4>
            <p
              style={{
                fontSize: 'var(--gm-font-size-sm)',
                color: 'var(--gm-text-secondary)',
                lineHeight: 1.5,
                margin: '4px 0 0 0',
              }}
            >
              Please provide a clear reason. This record will be stored for audit and review purposes.
            </p>
          </div>
        </div>

        {/* Application context snippet */}
        <div
          style={{
            backgroundColor: 'var(--gm-surface-soft)',
            border: '1px solid var(--gm-border)',
            borderRadius: 'var(--gm-radius-lg)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--gm-font-size-sm)',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gm-text-primary)' }}>
            <Building2 size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)' }} />
            <span style={{ fontWeight: 600 }}>{application.gymName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gm-text-secondary)' }}>
            <User size={16} strokeWidth={2} style={{ color: 'var(--gm-text-muted)' }} />
            <span>{application.fullName}</span>
          </div>
        </div>

        {/* Reason Textarea */}
        <Textarea
          label="Rejection Reason *"
          value={reason}
          onChange={handleChange}
          onBlur={handleBlur}
          error={error || undefined}
          maxLength={500}
          showCount
          placeholder="e.g., Incomplete gym address provided, or unable to verify gym ownership credentials."
          rows={4}
          hint="Minimum 5 characters, maximum 500 characters."
          disabled={isLoading}
          autoFocus
        />

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
          <Button type="button" variant="secondary" size="md" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="md"
            isLoading={isLoading}
            disabled={isLoading || !isValid}
          >
            Reject Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};
