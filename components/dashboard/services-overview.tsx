import {
  BanknoteArrowDown,
  Gift,
  RadioTower,
  Smartphone,
  Trophy,
  Tv,
  Zap,
} from 'lucide-react';
import {
  type AdminDashboard,
  formatCount,
  formatNaira,
} from '@/components/dashboard/dashboard-types';
import { ServiceCard } from '@/components/dashboard/service-card';

const servicePresentation = [
  {
    serviceType: 'airtime' as const,
    title: 'Airtime',
    ordersLabel: 'Total Airtime Orders',
    incomeLabel: 'Airtime Income',
    icon: Smartphone,
    iconClassName: 'bg-[#3765f6]',
  },
  {
    serviceType: 'data' as const,
    title: 'Data',
    ordersLabel: 'Total Data Orders',
    incomeLabel: 'Data Income',
    icon: RadioTower,
    iconClassName: 'bg-[#d24d24]',
  },
  {
    serviceType: 'electricity' as const,
    title: 'Electricity',
    ordersLabel: 'Total Electricity Orders',
    incomeLabel: 'Electricity Income',
    icon: Zap,
    iconClassName: 'bg-[#9233b8]',
  },
  {
    serviceType: 'cable-tv' as const,
    title: 'Cable TV',
    ordersLabel: 'Total Cable TV Orders',
    incomeLabel: 'Cable TV Income',
    icon: Tv,
    iconClassName: 'bg-[#f3338b]',
  },
  {
    serviceType: 'gift-card' as const,
    title: 'Giftcards',
    ordersLabel: 'Total Giftcard Orders',
    incomeLabel: 'Giftcard Income',
    icon: Gift,
    iconClassName: 'bg-[#229447]',
  },
  {
    serviceType: 'betting' as const,
    title: 'Betting',
    ordersLabel: 'Total Betting Orders',
    incomeLabel: 'Betting Income',
    icon: Trophy,
    iconClassName: 'bg-[#17a2a4]',
  },
  {
    serviceType: 'airtime-to-cash' as const,
    title: 'Airtime to Cash',
    ordersLabel: 'Total Airtime2Cash Orders',
    incomeLabel: 'Airtime2Cash Income',
    icon: BanknoteArrowDown,
    iconClassName: 'bg-[#fa972e]',
  },
];

export function ServicesOverview({
  data,
}: {
  data: AdminDashboard['services'] | null;
}) {
  const totals = new Map(data?.map((item) => [item.serviceType, item]));

  return (
    <section className="border-b px-4 py-7 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="text-[19px] font-medium tracking-[-0.025em] text-[#29282d]">
          Services Overview by Type
        </h2>
        <p className="mt-1 text-[13px] text-[#77767e]">
          Overall services offered on the platform.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {servicePresentation.map((service) => {
            const total = totals.get(service.serviceType);
            return (
              <ServiceCard
                key={service.title}
                {...service}
                orders={total ? formatCount(total.orders) : '—'}
                income={total ? formatNaira(total.incomeKobo) : '—'}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
