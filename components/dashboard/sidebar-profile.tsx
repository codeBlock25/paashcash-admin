import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { UserAvatar } from '@/components/dashboard/user-avatar';
import { Button } from '@/components/ui/button';
import { getAdminRoleLabel } from '@/lib/admin-account';
import type { AdminAccount } from '@/lib/admin-session';

export function SidebarProfile({ account }: { account: AdminAccount }) {
  const role = getAdminRoleLabel(account);

  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar
        firstName={account.firstName}
        lastName={account.lastName}
        imageUrl={account.animoji?.imageUrl}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#2a292e]">
          {account.fullName}
        </p>
        <p className="truncate text-[11px] text-[#87868e]">{role}</p>
      </div>
      <Button
        render={<Link href="/dashboard/profile" />}
        nativeButton={false}
        variant="outline"
        size="icon-sm"
        aria-label="Open profile settings"
        className="rounded-lg text-[#77777f] shadow-none"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
