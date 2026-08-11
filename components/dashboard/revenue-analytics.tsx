import {
  type AdminDashboard,
  formatChange,
  formatCount,
  formatNaira,
} from '@/components/dashboard/dashboard-types';
import { RevenueCard } from '@/components/dashboard/revenue-card';

export function RevenueAnalytics({
  data,
}: {
  data: AdminDashboard['revenue'] | null;
}) {
  const revenue = [
    {
      title: 'Total Amount Paid',
      value: data ? formatNaira(data.totalPaid.valueKobo) : '—',
      change: formatChange(data?.totalPaid.changePercentage ?? null),
    },
    {
      title: 'Total Held in Wallets',
      value: data ? formatNaira(data.heldInWallets.valueKobo) : '—',
      change: formatChange(data?.heldInWallets.changePercentage ?? null),
    },
    {
      title: 'Platform Revenue',
      value: data ? formatNaira(data.revenue.valueKobo) : '—',
      change: formatChange(data?.revenue.changePercentage ?? null),
    },
    {
      title: 'Paying Customers',
      value: data ? formatCount(data.payingCustomers.value) : '—',
      change: formatChange(data?.payingCustomers.changePercentage ?? null),
    },
  ];

  return (
    <section className="border-b px-4 py-7 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="text-[19px] font-medium tracking-[-0.025em] text-[#29282d]">
          Revenue Analytics
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {revenue.map((item) => (
            <RevenueCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
