import type { ReactNode } from 'react';

import { BrandMark } from './brand-mark';
import { PromoPanel } from './promo-panel';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-[#070e12] p-2.5 sm:p-4 lg:p-5">
      <div className="mx-auto grid min-h-[calc(100dvh-40px)] max-w-[1920px] grid-cols-1 gap-3 lg:grid-cols-[34.4%_1fr]">
        <PromoPanel />
        <section className="auth-surface relative flex min-h-[calc(100dvh-32px)] items-center justify-center overflow-hidden rounded-[18px] bg-[#fbfbfc] px-5 py-16 sm:px-10 lg:min-h-0">
          <div className="absolute left-6 top-6 z-10 lg:hidden">
            <BrandMark compact />
          </div>
          <div className="relative z-10 flex w-full justify-center">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
