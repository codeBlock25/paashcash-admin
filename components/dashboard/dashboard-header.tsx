'use client';

import {
  Bell,
  ChevronsUpDown,
  CircleUserRound,
  Crown,
  House,
  ImageIcon,
  Menu,
  Plus,
  ShieldCheck,
  UsersRound,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { UserAvatar } from '@/components/dashboard/user-avatar';
import { MarkAllReadButton } from '@/components/notifications/mark-all-read-button';
import { Button } from '@/components/ui/button';

export function DashboardHeader({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const account = useAdminAccount();
  const pathname = usePathname();
  const bannersPage = pathname.startsWith('/dashboard/banners');
  const subscriptionsPage = pathname.startsWith('/dashboard/subscriptions');
  const servicesPage = pathname.startsWith('/dashboard/services');
  const waitlistPage = pathname.startsWith('/dashboard/waitlist');
  const notificationsPage = pathname.startsWith('/dashboard/notifications');
  const profilePage = pathname.startsWith('/dashboard/profile');
  const adminsPage = pathname.startsWith('/dashboard/admins');
  const HeaderIcon = profilePage
    ? CircleUserRound
    : adminsPage
      ? ShieldCheck
      : notificationsPage
        ? Bell
        : waitlistPage
          ? UsersRound
          : servicesPage
            ? Zap
            : subscriptionsPage
              ? Crown
              : bannersPage
                ? ImageIcon
                : House;
  const title = profilePage
    ? 'Profile Settings'
    : adminsPage
      ? 'Admins'
      : notificationsPage
        ? 'Notifications'
        : waitlistPage
          ? 'Waiting List'
          : servicesPage
            ? 'Services'
            : subscriptionsPage
              ? 'Billing & Subscription'
              : bannersPage
                ? 'Banners'
                : 'Dashboard';
  const description = profilePage
    ? 'Manage your account and preferences'
    : adminsPage
      ? 'Manage administrator and case manager accounts'
      : notificationsPage
        ? 'System alerts and activity updates'
        : waitlistPage
          ? 'View people waiting to join Paash Cash'
          : servicesPage
            ? 'View and manage user services'
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
        {notificationsPage ? (
          <MarkAllReadButton
            label="Mark All Read"
            className="hidden sm:inline-flex"
          />
        ) : null}
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
          render={<Link href="/dashboard/notifications" />}
          nativeButton={false}
          variant="ghost"
          size="icon-lg"
          aria-label="Notifications"
          aria-current={notificationsPage ? 'page' : undefined}
          className={`rounded-full text-[#343339] hover:bg-[#eeeeef] ${
            notificationsPage ? 'bg-primary/10 text-primary' : 'bg-[#f6f6f7]'
          }`}
        >
          <Bell className="size-[18px]" />
        </Button>
        <Link
          href="/dashboard/profile"
          aria-label="Open profile settings"
          className="rounded-full outline-none ring-primary/20 transition hover:opacity-85 focus-visible:ring-3"
        >
          <UserAvatar
            firstName={account.firstName}
            lastName={account.lastName}
            imageUrl={account.animoji?.imageUrl}
          />
        </Link>
        <Link
          href="/dashboard/profile"
          className="hidden min-w-0 rounded-sm outline-none ring-primary/20 focus-visible:ring-3 md:block"
        >
          <p className="truncate text-[13px] font-medium leading-5 text-[#27262b]">
            {account.firstName} {account.lastName}
          </p>
          <p className="truncate text-[11px] leading-4 text-[#84838a]">
            {account.email}
          </p>
        </Link>
        <Button
          render={<Link href="/dashboard/profile" />}
          nativeButton={false}
          variant="outline"
          size="icon-sm"
          aria-label="Open profile settings"
          className="hidden rounded-lg text-[#77777f] shadow-none sm:inline-flex"
        >
          <ChevronsUpDown className="size-3.5" />
        </Button>
      </div>
    </header>
  );
}
