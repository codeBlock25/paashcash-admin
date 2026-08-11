'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
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
  EllipsisVertical,
  Search,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import type {
  ApiError,
  PaginationMeta,
  ServicesResponse,
  ServiceTransaction,
  ServiceType,
} from './service.types';
import {
  serviceLabel,
  statusLabel,
  TransactionDialog,
} from './transaction-dialog';

const tableFeaturesConfig = tableFeatures({ rowPaginationFeature });
const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  ServiceTransaction
>();
const emptyTransactions: ServiceTransaction[] = [];
const emptyMeta: PaginationMeta = {
  itemCount: 0,
  totalItems: 0,
  itemsPerPage: 10,
  totalPages: 0,
  currentPage: 1,
};

const columns = columnHelper.columns([
  columnHelper.accessor((transaction) => transaction.user, {
    id: 'user',
    header: 'User',
    cell: ({ getValue }) => <UserCell user={getValue()} />,
  }),
  columnHelper.accessor((transaction) => transaction.user.email, {
    id: 'email',
    header: 'E-mail',
    cell: ({ getValue }) => (
      <span className="block truncate text-[#74717b]">{getValue()}</span>
    ),
  }),
  columnHelper.accessor('serviceType', {
    header: 'Service',
    cell: ({ getValue }) => (
      <span className="text-[#74717b]">{serviceLabel(getValue())}</span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: () => (
      <span className="grid size-8 place-items-center text-[#9d9aa4]">
        <EllipsisVertical className="size-4" />
      </span>
    ),
  }),
]);

const filters: Array<{ label: string; value: 'all' | ServiceType }> = [
  { label: 'All Services', value: 'all' },
  { label: 'Airtime', value: 'airtime' },
  { label: 'Data', value: 'data' },
  { label: 'Electricity', value: 'electricity' },
  { label: 'CableTV', value: 'cable-tv' },
  { label: 'Giftcards', value: 'gift-card' },
  { label: 'Airtime2Cash', value: 'airtime-to-cash' },
];

export function ServicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('transaction');
  const [transactions, setTransactions] = useState(emptyTransactions);
  const [meta, setMeta] = useState(emptyMeta);
  const [filter, setFilter] = useState<'all' | ServiceType>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<ServiceTransaction | null>(null);

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: transactions,
    manualPagination: true,
    rowCount: meta.totalItems,
    autoResetPageIndex: false,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });
  const { pageIndex, pageSize } = table.state.pagination;
  const resetPage = table.firstPage;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      resetPage();
      setDebouncedQuery(query.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [query, resetPage]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadTransactions() {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pageIndex + 1),
        limit: String(pageSize),
      });
      if (filter !== 'all') params.set('serviceType', filter);
      if (debouncedQuery) params.set('search', debouncedQuery);

      try {
        const response = await authenticatedFetch(`/api/services?${params}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const result = (await response.json()) as ServicesResponse | ApiError;
        if (!response.ok) throw new Error(apiMessage(result));
        const page = result as ServicesResponse;
        setTransactions(page.items);
        setMeta(page.meta);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        toast.error(
          error instanceof Error ? error.message : 'Unable to load services.',
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadTransactions();
    return () => controller.abort();
  }, [pageIndex, pageSize, filter, debouncedQuery]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailLoading(false);
      return;
    }

    const controller = new AbortController();
    const visibleTransaction = transactions.find(
      (transaction) => transaction.id === selectedId,
    );
    setDetail(visibleTransaction ?? null);
    setDetailLoading(true);

    async function loadDetail() {
      try {
        const response = await authenticatedFetch(
          `/api/services/${encodeURIComponent(selectedId as string)}`,
          { cache: 'no-store', signal: controller.signal },
        );
        const result = (await response.json()) as ServiceTransaction | ApiError;
        if (!response.ok) throw new Error(apiMessage(result));
        setDetail(result as ServiceTransaction);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        toast.error(
          error instanceof Error
            ? error.message
            : 'Unable to load this transaction.',
        );
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    }
    void loadDetail();
    return () => controller.abort();
  }, [selectedId, transactions]);

  const openTransaction = useCallback(
    (transaction: ServiceTransaction) => {
      setDetail(transaction);
      const params = new URLSearchParams(searchParams.toString());
      params.set('transaction', transaction.id);
      router.push(`${pathname}?${params}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeTransaction = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('transaction');
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  const totalPages = Math.max(1, table.getPageCount());

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-white px-4 pb-8 pt-5 sm:px-8">
      <div className="mx-auto max-w-[1504px]">
        <div className="overflow-x-auto rounded-xl bg-[#f5f4f6] p-1">
          <div className="grid min-w-[780px] grid-cols-7 gap-1">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={filter === item.value}
                onClick={() => {
                  setFilter(item.value);
                  table.firstPage();
                }}
                className={`h-9 rounded-lg px-3 text-[12px] font-medium transition ${
                  filter === item.value
                    ? 'bg-white text-[#29272e] shadow-sm'
                    : 'text-[#aaa7b0] hover:text-[#6e6b74]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="my-5 flex border-y border-[#ecebf0] py-5">
          <div className="relative w-full sm:max-w-[340px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a7a4ad]" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for user..."
              className="h-10 pl-9 text-[12px]"
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[#ecebf0]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed text-left text-[13px]">
              <thead className="bg-[#f7f6f8] text-[12px] font-medium text-[#77757e]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="h-[52px]">
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        className={`px-5 font-medium ${columnWidth(index)}`}
                      >
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                className={loading && transactions.length ? 'opacity-55' : ''}
              >
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    onClick={() => openTransaction(row.original)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openTransaction(row.original);
                      }
                    }}
                    className="h-[68px] cursor-pointer border-t border-[#efedf2] transition first:border-t-0 hover:bg-[#fbfaff] focus-visible:bg-[#fbfaff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
                  >
                    {row.getAllCells().map((cell) => (
                      <td key={cell.id} className="px-5">
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && transactions.length === 0 ? <TableLoading /> : null}
          {!loading && transactions.length === 0 ? (
            <div className="grid min-h-64 place-items-center px-5 text-center">
              <div>
                <p className="text-sm font-medium text-[#29272e]">
                  No service transactions found.
                </p>
                <p className="mt-1 text-[12px] text-[#85828b]">
                  Try another service category or search term.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-4 text-[12px] text-[#77757e] sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 font-medium">
            Rows per Page
            <select
              value={pageSize}
              onChange={(event) =>
                table.setPageSize(Number(event.target.value))
              }
              className="h-10 rounded-lg border bg-white px-3 text-[#38353d] outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <div className="flex items-center gap-4 font-medium">
            <span>
              Page {pageIndex + 1} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <PageButton
                label="First page"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.firstPage()}
              >
                <ChevronsLeft />
              </PageButton>
              <PageButton
                label="Previous page"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeft />
              </PageButton>
              <PageButton
                label="Next page"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRight />
              </PageButton>
              <PageButton
                label="Last page"
                disabled={!table.getCanLastPage()}
                onClick={() => table.lastPage()}
              >
                <ChevronsRight />
              </PageButton>
            </div>
          </div>
        </div>
      </div>

      <TransactionDialog
        open={Boolean(selectedId)}
        loading={detailLoading}
        transaction={detail}
        onClose={closeTransaction}
      />
    </section>
  );
}

function UserCell({ user }: { user: ServiceTransaction['user'] }) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar aria-label={fullName} className="size-8 shrink-0 bg-primary">
        {user.imageUrl ? (
          <AvatarPrimitive.Image
            src={user.imageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : null}
        <AvatarPrimitive.Fallback className="grid size-full place-items-center text-[10px] font-medium text-white">
          {initials.toUpperCase()}
        </AvatarPrimitive.Fallback>
      </Avatar>
      <span className="truncate font-medium text-[#29272e]">{fullName}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: ServiceTransaction['status'] }) {
  const className =
    status === 'completed'
      ? 'bg-emerald-50 text-emerald-500'
      : status === 'failed'
        ? 'bg-red-50 text-red-500'
        : status === 'refunded'
          ? 'bg-blue-50 text-blue-500'
          : 'bg-amber-50 text-amber-500';
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[12px] ${className}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function TableLoading() {
  return (
    <div
      className="grid gap-px bg-[#efedf2]"
      role="status"
      aria-label="Loading services"
    >
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="h-[68px] animate-pulse bg-white px-5 py-4">
          <div className="h-full rounded-lg bg-[#f5f4f6]" />
        </div>
      ))}
    </div>
  );
}

function PageButton({
  label,
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
    />
  );
}

function columnWidth(index: number) {
  return ['w-[34%]', 'w-[25%]', 'w-[15%]', 'w-[17%]', 'w-[9%]'][index];
}

function apiMessage(result: ServicesResponse | ServiceTransaction | ApiError) {
  const message = (result as ApiError).message;
  return Array.isArray(message)
    ? message.join(' ')
    : message || 'Unable to load services.';
}
