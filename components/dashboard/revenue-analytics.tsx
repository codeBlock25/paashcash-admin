import { RevenueCard } from '@/components/dashboard/revenue-card';

const revenue = [
  { title: 'Total amount Paid', value: '₦24M', change: '+12%' },
  { title: 'Total Amount in Escrow', value: '₦10M', change: '+12%' },
  { title: 'Total Revenue This Month', value: '₦190k', change: '+12%' },
  { title: 'Current Paying Subscribers', value: '1,847', change: '+18%' },
];

export function RevenueAnalytics() {
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
