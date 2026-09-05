import React, { useState } from 'react';
import { AlertCircle, Building2, User } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import type { GymOwnerApplication } from '../../../types/shared';

interface RejectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  application: GymOwnerApplication | null;
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-danger-50)',
              color: 'var(--color-danger-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertCircle size={22} />
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
              Why are you rejecting this application?
            </h4>
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--line-height-relaxed)',
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
            backgroundColor: 'var(--color-neutral-50)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--font-size-sm)',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-main)' }}>
            <Building2 size={16} style={{ color: 'var(--color-neutral-400)' }} />
            <span style={{ fontWeight: 600 }}>{application.gymName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
            <User size={16} style={{ color: 'var(--color-neutral-400)' }} />
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
            paddingTop: '12px',
            borderTop: '1px solid var(--color-border)',
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
