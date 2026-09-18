import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check, X, Eye, FileText, RotateCw, Search, ChevronDown,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getApiErrorMessage } from '../../utils/apiError';
import { normalizeApplicationStatus } from '../../types/shared';
import type { ApplicationModalData, ApplicationSortBy, SortDirection } from '../../types/admin';
import { SortableHeader } from '../../components/admin/SortableHeader';
import { FilterTabs } from '../../components/admin/FilterTabs';
import { ApproveApplicationModal } from './components/ApproveApplicationModal';
import { RejectApplicationModal } from './components/RejectApplicationModal';
import { ApplicationDetailsModal } from './components/ApplicationDetailsModal';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'Pending' | 'Approved' | 'Rejected';

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

const statusBadgeVariant = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
} as const;

export const ApplicationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  // Honors /admin/applications?status=Pending deep-links (dashboard CTA)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const s = searchParams.get('status');
    return s === 'Pending' || s === 'Approved' || s === 'Rejected' ? s : 'all';
  });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ by?: ApplicationSortBy; dir: SortDirection }>({ by: undefined, dir: 'desc' });

  const [selectedForApprove, setSelectedForApprove] = useState<ApplicationModalData | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<ApplicationModalData | null>(null);
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();

  // Live pending badge — shares the dashboard cache, no extra endpoint call
  const { data: dashboard } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
    staleTime: 30_000,
  });
  const pendingCount = dashboard?.applications.pending ?? 0;

  const pagedQuery = useQuery({
    queryKey: ['admin', 'applications', { page, search: debouncedSearch, status: statusFilter, sortBy: sort.by, dir: sort.dir }],
    queryFn: () =>
      adminApi.getApplicationsPaged({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: sort.by,
        sortDirection: sort.dir,
      }),
    placeholderData: (previous) => previous,
  });

  // Full details for the details modal — the row snapshot is shown until it arrives
  const detailsQuery = useQuery({
    queryKey: ['admin', 'application-details', detailsId],
    queryFn: () => adminApi.getApplicationDetails(detailsId!),
    enabled: detailsId !== null,
  });

  const invalidateApplicationData = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveApplication(id),
    onSuccess: () => {
      invalidateApplicationData();
      setSelectedForApprove(null);
      toast.success('Application approved. The owner account and first gym have been created.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to approve the application.'));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => adminApi.rejectApplication(id, reason),
    onSuccess: () => {
      invalidateApplicationData();
      setSelectedForReject(null);
      toast.success('Application rejected.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to reject the application.'));
    },
  });

  // Every filter/sort change also resets to the first page.
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
    setSearchParams(value === 'all' ? {} : { status: value }, { replace: true });
  };

  const handleSort = (field: ApplicationSortBy) => {
    setPage(1);
    setSort((prev) =>
      prev.by === field
        ? { by: field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { by: field, dir: 'asc' }
    );
  };

  const handleDefaultSort = () => {
    setPage(1);
    setSort({ by: undefined, dir: 'desc' });
  };

  const clearFilters = () => {
    setSearchInput('');
    handleDefaultSort();
    handleStatusChange('all');
  };

  const paged = pagedQuery.data;
  const applications = paged?.items ?? [];
  const hasActiveFilters = searchInput.trim() !== '' || statusFilter !== 'all' || sort.by !== undefined;
  const selectedDetails =
    detailsId !== null ? detailsQuery.data ?? applications.find((a) => a.id === detailsId) ?? null : null;

  return (
    <div>
      <PageHeader
        title="Gym Owner Applications"
        description="Review applications submitted from the public apply page."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void pagedQuery.refetch();
            }}
            isLoading={pagedQuery.isFetching}
          >
            <RotateCw size={14} />
            Refresh
          </Button>
        }
      />

      <Card padding="md" style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <FilterTabs
            label="Filter applications by status"
            value={statusFilter}
            options={statusTabs.map((tab) => ({
              value: tab.value,
              label: tab.label,
              badgeCount: tab.value === 'Pending' ? pendingCount : undefined,
            }))}
            onChange={handleStatusChange}
          />
          <SearchInput value={searchInput} onChange={handleSearchChange} placeholder="Search name, email, phone or gym…" />
        </div>
      </Card>

      <Card padding="none">
        {pagedQuery.isLoading ? (
          <div style={{ padding: 'var(--sp-4)' }}>
            <TableSkeleton rows={6} columns={5} />
          </div>
        ) : pagedQuery.isError ? (
          <ErrorState
            title="Unable to load applications."
            message={getApiErrorMessage(pagedQuery.error)}
            onRetry={() => {
              void pagedQuery.refetch();
            }}
          />
        ) : applications.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={<Search size={22} />}
              title="No applications match your filters"
              description="Try a different search term or clear the filters."
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<FileText size={22} />}
              title="No applications yet"
              description="Applications submitted from the public apply page will appear here."
            />
          )
        ) : (
          <>
            <Table
              headers={[
                <SortableHeader key="fullname" label="Applicant" active={sort.by === 'fullname'} direction={sort.dir} onSort={() => handleSort('fullname')} />,
                <SortableHeader key="gymname" label="Gym" active={sort.by === 'gymname'} direction={sort.dir} onSort={() => handleSort('gymname')} />,
                <SortableHeader key="status" label="Status" active={sort.by === 'status'} direction={sort.dir} onSort={() => handleSort('status')} />,
                (() => {
                  const active = sort.by === undefined;
                  const headerBtn: React.CSSProperties = {
                    display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0,
                    fontWeight: active ? 600 : 500, fontSize: 'var(--font-size-sm)',
                    color: active ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                    cursor: 'pointer', background: 'none', border: 'none', whiteSpace: 'nowrap',
                  };
                  return (
                    <button key="created" type="button" onClick={handleDefaultSort} aria-label="Sort by submission date, newest first" style={headerBtn}>
                      Submitted
                      <ChevronDown size={13} style={{ color: active ? 'var(--color-primary-600)' : 'var(--color-neutral-400)' }} />
                    </button>
                  );
                })(),
                'Actions',
              ]}
            >
              {applications.map((app) => {
                const status = normalizeApplicationStatus(app.status);
                const isPending = status === 'Pending';
                const isRejected = status === 'Rejected';
                return (
                  <TableRow key={app.id} onClick={() => setDetailsId(app.id)}>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{app.fullName}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          @{app.userName} · {app.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{app.gymName}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{app.phoneNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={statusBadgeVariant[status]}>{status}</Badge></TableCell>
                    <TableCell>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        {isPending && (
                          <>
                            <Button variant="success" size="sm" iconOnly aria-label={`Approve application from ${app.fullName}`} onClick={() => setSelectedForApprove(app)} disabled={approveMutation.isPending || rejectMutation.isPending}>
                              <Check size={14} />
                            </Button>
                            <Button variant="danger" size="sm" iconOnly aria-label={`Reject application from ${app.fullName}`} onClick={() => setSelectedForReject(app)} disabled={approveMutation.isPending || rejectMutation.isPending}>
                              <X size={14} />
                            </Button>
                          </>
                        )}
                        {isRejected && app.rejectionReason && (
                          <Button variant="ghost" size="sm" onClick={() => setDetailsId(app.id)}>
                            Reason
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" iconOnly aria-label={`View details of ${app.fullName}'s application`} onClick={() => setDetailsId(app.id)}>
                          <Eye size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
            {paged && (
              <div style={{ padding: '0 var(--sp-4) var(--sp-4)' }}>
                <Pagination
                  pageNumber={paged.pageNumber}
                  pageSize={paged.pageSize}
                  totalCount={paged.totalCount}
                  totalPages={paged.totalPages}
                  onPageChange={setPage}
                  disabled={pagedQuery.isFetching}
                />
              </div>
            )}
          </>
        )}
      </Card>
      <ApproveApplicationModal
        isOpen={!!selectedForApprove}
        onClose={() => setSelectedForApprove(null)}
        onConfirm={() => {
          if (selectedForApprove) approveMutation.mutate(selectedForApprove.id);
        }}
        application={selectedForApprove}
        isLoading={approveMutation.isPending}
      />

      <RejectApplicationModal
        isOpen={!!selectedForReject}
        onClose={() => setSelectedForReject(null)}
        onConfirm={(reason) => {
          if (selectedForReject) rejectMutation.mutate({ id: selectedForReject.id, reason });
        }}
        application={selectedForReject}
        isLoading={rejectMutation.isPending}
      />

      <ApplicationDetailsModal
        isOpen={detailsId !== null}
        onClose={() => setDetailsId(null)}
        application={selectedDetails}
        onApproveClick={(app) => {
          setDetailsId(null);
          setSelectedForApprove(app);
        }}
        onRejectClick={(app) => {
          setDetailsId(null);
          setSelectedForReject(app);
        }}
      />
    </div>
  );
};