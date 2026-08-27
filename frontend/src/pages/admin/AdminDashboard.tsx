import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export const AdminDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveConfirm, setApproveConfirm] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: applications, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'applications', filter],
    queryFn: () => (filter === 'pending' ? adminApi.getPendingApplications() : adminApi.getApplications()),
  });

  const approveMutation = useMutation({
    mutationFn: adminApi.approveApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      setApproveConfirm(null);
      toast.success('Application approved successfully.');
    },
    onError: () => {
      toast.error('Failed to approve application.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => adminApi.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedAppId(null);
      toast.success('Application rejected.');
    },
    onError: () => {
      toast.error('Failed to reject application.');
    },
  });

  const openRejectModal = (id: number) => {
    setSelectedAppId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = () => {
    if (selectedAppId && rejectReason.trim()) {
      rejectMutation.mutate({ id: selectedAppId, reason: rejectReason });
    }
  };

  if (isLoading) return <Spinner fullPage />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Gym Owner Applications"
        description="Review and manage applications from potential gym owners."
        action={
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-neutral-100)',
              borderRadius: 'var(--radius-md)',
              padding: '3px',
              border: '1px solid var(--color-border)',
            }}
          >
            {(['pending', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 14px',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-sm)',
                  color: filter === f ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                  backgroundColor: filter === f ? 'var(--color-bg-surface)' : 'transparent',
                  boxShadow: filter === f ? 'var(--shadow-xs)' : 'none',
                  transition: `all var(--duration-fast) var(--ease)`,
                }}
              >
                {f === 'pending' ? 'Pending' : 'All'}
              </button>
            ))}
          </div>
        }
      />

      <Card padding="none">
        <Table
          headers={['Applicant', 'Contact', 'Gym', 'Status', 'Date', 'Actions']}
          isEmpty={!applications || applications.length === 0}
          emptyMessage={`No ${filter === 'pending' ? 'pending ' : ''}applications found.`}
        >
          {applications?.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{app.fullName}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '1px' }}>@{app.userName}</div>
              </TableCell>
              <TableCell>
                <div style={{ color: 'var(--color-text-secondary)' }}>{app.email}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '1px' }}>{app.phoneNumber}</div>
              </TableCell>
              <TableCell>
                <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{app.gymName}</div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                    marginTop: '1px',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={app.gymAddress}
                >
                  {app.gymAddress}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={app.status === 'Pending' ? 'warning' : app.status === 'Approved' ? 'success' : 'danger'}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell>
                {app.status === 'Pending' ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setApproveConfirm(app.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <Check size={14} /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openRejectModal(app.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <X size={14} /> Reject
                    </Button>
                  </div>
                ) : (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-faint)' }}>Processed</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      {/* Approve Confirm */}
      <ConfirmDialog
        isOpen={!!approveConfirm}
        onClose={() => setApproveConfirm(null)}
        onConfirm={() => {
          if (approveConfirm) approveMutation.mutate(approveConfirm);
        }}
        title="Approve Application"
        message="Are you sure you want to approve this gym owner application? The applicant will be granted access."
        confirmLabel="Approve"
        variant="primary"
        isLoading={approveMutation.isPending}
      />

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Application" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Please provide a reason for rejecting this application.
          </p>
          <Input
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g., Incomplete information provided"
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              paddingTop: '12px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              isLoading={rejectMutation.isPending}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
