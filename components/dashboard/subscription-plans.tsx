import {
  type AdminDashboard,
  formatCount,
} from '@/components/dashboard/dashboard-types';
import { Card } from '@/components/ui/card';

export function SubscriptionPlans({
  data,
}: {
  data?: AdminDashboard['subscriptions'] | null;
}) {
  const planData = data === undefined ? { free: 8400, premium: 2600 } : data;
  const free = planData?.free ?? 0;
  const premium = planData?.premium ?? 0;
  const total = free + premium;
  const freeColumns = total > 0 ? free : 1;
  const premiumColumns = total > 0 ? premium : 1;
  const freePercent = total > 0 ? Math.round((free / total) * 100) : 0;
  const premiumPercent = total > 0 ? 100 - freePercent : 0;

  return (
    <section className="px-4 py-7 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="text-[19px] font-medium tracking-[-0.025em] text-[#29282d]">
          Subscription Plans
        </h2>
        <p className="mt-1 text-[13px] text-[#77767e]">
          User distribution across subscription tiers
        </p>
        <Card className="mt-5 p-5 shadow-none">
          <div
            className="grid h-10 gap-0.5 overflow-hidden rounded-sm"
            style={{
              gridTemplateColumns: `${freeColumns}fr ${premiumColumns}fr`,
            }}
            role="img"
            aria-label={`Free plan ${freePercent} percent, premium plan ${premiumPercent} percent`}
          >
            <div className="bg-[#6f89ef]" />
            <div className="bg-[#fac29c]" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className="mb-2 h-1 w-10 rounded-full bg-[#6f89ef]" />
              <p className="text-[13px] text-[#77767e]">Free Plan</p>
              <p className="text-[22px] font-medium leading-7 text-[#29282d]">
                {planData ? formatCount(free) : '—'}
              </p>
            </div>
            <div>
              <div className="mb-2 h-1 w-10 rounded-full bg-[#fac29c]" />
              <p className="text-[13px] text-[#77767e]">Premium Plan</p>
              <p className="text-[22px] font-medium leading-7 text-[#29282d]">
                {planData ? formatCount(premium) : '—'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
