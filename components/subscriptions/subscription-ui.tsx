import { BadgeCheck, Crown } from 'lucide-react';

import type { PlanType } from '@/components/subscriptions/subscription-data';
import { cn } from '@/lib/utils';

export function AgencyMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-md bg-[#315bea] text-white',
        className,
      )}
    >
      <span className="text-[11px] font-medium italic">Re</span>
    </span>
  );
}

export function VerifiedMark() {
  return (
    <BadgeCheck
      aria-label="Verified agency"
      className="size-4 fill-[#315bea] text-white"
    />
  );
}

export function PlanBadge({ plan }: { plan: PlanType }) {
  const premium = plan === 'Premium Plan';
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
        premium ? 'bg-[#f0eaff] text-[#8b5cf6]' : 'bg-[#f2f2f3] text-[#77757e]',
      )}
    >
      {plan}
      {premium ? <Crown className="size-3 fill-current" /> : null}
    </span>
  );
}
