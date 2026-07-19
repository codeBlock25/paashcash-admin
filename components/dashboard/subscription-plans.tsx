import { Card } from '@/components/ui/card';

export function SubscriptionPlans() {
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
            className="grid h-10 grid-cols-[7fr_2.8fr] gap-0.5 overflow-hidden rounded-sm"
            role="img"
            aria-label="Free plan 76 percent, premium plan 24 percent"
          >
            <div className="bg-[#6f89ef]" />
            <div className="bg-[#fac29c]" />
          </div>
          <div className="mt-4 grid grid-cols-[7fr_2.8fr] gap-3">
            <div>
              <div className="mb-2 h-1 w-10 rounded-full bg-[#6f89ef]" />
              <p className="text-[13px] text-[#77767e]">Free Plan</p>
              <p className="text-[22px] font-medium leading-7 text-[#29282d]">
                8,400
              </p>
            </div>
            <div>
              <div className="mb-2 h-1 w-10 rounded-full bg-[#fac29c]" />
              <p className="text-[13px] text-[#77767e]">Premium Plan</p>
              <p className="text-[22px] font-medium leading-7 text-[#29282d]">
                2,600
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
