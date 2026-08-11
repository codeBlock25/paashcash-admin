'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  UsersRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

type WaitlistEntry = {
  id: string;
  email: string;
  createdAt: string;
};

type PaginationMeta = {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

type WaitlistResponse = {
  items: WaitlistEntry[];
  meta: PaginationMeta;
};

type ApiError = { message?: string | string[] };

const emptyMeta: PaginationMeta = {
  itemCount: 0,
  totalItems: 0,
  itemsPerPage: 20,
  totalPages: 0,
  currentPage: 1,
};

export function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      const response = await authenticatedFetch(`/api/waitlist?${params}`, {
        cache: 'no-store',
      });
      const result = (await response.json()) as WaitlistResponse | ApiError;

      if (!response.ok) {
        const message = (result as ApiError).message;
        throw new Error(
          Array.isArray(message)
            ? message.join(' ')
            : message || 'Unable to load the waiting list.',
        );
      }

      const waitlist = result as WaitlistResponse;
      setEntries(waitlist.items);
      setMeta(waitlist.meta);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to load the waiting list.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const totalPages = Math.max(1, meta.totalPages);

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-white px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5 flex items-center justify-between border-b border-[#ecebf0] pb-5">
          <div>
            <h2 className="text-[16px] font-medium text-[#29272e]">
              Waiting list entries
            </h2>
            <p className="mt-1 text-[12px] text-[#85828b]">
              {meta.totalItems.toLocaleString()}{' '}
              {meta.totalItems === 1 ? 'person' : 'people'} signed up
            </p>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <UsersRound className="size-4.5" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#ecebf0]">
          <div className="hidden grid-cols-[1fr_220px] gap-4 bg-[#f7f6f8] px-5 py-3 text-[12px] font-medium text-[#77757e] sm:grid">
            <span>Email address</span>
            <span>Date joined</span>
          </div>

          {loading ? <WaitlistLoading /> : null}

          {!loading && entries.length === 0 ? (
            <div className="grid min-h-64 place-items-center px-5 text-center">
              <div>
                <Mail className="mx-auto size-8 text-[#aaa7b2]" />
                <p className="mt-3 text-sm font-medium text-[#29272e]">
                  No one is on the waiting list yet.
                </p>
              </div>
            </div>
          ) : null}

          {!loading
            ? entries.map((entry) => (
                <div
                  key={entry.id}
                  className="grid gap-1 border-t border-[#efedf2] px-5 py-4 first:border-t-0 sm:grid-cols-[1fr_220px] sm:items-center sm:gap-4"
                >
                  <a
                    href={`mailto:${entry.email}`}
                    className="truncate text-[13px] font-medium text-[#29272e] hover:text-primary"
                  >
                    {entry.email}
                  </a>
                  <time
                    dateTime={entry.createdAt}
                    className="text-[12px] text-[#77757e]"
                  >
                    {formatDate(entry.createdAt)}
                  </time>
                </div>
              ))
            : null}
        </div>

        {!loading && meta.totalItems > 0 ? (
          <div className="mt-4 flex flex-col gap-4 text-[12px] text-[#77757e] sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2">
              Rows per page
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-9 rounded-lg border bg-white px-3 text-[#38353d] outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
            <div className="flex items-center gap-3">
              <span>
                Page {meta.currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <PageButton
                  label="First page"
                  disabled={meta.currentPage <= 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronsLeft />
                </PageButton>
                <PageButton
                  label="Previous page"
                  disabled={meta.currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft />
                </PageButton>
                <PageButton
                  label="Next page"
                  disabled={meta.currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                >
                  <ChevronRight />
                </PageButton>
                <PageButton
                  label="Last page"
                  disabled={meta.currentPage >= totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  <ChevronsRight />
                </PageButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function PageButton({
  children,
  label,
  ...props
}: React.ComponentProps<typeof Button> & {
  children: ReactNode;
  label: string;
}) {
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

function WaitlistLoading() {
  return (
    <div
      role="status"
      aria-label="Loading waiting list"
      className="divide-y divide-[#efedf2]"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_220px] sm:gap-4"
        >
          <div className="h-4 w-48 animate-pulse rounded bg-[#efedf2]" />
          <div className="h-4 w-32 animate-pulse rounded bg-[#efedf2]" />
        </div>
      ))}
    </div>
  );
}
