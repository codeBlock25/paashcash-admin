'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import type {
  AdminDashboard,
  DashboardRange,
} from '@/components/dashboard/dashboard-types';
import { RevenueAnalytics } from '@/components/dashboard/revenue-analytics';
import { ServicesOverview } from '@/components/dashboard/services-overview';
import { SubscriptionPlans } from '@/components/dashboard/subscription-plans';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

export function DashboardContent() {
  const [range, setRange] = useState<DashboardRange>('all');
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string>();

  const loadDashboard = useCallback(async () => {
    setError(undefined);
    try {
      const response = await authenticatedFetch(
        `/api/admin-dashboard?range=${range}`,
        {
          cache: 'no-store',
        },
      );
      const result = (await response.json()) as AdminDashboard & {
        message?: string;
      };
      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to load dashboard data.');
      }
      setDashboard(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load dashboard data.',
      );
    }
  }, [range]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="bg-white pb-16">
      {error ? (
        <div
          role="alert"
          className="border-b bg-red-50 px-8 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}
      <DashboardOverview
        data={dashboard?.overview ?? null}
        range={range}
        onRangeChange={setRange}
      />
      <RevenueAnalytics data={dashboard?.revenue ?? null} />
      <ServicesOverview data={dashboard?.services ?? null} />
      <SubscriptionPlans data={dashboard?.subscriptions ?? null} />
    </div>
  );
}
