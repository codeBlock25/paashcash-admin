'use client';

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  type AgencyApplication,
  type ApiError,
  apiErrorMessage,
  normalizeApplicationList,
} from '@/components/agencies/agency.types';
import { AgencyStatusBadge } from '@/components/agencies/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

const PAGE_SIZE = 20;

export function AgenciesPage() {
  const [allApplications, setAllApplications] = useState<AgencyApplication[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tab, setTab] = useState<'verified' | 'unverified'>('unverified');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(
        '/api/admin-dashboard/agency-applications',
        { cache: 'no-store' },
      );
      const result = (await response.json()) as unknown;
      if (!response.ok) {
        throw new Error(
          apiErrorMessage(result as ApiError, 'Unable to load applications.'),
        );
      }
      const normalized = normalizeApplicationList(result);
      setAllApplications(normalized.items);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load applications.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void loadApplications(), [loadApplications]);

  const filteredApplications = useMemo(() => {
    const byVerification = allApplications.filter((application) =>
      tab === 'verified'
        ? application.status.toLowerCase() === 'approved'
        : application.status.toLowerCase() !== 'approved',
    );
    if (!debouncedSearch) return byVerification;
    const query = debouncedSearch.toLowerCase();
    return byVerification.filter((application) =>
      [
        application.brandName,
        application.businessName,
        application.companyEmail,
        application.account?.email,
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [allApplications, debouncedSearch, tab]);
  const totalPages = Math.ceil(filteredApplications.length / PAGE_SIZE);
  const applications = filteredApplications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const meta = {
    currentPage: page,
    totalItems: filteredApplications.length,
    totalPages,
  };

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#242329]">
              Agency applications
            </h2>
            <p className="mt-1 text-[13px] text-[#7e7b85]">
              Review compliance documents and approve qualified agencies.
            </p>
          </div>
          <Link
            href="/dashboard/agencies/terms"
            className="text-[13px] font-medium text-primary hover:underline"
          >
            Manage agency terms
          </Link>
        </div>

        <div className="mt-6 flex gap-6 border-b border-[#e8e6ec]">
          {(['verified', 'unverified'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value);
                setPage(1);
              }}
              className={`relative pb-3 text-[13px] font-medium ${tab === value ? 'text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary' : 'text-[#77757e]'}`}
            >
              {value === 'verified'
                ? 'Verified Agencies'
                : 'Unverified Agencies'}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#e8e6ec] bg-white p-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-[360px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#aaa7b0]" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business or email…"
              aria-label="Search agency applications"
              className="h-10 pl-10"
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8e6ec] bg-white">
          <div className="hidden grid-cols-[1.4fr_1.3fr_100px_100px_120px_70px] gap-4 bg-[#f7f6f8] px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#77757e] md:grid">
            <span>Agency</span>
            <span>Email</span>
            <span>Orders</span>
            <span>Rating</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {loading ? <LoadingRows /> : null}
          {!loading && applications.length === 0 ? (
            <div className="grid min-h-64 place-items-center px-5 text-center">
              <div>
                <Building2 className="mx-auto size-8 text-[#aaa7b2]" />
                <p className="mt-3 text-sm font-medium text-[#29272e]">
                  No agency applications found.
                </p>
              </div>
            </div>
          ) : null}
          {!loading
            ? applications.map((application) => (
                <Link
                  key={application.id}
                  href={`/dashboard/agencies/${encodeURIComponent(application.id)}`}
                  className="grid gap-2 border-t border-[#efedf2] px-5 py-4 first:border-t-0 hover:bg-[#fbfaff] md:grid-cols-[1.4fr_1.3fr_100px_100px_120px_70px] md:items-center md:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#29272e]">
                      {application.brandName ||
                        application.businessName ||
                        'Unnamed agency'}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[#8c8992]">
                      {application.officeAddress ||
                        [application.city, application.country]
                          .filter(Boolean)
                          .join(', ') ||
                        'Address not provided'}
                    </p>
                  </div>
                  <span className="truncate text-[12px] text-[#5f5c65]">
                    {application.companyEmail ||
                      application.account?.email ||
                      '—'}
                  </span>
                  <Metric
                    value={application.orderCount ?? application.ordersCount}
                  />
                  <Metric
                    value={application.rating}
                    suffix={application.rating != null ? ' / 5' : undefined}
                  />
                  <div>
                    <AgencyStatusBadge status={application.status} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                    <Eye className="size-3.5" /> View
                  </span>
                </Link>
              ))
            : null}
        </div>

        {!loading && meta.totalItems > 0 ? (
          <div className="mt-4 flex items-center justify-between text-[12px] text-[#77757e]">
            <span>{meta.totalItems.toLocaleString()} applications</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft />
              </Button>
              <span>
                Page {meta.currentPage} of {Math.max(1, meta.totalPages)}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next page"
                disabled={page >= Math.max(1, meta.totalPages)}
                onClick={() => setPage((value) => value + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LoadingRows() {
  return (
    <div
      role="status"
      aria-label="Loading agency applications"
      className="divide-y divide-[#efedf2]"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 px-5 py-5">
          <span className="h-4 animate-pulse rounded bg-[#efedf2]" />
          <span className="h-4 animate-pulse rounded bg-[#efedf2]" />
          <span className="h-4 animate-pulse rounded bg-[#efedf2]" />
          <span className="h-4 animate-pulse rounded bg-[#efedf2]" />
        </div>
      ))}
    </div>
  );
}

function Metric({
  value,
  suffix = '',
}: {
  value?: number | null;
  suffix?: string;
}) {
  return (
    <span className="text-[12px] text-[#5f5c65]">
      {value == null ? (
        <span className="text-[#9a97a0]">Unavailable</span>
      ) : (
        `${value}${suffix}`
      )}
    </span>
  );
}
