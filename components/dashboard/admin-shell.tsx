'use client';

import { useState } from 'react';

import { AdminAccountProvider } from '@/components/dashboard/admin-account-context';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import type { AdminAccount } from '@/lib/admin-session';

export function AdminShell({
  account,
  children,
}: {
  account: AdminAccount;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAccountProvider account={account}>
      <div className="flex h-dvh overflow-hidden bg-white">
        <div className="fixed inset-y-0 left-0 z-40 hidden w-[268px] border-r bg-white lg:block">
          <DashboardSidebar />
        </div>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
        <div
          aria-hidden={!sidebarOpen}
          inert={!sidebarOpen}
          className={`fixed inset-y-0 left-0 z-50 w-[min(86vw,280px)] border-r bg-white shadow-2xl transition-transform duration-200 lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:ml-[268px]">
          <DashboardHeader
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
          />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminAccountProvider>
  );
}
