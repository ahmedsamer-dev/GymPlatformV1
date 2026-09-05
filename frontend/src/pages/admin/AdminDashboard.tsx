import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  FileQuestion,
  Search,
  RotateCw,
  Eye,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import {
  normalizeApplicationStatus,
  type GymOwnerApplication,
} from '../../types/shared';
import { ApproveApplicationModal } from './components/ApproveApplicationModal';
import { RejectApplicationModal } from './components/RejectApplicationModal';
import { ApplicationDetailsModal } from './components/ApplicationDetailsModal';

type FilterTab = 'pending' | 'all';

export const AdminDashboard: React.FC = () => {
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppForApprove, setSelectedAppForApprove] = useState<GymOwnerApplication | null>(null);
  const [selectedAppForReject, setSelectedAppForReject] = useState<GymOwnerApplication | null>(null);
  const [selectedAppForDetails, setSelectedAppForDetails] = useState<GymOwnerApplication | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();

  // Query applications based on selected filter
  const {
    data: applications,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'applications', filter],
    queryFn: () =>
      filter === 'pending'
        ? adminApi.getPendingApplications()
        : adminApi.getApplications(),
  });

  // Query pending count separately to display badge on tabs
  const { data: pendingApplications } = useQuery({
    queryKey: ['admin', 'applications', 'pending-count'],
    queryFn: () => adminApi.getPendingApplications(),
    staleTime: 30000,
  });

  const pendingCount = pendingApplications?.length ?? 0;

  // Helper for user-friendly error extraction
  const getErrorMessage = (error: any, fallback: string): string => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (typeof error?.response?.data === 'string' && error.response.data.length < 200) {
      return error.response.data;
    }
    if (error?.response?.status === 401) {
      return 'Session expired. Please log in as an administrator.';
    }
    if (error?.response?.status === 403) {
      return 'Access denied. Administrator privileges required.';
    }
    if (error?.response?.status === 404) {
      return 'Application no longer exists or was removed.';
    }
    if (error?.response?.status === 400) {
      return 'Application cannot be processed or was already modified.';
    }
    if (error?.response?.status === 500) {
      return 'An unexpected server error occurred. Please try again.';
    }
    return error?.message || fallback;
  };

  // Approve Mutation (POST /api/admin/gym-owner-applications/{id}/approve -> 204)
  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      toast.success('Gym owner application approved successfully.');
      setSelectedAppForApprove(null);
    },
    onError: (error: any) => {
      const msg = getErrorMessage(error, 'Failed to approve application.');
      toast.error(msg);
      // Invalidate on client error to sync latest state if already processed
      if (error?.response?.status === 400 || error?.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      }
    },
  });

  // Reject Mutation (POST /api/admin/gym-owner-applications/{id}/reject -> 204)
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      toast.success('Application rejected successfully.');
      setSelectedAppForReject(null);
    },
    onError: (error: any) => {
      const msg = getErrorMessage(error, 'Failed to reject application.');
      toast.error(msg);
      if (error?.response?.status === 400 || error?.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      }
    },
  });

  // Client-side search filter
  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    if (!searchQuery.trim()) return applications;

    const q = searchQuery.toLowerCase().trim();
    return applications.filter(
      (app) =>
        app.fullName?.toLowerCase().includes(q) ||
        app.userName?.toLowerCase().includes(q) ||
        app.email?.toLowerCase().includes(q) ||
        app.gymName?.toLowerCase().includes(q) ||
        app.gymAddress?.toLowerCase().includes(q) ||
        app.phoneNumber?.includes(q)
    );
  }, [applications, searchQuery]);

  const handleApproveConfirm = () => {
    if (selectedAppForApprove) {
      approveMutation.mutate(selectedAppForApprove.id);
    }
  };

  const handleRejectConfirm = (reason: string) => {
    if (selectedAppForReject) {
      rejectMutation.mutate({ id: selectedAppForReject.id, reason });
    }
  };

  const isActionRunning = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Gym Owner Applications"
        description="Review and manage applications from potential gym owners."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              title="Refresh applications"
            >
              <RotateCw size={14} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Control Bar: Tabs & Search Filter */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Tabs: [ Pending ] [ All ] */}
        <div
          role="tablist"
          aria-label="Application Filter"
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '3px',
          }}
        >
          <button
            role="tab"
            aria-selected={filter === 'pending'}
            onClick={() => setFilter('pending')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: filter === 'pending' ? 600 : 500,
              borderRadius: 'var(--radius-md)',
              color: filter === 'pending' ? 'var(--color-text-main)' : 'var(--color-text-secondary)',
              backgroundColor: filter === 'pending' ? 'var(--color-bg-surface)' : 'transparent',
              boxShadow: filter === 'pending' ? 'var(--shadow-xs)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--duration-fast) var(--ease)',
            }}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: filter === 'pending' ? 'var(--color-warning-50)' : 'var(--color-neutral-300)',
                  color: filter === 'pending' ? 'var(--color-warning-700)' : 'var(--color-neutral-700)',
                  lineHeight: '14px',
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: filter === 'all' ? 600 : 500,
              borderRadius: 'var(--radius-md)',
              color: filter === 'all' ? 'var(--color-text-main)' : 'var(--color-text-secondary)',
              backgroundColor: filter === 'all' ? 'var(--color-bg-surface)' : 'transparent',
              boxShadow: filter === 'all' ? 'var(--shadow-xs)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--duration-fast) var(--ease)',
            }}
          >
            <span>All Applications</span>
          </button>
        </div>

        {/* Search input for large tables */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-neutral-400)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter applicant or gym..."
            aria-label="Filter applications"
            style={{
              width: '100%',
              padding: '6px 12px 6px 32px',
              fontSize: 'var(--font-size-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text-main)',
              outline: 'none',
              transition: 'border-color var(--duration-fast) var(--ease)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary-500)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear filter"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-neutral-400)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <Card padding="none">
        {isLoading ? (
          /* Professional Skeleton Loader */
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  height: '24px',
                  width: '100%',
                  backgroundColor: 'var(--color-neutral-100)',
                  borderRadius: 'var(--radius-sm)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    borderBottom: '1px solid var(--color-border)',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '22%', height: '20px', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ width: '22%', height: '20px', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ width: '22%', height: '20px', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ width: '12%', height: '20px', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ width: '10%', height: '20px', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ width: '12%', height: '28px', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-md)' }} />
                </div>
              ))}
            </div>
          </div>
        ) : isError ? (
          /* Error State */
          <div style={{ padding: '32px 16px' }}>
            <ErrorState
              title="Unable to load applications."
              message="There was an issue connecting to the server. Please verify your connection and try again."
              onRetry={refetch}
            />
          </div>
        ) : filteredApplications.length === 0 ? (
          /* Empty States */
          <div style={{ padding: '32px 16px' }}>
            {searchQuery ? (
              <EmptyState
                icon={<Search size={22} />}
                title="No matching applications"
                description={`No applications match "${searchQuery}". Try clearing your search.`}
                action={
                  <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')}>
                    Clear Filter
                  </Button>
                }
              />
            ) : filter === 'pending' ? (
              <EmptyState
                icon={<Clock size={22} />}
                title="No pending applications"
                description="All submitted gym owner applications have been reviewed."
              />
            ) : (
              <EmptyState
                icon={<FileQuestion size={22} />}
                title="No applications found."
                description="There are no gym owner applications in the system yet."
              />
            )}
          </div>
        ) : (
          /* Data Table */
          <Table
            headers={['Applicant', 'Contact', 'Gym', 'Status', 'Date', 'Actions']}
            isEmpty={false}
          >
            {filteredApplications.map((app) => {
              const status = normalizeApplicationStatus(app.status);
              const isPending = status === 'Pending';
              const isApproved = status === 'Approved';
              const isRejected = status === 'Rejected';

              return (
                <TableRow key={app.id}>
                  {/* Column 1: Applicant (Full Name + @username) */}
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--color-text-main)',
                          fontSize: 'var(--font-size-base)',
                        }}
                      >
                        {app.fullName}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        @{app.userName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Column 2: Contact (Email + Phone Number) */}
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        {app.email}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {app.phoneNumber}
                      </span>
                    </div>
                  </TableCell>

                  {/* Column 3: Gym (Gym Name + Gym Address) */}
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '220px' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--color-text-main)',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        {app.gymName}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={app.gymAddress}
                      >
                        {app.gymAddress}
                      </span>
                    </div>
                  </TableCell>

                  {/* Column 4: Status (Actual status badge) */}
                  <TableCell>
                    <Badge
                      variant={
                        isPending
                          ? 'warning'
                          : isApproved
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {status}
                    </Badge>
                  </TableCell>

                  {/* Column 5: Date */}
                  <TableCell>
                    <span
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-sm)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {new Date(app.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </TableCell>

                  {/* Column 6: Actions */}
                  <TableCell>
                    {isPending ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => setSelectedAppForApprove(app)}
                          disabled={isActionRunning}
                          aria-label={`Approve ${app.fullName}'s application`}
                        >
                          <Check size={14} /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setSelectedAppForReject(app)}
                          disabled={isActionRunning}
                          aria-label={`Reject ${app.fullName}'s application`}
                        >
                          <X size={14} /> Reject
                        </Button>
                      </div>
                    ) : isApproved ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--color-success-700)',
                            userSelect: 'none',
                          }}
                        >
                          <CheckCircle2 size={15} /> Approved
                        </span>
                        <button
                          onClick={() => setSelectedAppForDetails(app)}
                          title="View Details"
                          aria-label="View application details"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-neutral-400)',
                            padding: '4px',
                            display: 'flex',
                            borderRadius: 'var(--radius-sm)',
                            transition: 'color var(--duration-fast) var(--ease)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--color-neutral-700)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--color-neutral-400)';
                          }}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    ) : isRejected ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--color-danger-700)',
                            userSelect: 'none',
                          }}
                        >
                          <XCircle size={15} /> Rejected
                        </span>
                        {app.rejectionReason && (
                          <button
                            onClick={() => setSelectedAppForDetails(app)}
                            title={`Reason: ${app.rejectionReason}`}
                            aria-label="View rejection reason"
                            style={{
                              padding: '2px 8px',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 500,
                              color: 'var(--color-neutral-600)',
                              backgroundColor: 'var(--color-neutral-100)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={12} /> Reason
                          </button>
                        )}
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        )}
      </Card>

      {/* Approve Confirmation Modal */}
      <ApproveApplicationModal
        isOpen={!!selectedAppForApprove}
        onClose={() => setSelectedAppForApprove(null)}
        onConfirm={handleApproveConfirm}
        application={selectedAppForApprove}
        isLoading={approveMutation.isPending}
      />

      {/* Reject Reason Modal */}
      <RejectApplicationModal
        isOpen={!!selectedAppForReject}
        onClose={() => setSelectedAppForReject(null)}
        onConfirm={handleRejectConfirm}
        application={selectedAppForReject}
        isLoading={rejectMutation.isPending}
      />

      {/* Application Details / Rejection Reason View Modal */}
      <ApplicationDetailsModal
        isOpen={!!selectedAppForDetails}
        onClose={() => setSelectedAppForDetails(null)}
        application={selectedAppForDetails}
        onApproveClick={(app) => setSelectedAppForApprove(app)}
        onRejectClick={(app) => setSelectedAppForReject(app)}
      />
    </div>
  );
};
