import { Flag, IdCard, Store, UsersRound } from 'lucide-react';
import {
  type AdminDashboard,
  type DashboardRange,
  formatChange,
  formatCount,
} from '@/components/dashboard/dashboard-types';
import { StatCard } from '@/components/dashboard/stat-card';
import { TimeRangeSelect } from '@/components/dashboard/time-range-select';

export function DashboardOverview({
  data,
  range,
  onRangeChange,
}: {
  data: AdminDashboard['overview'] | null;
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
}) {
  const stats = [
    {
      title: 'Total Registered Users',
      metric: data?.registeredUsers,
      icon: UsersRound,
    },
    { title: 'Visa Applicants', metric: data?.visaApplicants, icon: IdCard },
    { title: 'Agencies', metric: data?.agencies, icon: Store },
    {
      title: 'Case Managers',
      metric: data?.caseManagers,
      icon: Flag,
      iconClassName: 'text-red-500',
    },
  ];

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
          <TimeRangeSelect value={range} onValueChange={onRangeChange} />
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.metric ? formatCount(stat.metric.value) : '—'}
              change={formatChange(stat.metric?.changePercentage ?? null)}
              icon={stat.icon}
              iconClassName={stat.iconClassName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
