'use client';

import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { BrandLogo } from '@/components/dashboard/brand-logo';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { SidebarProfile } from '@/components/dashboard/sidebar-profile';

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const account = useAdminAccount();

  return (
    <aside className="flex h-full w-full flex-col bg-white px-5 pb-5 pt-5">
      <BrandLogo />
      <SidebarNav onNavigate={onNavigate} />
      <div className="mt-auto pt-8">
        <SidebarProfile account={account} />
      </div>
    </aside>
  );
}
