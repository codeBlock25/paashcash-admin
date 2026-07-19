import { BrandLogo } from '@/components/dashboard/brand-logo';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { SidebarProfile } from '@/components/dashboard/sidebar-profile';

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-full flex-col bg-white px-5 pb-5 pt-5">
      <BrandLogo />
      <p className="mb-1 mt-12 px-1 text-[12px] font-medium uppercase text-[#98979e]">
        Admin
      </p>
      <SidebarNav onNavigate={onNavigate} />
      <div className="mt-auto pt-8">
        <SidebarProfile />
      </div>
    </aside>
  );
}
