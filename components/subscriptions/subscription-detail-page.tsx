'use client';

import {
  ArrowLeft,
  CheckCircle2,
  CircleCheck,
  Crown,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  getSubscription,
  type PlanType,
} from '@/components/subscriptions/subscription-data';
import {
  AgencyMark,
  PlanBadge,
  VerifiedMark,
} from '@/components/subscriptions/subscription-ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const history: { date: string; plan: PlanType }[] = [
  { date: '09 / 06 / 2025', plan: 'Premium Plan' },
  { date: '09 / 05 / 2025', plan: 'Free Plan' },
  { date: '09 / 04 / 2025', plan: 'Free Plan' },
  { date: '09 / 03 / 2025', plan: 'Premium Plan' },
];

export function SubscriptionDetailPage({ id }: { id: string }) {
  const subscription = getSubscription(id);
  const [currentPlan, setCurrentPlan] = useState<PlanType>(subscription.plan);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function cancelSubscription() {
    setCurrentPlan('Free Plan');
    setPassword('');
    setDialogOpen(false);
    toast.success('Subscription cancelled successfully.');
  }

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-white px-4 pb-10 sm:px-8">
      <div className="mx-auto max-w-[1504px]">
        <div className="flex h-16 items-center border-b">
          <Link
            href="/dashboard/subscriptions"
            className="inline-flex items-center gap-2 text-[12px] font-medium text-[#66636b] transition hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to Subscriptions
          </Link>
        </div>

        <section className="border-b py-6">
          <h2 className="text-[15px] font-medium text-[#29272e]">
            Current Subscription
          </h2>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <AgencyMark className="size-12" />
              <div>
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#29272e]">
                  {subscription.agency}{' '}
                  {subscription.verified ? <VerifiedMark /> : null}
                </p>
                <p className="mt-0.5 text-[11px] text-[#77757e]">
                  {subscription.email}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PlanBadge plan={currentPlan} />
              <span className="rounded-full bg-[#f2edff] px-2.5 py-1 text-[11px] font-medium text-[#8b5cf6]">
                Active
              </span>
              <span className="rounded-full bg-[#f4f3f5] px-3 py-1 text-[11px] text-[#706d75]">
                Next billing date June 1, 2025
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPlan === 'Free Plan'}
                onClick={() => setDialogOpen(true)}
                className="border-[#f0a096] bg-white text-[#e05243] shadow-none hover:bg-red-50 hover:text-[#cf4436]"
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b py-6">
          <h2 className="text-[15px] font-medium text-[#29272e]">Plans</h2>
          <div className="mt-4 grid max-w-[760px] gap-4 sm:grid-cols-2">
            <PlanCard
              type="Free Plan"
              price="₦0.00"
              active={currentPlan === 'Free Plan'}
              features={['3 visa ads per month', 'Access to Case Managers']}
            />
            <PlanCard
              type="Premium Plan"
              price="₦50,000"
              active={currentPlan === 'Premium Plan'}
              features={[
                'Unlimited monthly ads',
                'Ad priority on user pages',
                'Unlimited access to Case Managers',
              ]}
              premium
            />
          </div>
        </section>

        <section className="py-6">
          <h2 className="text-[15px] font-medium text-[#29272e]">
            Billing History
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#ecebf0]">
            <div className="hidden grid-cols-[1.2fr_0.8fr_0.65fr] gap-4 bg-[#f7f6f8] px-5 py-3 text-[12px] font-medium text-[#77757e] md:grid">
              <span>Agency</span>
              <span>Last Renewal Date</span>
              <span>Plan type</span>
            </div>
            {history.map((item, index) => (
              <div
                key={`${item.date}-${index}`}
                className="grid gap-3 border-t border-[#efedf2] p-4 first:border-t-0 md:grid-cols-[1.2fr_0.8fr_0.65fr] md:items-center md:gap-4 md:px-5"
              >
                <div className="flex items-center gap-3">
                  <AgencyMark />
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#29272e]">
                    {subscription.agency}{' '}
                    {subscription.verified ? <VerifiedMark /> : null}
                  </span>
                </div>
                <span className="text-[12px] text-[#66636b]">
                  <span className="mr-2 text-[#aaa7b0] md:hidden">Renewed</span>
                  {item.date}
                </span>
                <PlanBadge plan={item.plan} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[590px]">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Enter password to confirm subscription cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-7">
            <Label htmlFor="subscription-password">Password</Label>
            <div className="relative mt-2">
              <Input
                id="subscription-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1 grid size-8 place-items-center rounded-md text-[#8c8992] hover:bg-muted hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <DialogFooter className="mt-7 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDialogOpen(false)}
              className="mr-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!password.trim()}
              onClick={cancelSubscription}
              className="min-w-20"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function PlanCard({
  type,
  price,
  features,
  active,
  premium = false,
}: {
  type: PlanType;
  price: string;
  features: string[];
  active: boolean;
  premium?: boolean;
}) {
  return (
    <Card
      className={cn(
        'relative min-h-[205px] overflow-hidden p-5 shadow-none',
        premium ? 'border-[#9567fe] bg-[#9567fe] text-white' : 'bg-[#f7f7f8]',
      )}
    >
      {active ? (
        <span
          className={cn(
            'absolute right-0 top-0 inline-flex items-center gap-1 rounded-bl-lg px-3 py-1.5 text-[10px] font-medium',
            premium ? 'bg-[#17151b] text-white' : 'bg-[#e7e2f4] text-[#6943bd]',
          )}
        >
          <CheckCircle2 className="size-3" /> Active Plan
        </span>
      ) : null}
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium',
          premium
            ? 'border-white/45 bg-white/10'
            : 'border-[#dedce2] text-[#77757e]',
        )}
      >
        {type} <Crown className="size-3" />
      </span>
      <p className="mt-4 text-[25px] font-medium leading-none tracking-[-0.03em]">
        {price}{' '}
        <span
          className={cn(
            'text-[10px] font-normal tracking-normal',
            premium ? 'text-white/70' : 'text-[#88858e]',
          )}
        >
          NGN/ Month
        </span>
      </p>
      <ul className="mt-5 grid gap-2.5">
        {features.map((feature) => (
          <li
            key={feature}
            className={cn(
              'flex items-center gap-2 text-[12px]',
              premium ? 'text-white/90' : 'text-[#69666e]',
            )}
          >
            <CircleCheck className="size-4 shrink-0" /> {feature}
          </li>
        ))}
      </ul>
    </Card>
  );
}
