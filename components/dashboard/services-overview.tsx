import {
  BanknoteArrowDown,
  Gift,
  RadioTower,
  Smartphone,
  Tv,
  Zap,
} from 'lucide-react';

import { ServiceCard } from '@/components/dashboard/service-card';

const services = [
  {
    title: 'Airtime',
    ordersLabel: 'Total Airtime Orders',
    orders: '968',
    incomeLabel: 'Airtime Income',
    income: '₦1,500,006',
    icon: Smartphone,
    iconClassName: 'bg-[#3765f6]',
  },
  {
    title: 'Data',
    ordersLabel: 'Total Data Orders',
    orders: '43',
    incomeLabel: 'Data Income',
    income: '₦400,000',
    icon: RadioTower,
    iconClassName: 'bg-[#d24d24]',
  },
  {
    title: 'Electricity',
    ordersLabel: 'Total Electricity Orders',
    orders: '170',
    incomeLabel: 'Electricity Income',
    income: '₦4,700,000',
    icon: Zap,
    iconClassName: 'bg-[#9233b8]',
  },
  {
    title: 'Cable TV',
    ordersLabel: 'Total Cable TV Orders',
    orders: '390',
    incomeLabel: 'Cable TV Income',
    income: '₦10,000,000',
    icon: Tv,
    iconClassName: 'bg-[#f3338b]',
  },
  {
    title: 'Giftcards',
    ordersLabel: 'Total Giftcard Orders',
    orders: '543',
    incomeLabel: 'Giftcard Income',
    income: '₦8,500,000',
    icon: Gift,
    iconClassName: 'bg-[#229447]',
  },
  {
    title: 'Airtime to Cash',
    ordersLabel: 'Total Airtime2Cash Orders',
    orders: '--',
    incomeLabel: 'Airtime2Cash Income',
    income: '--',
    icon: BanknoteArrowDown,
    iconClassName: 'bg-[#fa972e]',
  },
];

export function ServicesOverview() {
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
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
