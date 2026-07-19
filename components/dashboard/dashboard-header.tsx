'use client';

import {
  Bell,
  ChevronsUpDown,
  Crown,
  House,
  ImageIcon,
  Menu,
  Plus,
  UsersRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserAvatar } from '@/components/dashboard/user-avatar';
import { Button } from '@/components/ui/button';

export function DashboardHeader({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const pathname = usePathname();
  const bannersPage = pathname.startsWith('/dashboard/banners');
  const subscriptionsPage = pathname.startsWith('/dashboard/subscriptions');
  const waitlistPage = pathname.startsWith('/dashboard/waitlist');
  const HeaderIcon = waitlistPage
    ? UsersRound
    : subscriptionsPage
      ? Crown
      : bannersPage
        ? ImageIcon
        : House;
  const title = waitlistPage
    ? 'Waiting List'
    : subscriptionsPage
      ? 'Billing & Subscription'
      : bannersPage
        ? 'Banners'
        : 'Dashboard';
  const description = waitlistPage
    ? 'View people waiting to join Paash Cash'
    : subscriptionsPage
      ? 'View and manage user subscriptions'
      : bannersPage
        ? 'View and manage Banners'
        : 'View and manage users';

  return (
    <header className="flex h-[86px] shrink-0 items-center justify-between border-b bg-white px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3.5">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={sidebarOpen}
          onClick={onToggleSidebar}
          className="rounded-full lg:hidden"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
        <div className="hidden size-12 place-items-center rounded-full border sm:grid">
          <HeaderIcon className="size-5 text-[#36353a]" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-medium leading-5 tracking-[-0.02em] text-[#242328]">
            {title}
          </h1>
          <p className="truncate text-[13px] leading-4 text-[#797880]">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {bannersPage && pathname === '/dashboard/banners' ? (
          <Button
            render={<Link href="/dashboard/banners/new" />}
            nativeButton={false}
            className="h-9 px-3 sm:px-4"
          >
            <span className="hidden sm:inline">Add Banner</span>
            <Plus className="size-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="Notifications"
          className="rounded-full bg-[#f6f6f7] text-[#343339] hover:bg-[#eeeeef]"
        >
          <Bell className="size-[18px]" />
        </Button>
        <UserAvatar />
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-[13px] font-medium leading-5 text-[#27262b]">
            Joshua Adenuga
          </p>
          <p className="truncate text-[11px] leading-4 text-[#84838a]">
            joshuaadenuga@gmail.com
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Open profile menu"
          className="hidden rounded-lg text-[#77777f] shadow-none sm:inline-flex"
        >
          <ChevronsUpDown className="size-3.5" />
        </Button>
      </div>
    </header>
  );
}
