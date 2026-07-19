import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { RevenueAnalytics } from '@/components/dashboard/revenue-analytics';
import { ServicesOverview } from '@/components/dashboard/services-overview';
import { SubscriptionPlans } from '@/components/dashboard/subscription-plans';

export function DashboardContent() {
  return (
    <div className="bg-white pb-16">
      <DashboardOverview />
      <RevenueAnalytics />
      <ServicesOverview />
      <SubscriptionPlans />
    </div>
  );
}
