import { ChevronRight } from 'lucide-react';

import { UserAvatar } from '@/components/dashboard/user-avatar';
import { Button } from '@/components/ui/button';

export function SidebarProfile() {
  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#2a292e]">Admin</p>
        <p className="truncate text-[11px] text-[#87868e]">admin@company.com</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Open account menu"
        className="rounded-lg text-[#77777f] shadow-none"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
