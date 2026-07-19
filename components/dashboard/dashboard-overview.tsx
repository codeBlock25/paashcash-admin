import { Flag, IdCard, Store, UsersRound } from 'lucide-react';

import { StatCard } from '@/components/dashboard/stat-card';
import { TimeRangeSelect } from '@/components/dashboard/time-range-select';

const stats = [
  {
    title: 'Total Registered Users',
    value: '2,847',
    change: '+12%',
    icon: UsersRound,
  },
  { title: 'Visa Applicants', value: '968', change: '+12%', icon: IdCard },
  { title: 'Agencies', value: '50', change: '+18%', icon: Store },
  {
    title: 'Case Managers',
    value: '33',
    change: '+5%',
    icon: Flag,
    iconClassName: 'text-red-500',
  },
];

export function DashboardOverview() {
  return (
    <section className="border-b px-4 py-7 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-[20px] font-medium tracking-[-0.025em] text-[#28272c]">
              Welcome Back Admin!
            </h2>
            <p className="mt-1 text-[13px] text-[#77767e]">
              Here&apos;s your platform overview and recent activity.
            </p>
          </div>
          <TimeRangeSelect />
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
