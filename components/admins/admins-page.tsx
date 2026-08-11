'use client';

import {
  createColumnHelper,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Ellipsis,
  LoaderCircle,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { AddAdminDialog } from '@/components/admins/add-admin-dialog';
import type {
  AdminListItem,
  AdminsResponse,
  ApiError,
  PaginationMeta,
} from '@/components/admins/admin.types';
import { getApiErrorMessage } from '@/components/admins/admin.types';
import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

const EMPTY_ADMINS: AdminListItem[] = [];
const emptyMeta: PaginationMeta = {
  itemCount: 0,
  totalItems: 0,
  itemsPerPage: 10,
  totalPages: 0,
  currentPage: 1,
};
const tableFeaturesConfig = tableFeatures({ rowPaginationFeature });
const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  AdminListItem
>();

function createColumns({
  canManage,
  currentAccountId,
  onChanged,
}: {
  canManage: boolean;
  currentAccountId: string;
  onChanged: () => void;
}) {
  return columnHelper.columns([
    columnHelper.accessor('fullName', {
      header: 'ADMIN',
      cell: ({ row }) => <AdminIdentity admin={row.original} />,
    }),
    columnHelper.accessor('accountType', {
      header: 'ROLE',
      cell: ({ getValue }) => roleLabel(getValue()),
    }),
    columnHelper.accessor('status', {
      header: 'STATUS',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    }),
    columnHelper.accessor('phoneNumber', {
      header: 'PHONE NUMBER',
      cell: ({ getValue }) => getValue() || '—',
    }),
    columnHelper.accessor('createdAt', {
      header: 'DATE ADDED',
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.accessor('updatedAt', {
      header: 'LAST UPDATED',
      cell: ({ getValue }) => formatRelativeTime(getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'MORE',
      cell: ({ row }) =>
        canManage ? (
          <AdminActionsMenu
            admin={row.original}
            isCurrentAccount={row.original.id === currentAccountId}
            onChanged={onChanged}
          />
        ) : (
          '—'
        ),
    }),
  ]);
}

export function AdminsPage({
  caseManagersOnly = false,
}: {
  caseManagersOnly?: boolean;
}) {
  const currentAccount = useAdminAccount();
  const [admins, setAdmins] = useState<AdminListItem[]>(EMPTY_ADMINS);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [summary, setSummary] = useState({ active: 0, inactive: 0 });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState(caseManagersOnly ? 'case_manager' : '');
  const [loading, setLoading] = useState(true);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const columns = useMemo(
    () =>
      createColumns({
        canManage: currentAccount.accountType === 'admin',
        currentAccountId: currentAccount.id,
        onChanged: () => setReloadKey((value) => value + 1),
      }),
    [currentAccount.accountType, currentAccount.id],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadAdmins() {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        _refresh: String(reloadKey),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status) params.set('status', status);
      if (role) params.set('role', role);

      try {
        const response = await authenticatedFetch(`/api/admins?${params}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const result = (await response.json()) as AdminsResponse | ApiError;
        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(result as ApiError, 'Unable to load admins.'),
          );
        }

        const adminResult = result as AdminsResponse;
        setAdmins(adminResult.items);
        setMeta(adminResult.meta);
        setSummary(adminResult.summary);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        toast.error(
          error instanceof Error ? error.message : 'Unable to load admins.',
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadAdmins();
    return () => controller.abort();
  }, [
    debouncedSearch,
    pagination.pageIndex,
    pagination.pageSize,
    reloadKey,
    role,
    status,
  ]);

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: admins,
    getRowId: (admin) => admin.id,
    manualPagination: true,
    rowCount: meta.totalItems,
    state: { pagination },
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
  });

  const clearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setRole(caseManagersOnly ? 'case_manager' : '');
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [caseManagersOnly]);

  const hasFilters = Boolean(search || status || (!caseManagersOnly && role));
  const firstRow = meta.totalItems
    ? (meta.currentPage - 1) * meta.itemsPerPage + 1
    : 0;
  const lastRow = meta.totalItems
    ? Math.min(firstRow + meta.itemCount - 1, meta.totalItems)
    : 0;

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#242329]">
              {caseManagersOnly ? 'Case Managers' : 'Admins'}
            </h2>
            <p className="mt-1 text-[13px] text-[#7e7b85]">
              {caseManagersOnly
                ? 'Manage and monitor case manager accounts.'
                : 'Manage, monitor and configure administrator accounts.'}
            </p>
          </div>
          {currentAccount.accountType === 'admin' ? (
            <Button
              type="button"
              size="lg"
              onClick={() => setAddAdminOpen(true)}
              className="w-fit px-5"
            >
              <Plus className="size-4" /> Add Admin
            </Button>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#e8e6ec] bg-white p-3 shadow-[0_1px_2px_rgba(25,20,35,0.02)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 sm:max-w-[330px] sm:flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#aaa7b0]" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email…"
                aria-label="Search admins"
                className="h-10 pl-10"
              />
            </div>
            <FilterSelect
              label="Status"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPagination((current) => ({ ...current, pageIndex: 0 }));
              }}
              options={[
                ['active', 'Active'],
                ['invited', 'Invited'],
                ['inactive', 'Inactive'],
              ]}
            />
            {!caseManagersOnly ? (
              <FilterSelect
                label="Role"
                value={role}
                onChange={(value) => {
                  setRole(value);
                  setPagination((current) => ({ ...current, pageIndex: 0 }));
                }}
                options={[
                  ['admin', 'Admin'],
                  ['case_manager', 'Case Manager'],
                  ['admin_case_manager', 'Admin Case Manager'],
                ]}
              />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-600">
              Active: {summary.active}
            </span>
            <span className="rounded-full bg-[#f3f2f5] px-3 py-1.5 font-medium text-[#7f7c85]">
              Inactive: {summary.inactive}
            </span>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="px-2 py-1.5 font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#e8e6ec] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead className="bg-[#faf9fb]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="border-b border-[#e8e6ec] px-5 py-4 text-[11px] font-medium tracking-[0.02em] text-[#99969f] first:min-w-[250px]"
                      >
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading ? <LoadingRows columnCount={columns.length} /> : null}
                {!loading && table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-5 py-20 text-center"
                    >
                      <ShieldCheck className="mx-auto size-8 text-[#aaa7b2]" />
                      <p className="mt-3 text-[14px] font-medium text-[#29272e]">
                        No admins found
                      </p>
                      <p className="mt-1 text-[12px] text-[#85828b]">
                        Try changing your filters or invite a new admin.
                      </p>
                    </td>
                  </tr>
                ) : null}
                {!loading
                  ? table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#fcfbfd]">
                        {row.getAllCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="border-b border-[#efedf2] px-5 py-4 text-[13px] text-[#45424b] last:pr-6"
                          >
                            <table.FlexRender cell={cell} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 px-5 py-4 text-[12px] text-[#77757e] sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {firstRow}–{lastRow} of {meta.totalItems}{' '}
              {caseManagersOnly ? 'case managers' : 'admins'}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                Rows per page
                <select
                  value={pagination.pageSize}
                  onChange={(event) =>
                    table.setPageSize(Number(event.target.value))
                  }
                  className="h-8 rounded-lg border bg-white px-2 text-[#38353d] outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <span>
                Page {meta.currentPage} of {Math.max(1, meta.totalPages)}
              </span>
              <div className="flex gap-1">
                <PageButton
                  label="First page"
                  disabled={!table.getCanPreviousPage() || loading}
                  onClick={() => table.firstPage()}
                >
                  <ChevronsLeft />
                </PageButton>
                <PageButton
                  label="Previous page"
                  disabled={!table.getCanPreviousPage() || loading}
                  onClick={() => table.previousPage()}
                >
                  <ChevronLeft />
                </PageButton>
                <PageButton
                  label="Next page"
                  disabled={!table.getCanNextPage() || loading}
                  onClick={() => table.nextPage()}
                >
                  <ChevronRight />
                </PageButton>
                <PageButton
                  label="Last page"
                  disabled={!table.getCanNextPage() || loading}
                  onClick={() => table.lastPage()}
                >
                  <ChevronsRight />
                </PageButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentAccount.accountType === 'admin' ? (
        <AddAdminDialog
          open={addAdminOpen}
          onOpenChange={setAddAdminOpen}
          onCreated={() => setReloadKey((value) => value + 1)}
        />
      ) : null}
    </section>
  );
}

function AdminActionsMenu({
  admin,
  isCurrentAccount,
  onChanged,
}: {
  admin: AdminListItem;
  isCurrentAccount: boolean;
  onChanged: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [pendingAction, setPendingAction] = useState<
    'status' | 'invitation' | null
  >(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const closeMenu = () => setOpen(false);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [open]);

  const targetStatus = admin.status === 'inactive' ? 'active' : 'inactive';
  const statusLabel =
    targetStatus === 'active' ? 'Mark active' : 'Mark inactive';

  async function changeStatus() {
    if (
      targetStatus === 'inactive' &&
      !window.confirm(`Mark ${admin.fullName} inactive?`)
    ) {
      return;
    }
    setPendingAction('status');
    try {
      const response = await authenticatedFetch(
        `/api/admins/${admin.id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStatus }),
        },
      );
      const result = (await response.json()) as { message: string } | ApiError;
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(result as ApiError, 'Unable to update status.'),
        );
      }
      toast.success((result as { message: string }).message);
      setOpen(false);
      onChanged();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to update status.',
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function copyInvitationLink() {
    setPendingAction('invitation');
    try {
      const response = await authenticatedFetch(
        `/api/admins/${admin.id}/invitation-link`,
        {
          method: 'POST',
        },
      );
      const result = (await response.json()) as
        | { invitationUrl: string }
        | ApiError;
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            result as ApiError,
            'Unable to create an invitation link.',
          ),
        );
      }
      await navigator.clipboard.writeText(
        (result as { invitationUrl: string }).invitationUrl,
      );
      toast.success('Invitation link copied.');
      setOpen(false);
      onChanged();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to copy the invitation link.',
      );
    } finally {
      setPendingAction(null);
    }
  }

  const statusDisabled =
    pendingAction !== null || (isCurrentAccount && targetStatus === 'inactive');

  return (
    <div ref={containerRef} className="relative w-fit">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`More actions for ${admin.fullName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              setMenuPosition({
                top: rect.bottom + 4,
                left: Math.max(8, rect.right - 208),
              });
            }
          }
          setOpen((value) => !value);
        }}
      >
        {pendingAction ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <Ellipsis />
        )}
      </Button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{ top: menuPosition.top, left: menuPosition.left }}
              className="fixed z-[100] w-52 rounded-xl border border-[#e7e4eb] bg-white p-1.5 shadow-[0_12px_30px_rgba(35,28,47,0.14)]"
            >
              <button
                type="button"
                role="menuitem"
                disabled={statusDisabled}
                title={
                  isCurrentAccount && targetStatus === 'inactive'
                    ? 'You cannot deactivate your own account.'
                    : undefined
                }
                onClick={() => void changeStatus()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-[#403d46] hover:bg-[#f7f5f9] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {targetStatus === 'active' ? (
                  <UserCheck className="size-4 text-emerald-600" />
                ) : (
                  <UserX className="size-4 text-rose-500" />
                )}
                {statusLabel}
              </button>
              {admin.status !== 'active' ? (
                <button
                  type="button"
                  role="menuitem"
                  disabled={pendingAction !== null}
                  onClick={() => void copyInvitationLink()}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-[#403d46] hover:bg-[#f7f5f9] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Copy className="size-4 text-primary" />
                  Copy invitation link
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function AdminIdentity({ admin }: { admin: AdminListItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f0ecff] text-[12px] font-semibold text-[#5f3cbc]">
        {initials(admin.firstName, admin.lastName)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-[#2a282e]">
          {admin.fullName}
        </p>
        <p className="truncate text-[12px] text-[#85828b]">{admin.email}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminListItem['status'] }) {
  const classes =
    status === 'active'
      ? 'bg-emerald-50 text-emerald-600'
      : status === 'invited'
        ? 'bg-amber-50 text-amber-600'
        : 'bg-[#f1f0f3] text-[#85828b]';
  return (
    <span className={`rounded-full px-3 py-1 font-medium ${classes}`}>
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={`Filter by ${label.toLowerCase()}`}
      className="h-10 min-w-32 rounded-lg border border-[#e7e7ea] bg-white px-3 text-[13px] text-[#77747d] outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
    >
      <option value="">{label}</option>
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  );
}

function PageButton({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      className="shadow-none [&_svg]:size-3.5"
      {...props}
    >
      {children}
    </Button>
  );
}

function LoadingRows({ columnCount }: { columnCount: number }) {
  return Array.from({ length: 6 }, (_, row) => (
    <tr key={row}>
      {Array.from({ length: columnCount }, (_, column) => (
        <td key={column} className="border-b border-[#efedf2] px-5 py-5">
          <div
            className={`h-4 animate-pulse rounded bg-[#efedf2] ${
              column === 0 ? 'w-40' : 'w-20'
            }`}
          />
        </td>
      ))}
    </tr>
  ));
}

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function roleLabel(role: AdminListItem['accountType']): string {
  if (role === 'admin') return 'Admin';
  if (role === 'admin_case_manager') return 'Admin Case Manager';
  return 'Case Manager';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

function formatRelativeTime(value: string): string {
  const difference = new Date(value).getTime() - Date.now();
  const absolute = Math.abs(difference);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (absolute < 60 * 60 * 1000) {
    return formatter.format(Math.round(difference / (60 * 1000)), 'minute');
  }
  if (absolute < 24 * 60 * 60 * 1000) {
    return formatter.format(Math.round(difference / (60 * 60 * 1000)), 'hour');
  }
  return formatter.format(
    Math.round(difference / (24 * 60 * 60 * 1000)),
    'day',
  );
}
