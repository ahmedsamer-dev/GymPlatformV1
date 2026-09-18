import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Dumbbell, Eye, Power, PowerOff, RotateCw, Search, X } from 'lucide-react';
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
import { useToast } from '../../components/ui/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { getApiErrorMessage } from '../../utils/apiError';
import { ActiveBadge } from '../../components/admin/ActiveBadge';
import { SortableHeader } from '../../components/admin/SortableHeader';
import type { GymListItem, GymSortBy, SortDirection } from '../../types/admin';

const PAGE_SIZE = 10;

type ActiveFilter = 'all' | 'active' | 'inactive';

const activeFilterToParam: Record<ActiveFilter, boolean | undefined> = {
  all: undefined,
  active: true,
  inactive: false,
};

export const GymsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ by?: GymSortBy; dir: SortDirection }>({ by: undefined, dir: 'desc' });
  const [statusTarget, setStatusTarget] = useState<GymListItem | null>(null);
  // Optional owner deep-link: /admin/gyms?ownerId=5 (from the owner details page)
  const [ownerIdFilter, setOwnerIdFilter] = useState<number | null>(() => {
    const raw = searchParams.get('ownerId');
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  });

  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const gymsQuery = useQuery({
    queryKey: ['admin', 'gyms', { page, search: debouncedSearch, active: activeFilter, owner: ownerIdFilter, sortBy: sort.by, dir: sort.dir }],
    queryFn: () =>
      adminApi.getGymsPaged({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        isActive: activeFilterToParam[activeFilter],
        ownerId: ownerIdFilter ?? undefined,
        sortBy: sort.by,
        sortDirection: sort.dir,
      }),
    placeholderData: (previous) => previous,
  });

  // Owner display name for the deep-link chip (only when the filter is active)
  const ownerNameQuery = useQuery({
    queryKey: ['admin', 'owner-details', ownerIdFilter],
    queryFn: () => adminApi.getOwnerDetails(ownerIdFilter!),
    enabled: ownerIdFilter !== null,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => adminApi.setGymStatus(id, active),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'gyms'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owner-details'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setStatusTarget(null);
      toast.success(
        variables.active
          ? 'Gym activated — its owner and trainers can operate it again.'
          : 'Gym deactivated — operations on it are blocked. Trainers, members, plans and history are preserved.'
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update the gym status.'));
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

  const handleSort = (field: GymSortBy) => {
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

  const clearOwnerFilter = () => {
    setOwnerIdFilter(null);
    setPage(1);
    setSearchParams(
      (prev) => {
        prev.delete('ownerId');
        return prev;
      },
      { replace: true }
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setActiveFilter('all');
    setOwnerIdFilter(null);
    setSearchParams({}, { replace: true });
    handleDefaultSort();
  };

  const paged = gymsQuery.data;
  const gyms = paged?.items ?? [];
  const hasActiveFilters =
    searchInput.trim() !== '' || activeFilter !== 'all' || sort.by !== undefined || ownerIdFilter !== null;

  return (
    <div>
      <PageHeader
        title="Gyms"
        description="Every gym on the platform, with owner and capacity overview."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void gymsQuery.refetch();
            }}
            isLoading={gymsQuery.isFetching}
          >
            <RotateCw size={14} />
            Refresh
          </Button>
        }
      />

      {ownerIdFilter !== null && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-primary-700)',
            marginBottom: 'var(--sp-3)',
          }}
        >
          <span>
            Filtered by owner:{' '}
            <strong>{ownerNameQuery.data?.fullName ?? `#${ownerIdFilter}`}</strong>
          </span>
          <button
            type="button"
            onClick={clearOwnerFilter}
            aria-label="Clear owner filter"
            style={{ display: 'inline-flex', color: 'var(--color-primary-600)' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <Card padding="md" style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <FilterTabs
            label="Filter gyms by status"
            value={activeFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            onChange={handleActiveFilterChange}
          />
          <SearchInput value={searchInput} onChange={handleSearchChange} placeholder="Search gym, address, phone or owner…" />
        </div>
      </Card>

      <Card padding="none">
        {gymsQuery.isLoading ? (
          <div style={{ padding: 'var(--sp-4)' }}>
            <TableSkeleton rows={6} columns={7} />
          </div>
        ) : gymsQuery.isError ? (
          <ErrorState
            title="Unable to load gyms."
            message={getApiErrorMessage(gymsQuery.error)}
            onRetry={() => {
              void gymsQuery.refetch();
            }}
          />
        ) : gyms.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={<Search size={22} />}
              title="No gyms match your filters"
              description="Try a different search term or clear the filters."
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Dumbbell size={22} />}
              title="No gyms yet"
              description="Gyms appear here once owners are approved and onboarded."
            />
          )
        ) : (
          <>
            <Table
              headers={[
                <SortableHeader key="name" label="Gym" active={sort.by === 'name'} direction={sort.dir} onSort={() => handleSort('name')} />,
                <SortableHeader key="ownername" label="Owner" active={sort.by === 'ownername'} direction={sort.dir} onSort={() => handleSort('ownername')} />,
                'Status',
                <SortableHeader key="trainercount" label="Trainers" active={sort.by === 'trainercount'} direction={sort.dir} onSort={() => handleSort('trainercount')} />,
                <SortableHeader key="membercount" label="Members" active={sort.by === 'membercount'} direction={sort.dir} onSort={() => handleSort('membercount')} />,
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
              {gyms.map((gym) => (
                <TableRow key={gym.id} onClick={() => navigate(`/admin/gyms/${gym.id}`)}>
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{gym.name}</span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{gym.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/owners/${gym.ownerId}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}
                    >
                      {gym.ownerName}
                    </Link>
                  </TableCell>
                  <TableCell><ActiveBadge isActive={gym.isActive} /></TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{gym.trainerCount}</span>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{gym.memberCount}</span>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(gym.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <Link to={`/admin/gyms/${gym.id}`} aria-label={`View details of ${gym.name}`}>
                        <Button variant="secondary" size="sm" iconOnly>
                          <Eye size={14} />
                        </Button>
                      </Link>
                      {gym.isActive ? (
                        <Button variant="danger" size="sm" iconOnly aria-label={`Deactivate ${gym.name}`} onClick={() => setStatusTarget(gym)} disabled={statusMutation.isPending}>
                          <PowerOff size={14} />
                        </Button>
                      ) : (
                        <Button variant="success" size="sm" iconOnly aria-label={`Activate ${gym.name}`} onClick={() => setStatusTarget(gym)} disabled={statusMutation.isPending}>
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
                  disabled={gymsQuery.isFetching}
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
        title={statusTarget?.isActive ? 'Deactivate this gym?' : 'Activate this gym?'}
        message={
          statusTarget?.isActive
            ? `${statusTarget.name} will be operationally inactive — its owner and trainers cannot work with it. Trainers, members, plans and history are NOT deleted and are restored when the gym is re-activated.`
            : `${statusTarget?.name ?? 'This gym'} will be operationally active again for its owner and trainers.`
        }
        confirmLabel={statusTarget?.isActive ? 'Deactivate Gym' : 'Activate Gym'}
        variant={statusTarget?.isActive ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
};