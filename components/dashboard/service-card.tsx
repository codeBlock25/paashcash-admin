import type { LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';

export function ServiceCard({
  title,
  ordersLabel,
  orders,
  incomeLabel,
  income,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  ordersLabel: string;
  orders: string;
  incomeLabel: string;
  income: string;
  icon: LucideIcon;
  iconClassName: string;
}) {
  return (
    <Card className="p-5 shadow-none">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`grid size-8 place-items-center rounded-lg text-white ${iconClassName}`}
        >
          <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
        </span>
        <h3 className="text-[14px] font-medium text-[#29282d]">{title}</h3>
      </div>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[13px] leading-4">
        <dt className="min-w-0 text-[#77767e]">{ordersLabel}</dt>
        <dd className="text-right text-[16px] font-medium text-[#29282d]">
          {orders}
        </dd>
        <dt className="min-w-0 text-[#77767e]">{incomeLabel}</dt>
        <dd className="text-right text-[15px] font-medium text-[#29282d]">
          {income}
        </dd>
      </dl>
    </Card>
  );
}
