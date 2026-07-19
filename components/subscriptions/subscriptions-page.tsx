'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { SubscriptionPlans } from '@/components/dashboard/subscription-plans';
import {
  type PlanType,
  subscriptions,
} from '@/components/subscriptions/subscription-data';
import {
  AgencyMark,
  PlanBadge,
  VerifiedMark,
} from '@/components/subscriptions/subscription-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Filter = 'All plans' | PlanType;

export function SubscriptionsPage() {
  const [filter, setFilter] = useState<Filter>('All plans');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return subscriptions.filter((subscription) => {
      const matchesPlan =
        filter === 'All plans' || subscription.plan === filter;
      const matchesSearch =
        !search ||
        subscription.agency.toLowerCase().includes(search) ||
        subscription.email.toLowerCase().includes(search);
      return matchesPlan && matchesSearch;
    });
  }, [filter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function changeFilter(value: Filter) {
    setFilter(value);
    setPage(1);
  }

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-white pb-8">
      <SubscriptionPlans />
      <div className="mx-auto max-w-[1504px] px-4 sm:px-8">
        <div className="flex flex-col gap-4 border-t pt-5 md:flex-row md:items-center md:justify-between">
          <div className="grid w-full grid-cols-3 rounded-lg bg-[#f6f5f7] p-1 md:max-w-[480px]">
            {(['All plans', 'Free Plan', 'Premium Plan'] as Filter[]).map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => changeFilter(item)}
                  className={`h-8 rounded-md px-3 text-[12px] font-medium transition ${filter === item ? 'bg-white text-[#29272e] shadow-sm' : 'text-[#aaa7b0] hover:text-[#6e6b74]'}`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <div className="relative w-full md:max-w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a7a4ad]" />
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search for user..."
              className="h-9 pl-9 text-[12px]"
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-[#ecebf0]">
          <div className="hidden grid-cols-[1.3fr_1.1fr_0.55fr_0.7fr] gap-4 bg-[#f7f6f8] px-5 py-3 text-[12px] font-medium text-[#77757e] md:grid">
            <span>Agency</span>
            <span>E-mail</span>
            <span>No of Orders</span>
            <span>Plan type</span>
          </div>
          {rows.map((subscription) => (
            <Link
              key={subscription.id}
              href={`/dashboard/subscriptions/${subscription.id}`}
              className="grid gap-3 border-t border-[#efedf2] p-4 transition first:border-t-0 hover:bg-[#fbfaff] md:grid-cols-[1.3fr_1.1fr_0.55fr_0.7fr] md:items-center md:gap-4 md:px-5"
            >
              <span className="flex items-center gap-3">
                <AgencyMark />
                <span className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-[#29272e]">
                  <span className="truncate">{subscription.agency}</span>
                  {subscription.verified ? <VerifiedMark /> : null}
                </span>
              </span>
              <span className="truncate text-[12px] text-[#77757e]">
                {subscription.email}
              </span>
              <span className="text-[12px] text-[#56535c]">
                <span className="mr-2 text-[#aaa7b0] md:hidden">Orders</span>
                {subscription.orders}
              </span>
              <PlanBadge plan={subscription.plan} />
            </Link>
          ))}
          {rows.length === 0 ? (
            <div className="grid min-h-44 place-items-center px-5 text-center text-sm text-[#77757e]">
              No subscriptions match your search.
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-4 text-[12px] text-[#77757e] sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2">
            Rows per Page
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 rounded-lg border bg-white px-3 text-[#38353d] outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            >
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </label>
          <div className="flex items-center gap-3">
            <span>
              Page {currentPage} of {pageCount}
            </span>
            <div className="flex gap-1">
              <PageButton
                label="First page"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft />
              </PageButton>
              <PageButton
                label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft />
              </PageButton>
              <PageButton
                label="Next page"
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight />
              </PageButton>
              <PageButton
                label="Last page"
                disabled={currentPage === pageCount}
                onClick={() => setPage(pageCount)}
              >
                <ChevronsRight />
              </PageButton>
            </div>
          </div>
        </div>
      </div>
    </section>
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
