import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Eye, Power, PowerOff, RotateCw, Search, Users } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterTabs } from '../../components/admin/FilterTabs';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getApiErrorMessage } from '../../utils/apiError';
import { ActiveBadge } from '../../components/admin/ActiveBadge';
import { SortableHeader } from '../../components/admin/SortableHeader';
import type { OwnerListItem, OwnerSortBy, SortDirection } from '../../types/admin';

const PAGE_SIZE = 10;

type ActiveFilter = 'all' | 'active' | 'inactive';

const activeFilterToParam: Record<ActiveFilter, boolean | undefined> = {
  all: undefined,
  active: true,
  inactive: false,
};

export const OwnersPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ by?: OwnerSortBy; dir: SortDirection }>({ by: undefined, dir: 'desc' });
  const [statusTarget, setStatusTarget] = useState<OwnerListItem | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const ownersQuery = useQuery({
    queryKey: ['admin', 'owners', { page, search: debouncedSearch, active: activeFilter, sortBy: sort.by, dir: sort.dir }],
    queryFn: () =>
      adminApi.getOwnersPaged({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        isActive: activeFilterToParam[activeFilter],
        sortBy: sort.by,
        sortDirection: sort.dir,
      }),
    placeholderData: (previous) => previous,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => adminApi.setOwnerStatus(id, active),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owners'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owner-details'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setStatusTarget(null);
      toast.success(
        variables.active
          ? 'Owner activated — they can log in and operate again.'
          : 'Owner deactivated — login and operations are blocked. All business data is preserved.'
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update the owner status.'));
    },
  });

  // Every filter/sort change also resets to the first page.
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleActiveFilterChange = (value: ActiveFilter) => {
    setActiveFilter(value);
    setPage(1);
  };

  const handleSort = (field: OwnerSortBy) => {
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
    setActiveFilter('all');
    handleDefaultSort();
  };

  const paged = ownersQuery.data;
  const owners = paged?.items ?? [];
  const hasActiveFilters = searchInput.trim() !== '' || activeFilter !== 'all' || sort.by !== undefined;

  return (
    <div>
      <PageHeader
        title="Owners"
        description="All GymOwner accounts registered on the platform."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void ownersQuery.refetch();
            }}
            isLoading={ownersQuery.isFetching}
          >
            <RotateCw size={14} />
            Refresh
          </Button>
        }
      />

      <Card padding="md" style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <FilterTabs
            label="Filter owners by status"
            value={activeFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            onChange={handleActiveFilterChange}
          />
          <SearchInput value={searchInput} onChange={handleSearchChange} placeholder="Search name, username, email or phone…" />
        </div>
      </Card>

      <Card padding="none">
        {ownersQuery.isLoading ? (
          <div style={{ padding: 'var(--sp-4)' }}>
            <TableSkeleton rows={6} columns={6} />
          </div>
        ) : ownersQuery.isError ? (
          <ErrorState
            title="Unable to load owners."
            message={getApiErrorMessage(ownersQuery.error)}
            onRetry={() => {
              void ownersQuery.refetch();
            }}
          />
        ) : owners.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={<Search size={22} />}
              title="No owners match your filters"
              description="Try a different search term or clear the filters."
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Users size={22} />}
              title="No owners yet"
              description="Owners appear here after their applications are approved."
            />
          )
        ) : (
          <>
            <Table
              headers={[
                <SortableHeader key="fullname" label="Owner" active={sort.by === 'fullname'} direction={sort.dir} onSort={() => handleSort('fullname')} />,
                'Phone',
                'Status',
                <SortableHeader key="gymcount" label="Gyms" active={sort.by === 'gymcount'} direction={sort.dir} onSort={() => handleSort('gymcount')} />,
                (() => {
                  const active = sort.by === undefined;
                  const headerBtn: React.CSSProperties = {
                    display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0,
                    fontWeight: active ? 600 : 500, fontSize: 'var(--font-size-sm)',
                    color: active ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                    cursor: 'pointer', background: 'none', border: 'none', whiteSpace: 'nowrap',
                  };
                  return (
                    <button key="created" type="button" onClick={handleDefaultSort} aria-label="Sort by creation date, newest first" style={headerBtn}>
                      Created
                      <ChevronDown size={13} style={{ color: active ? 'var(--color-primary-600)' : 'var(--color-neutral-400)' }} />
                    </button>
                  );
                })(),
                'Actions',
              ]}
            >
              {owners.map((owner) => (
                <TableRow key={owner.id} onClick={() => navigate(`/admin/owners/${owner.id}`)}>
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{owner.fullName}</span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        @{owner.userName} · {owner.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {owner.phoneNumber}
                    </span>
                  </TableCell>
                  <TableCell><ActiveBadge isActive={owner.isActive} /></TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{owner.gymCount}</span>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(owner.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <Link to={`/admin/owners/${owner.id}`} aria-label={`View details of ${owner.fullName}`}>
                        <Button variant="secondary" size="sm" iconOnly>
                          <Eye size={14} />
                        </Button>
                      </Link>
                      {owner.isActive ? (
                        <Button variant="danger" size="sm" iconOnly aria-label={`Deactivate ${owner.fullName}`} onClick={() => setStatusTarget(owner)} disabled={statusMutation.isPending}>
                          <PowerOff size={14} />
                        </Button>
                      ) : (
                        <Button variant="success" size="sm" iconOnly aria-label={`Activate ${owner.fullName}`} onClick={() => setStatusTarget(owner)} disabled={statusMutation.isPending}>
                          <Power size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
            {paged && (
              <div style={{ padding: '0 var(--sp-4) var(--sp-4)' }}>
                <Pagination
                  pageNumber={paged.pageNumber}
                  pageSize={paged.pageSize}
                  totalCount={paged.totalCount}
                  totalPages={paged.totalPages}
                  onPageChange={setPage}
                  disabled={ownersQuery.isFetching}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => {
          if (statusTarget) statusMutation.mutate({ id: statusTarget.id, active: !statusTarget.isActive });
        }}
        title={statusTarget?.isActive ? 'Deactivate this owner?' : 'Activate this owner?'}
        message={
          statusTarget?.isActive
            ? `${statusTarget.fullName ?? 'This owner'} will no longer be able to log in or operate. Their gyms, trainers, members and history are NOT deleted — everything is preserved and restored if the account is re-activated.`
            : `${statusTarget?.fullName ?? 'This owner'} will be able to log in and operate their gyms again.`
        }
        confirmLabel={statusTarget?.isActive ? 'Deactivate Owner' : 'Activate Owner'}
        variant={statusTarget?.isActive ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
};