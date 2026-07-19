import type { ReactNode } from 'react';

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <section className="auth-card w-full max-w-99.5 rounded-[20px] border border-[#8f83ae] bg-white px-7 py-8 shadow-[0_7px_0_#251443,0_18px_48px_rgba(28,18,49,.08)] sm:px-9">
      {children}
    </section>
  );
}
