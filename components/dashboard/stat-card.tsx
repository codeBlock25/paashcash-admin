import type { LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconClassName?: string;
}) {
  return (
    <Card className="flex min-h-32 flex-col justify-between gap-4 p-5 shadow-none">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[13px] text-[#74737b]">{title}</p>
        <Icon
          aria-hidden="true"
          className={`size-5 text-[#85848b] ${iconClassName ?? ''}`}
          strokeWidth={1.8}
        />
      </div>
      <div>
        <p className="text-[24px] font-medium leading-7 tracking-[-0.025em] text-[#29282d]">
          {value}
        </p>
        <p className="mt-1 text-[12px] text-[#77767e]">
          {change === '—' ? (
            'No prior-period comparison'
          ) : (
            <>
              <span className="font-medium text-[#159447]">{change}</span> from
              the previous period
            </>
          )}
        </p>
      </div>
    </Card>
  );
}
