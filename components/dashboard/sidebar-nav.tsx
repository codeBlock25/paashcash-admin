'use client';

import {
  Bell,
  BriefcaseBusiness,
  Clock3,
  Crown,
  Gift,
  House,
  IdCard,
  MessageCircle,
  PanelsTopLeft,
  Send,
  Settings,
  ShieldCheck,
  Store,
  UsersRound,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import type { AdminAccount } from '@/lib/admin-session';

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof House;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const adminItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: House },
  { label: 'Visa Escrow', href: '/dashboard/visa-escrows', icon: IdCard },
  { label: 'Services', href: '/dashboard/services', icon: Zap },
];

const caseManagementItems: NavigationItem[] = [
  {
    label: 'Case Managers',
    href: '/dashboard/case-managers',
    icon: UsersRound,
  },
  {
    label: 'Case Inbox',
    href: '/dashboard/case-inbox',
    icon: BriefcaseBusiness,
  },
  { label: 'Assignments', href: '/dashboard/cases', icon: Send },
  { label: 'Escalations', href: '/dashboard/escalations', icon: Zap },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
  { label: 'Settings', href: '/dashboard/profile', icon: Settings },
];

function getNavigation(
  accountType: AdminAccount['accountType'],
): NavigationGroup[] {
  if (accountType === 'admin_case_manager') {
    return [
      {
        label: 'Admin',
        items: [
          ...adminItems,
          { label: 'Banners', href: '/dashboard/banners', icon: PanelsTopLeft },
          {
            label: 'Subscriptions',
            href: '/dashboard/subscriptions',
            icon: Crown,
          },
        ],
      },
      { label: 'Case Management', items: caseManagementItems },
    ];
  }

  if (accountType === 'case_manager') {
    return [
      {
        label: 'Visa Place',
        items: [
          { label: 'My Cases', href: '/dashboard', icon: House },
          {
            label: 'Messages',
            href: '/dashboard/case-inbox',
            icon: MessageCircle,
          },
          { label: 'Escalations', href: '/dashboard/escalations', icon: Zap },
          {
            label: 'Notifications',
            href: '/dashboard/notifications',
            icon: Bell,
          },
          { label: 'Settings', href: '/dashboard/profile', icon: Settings },
        ],
      },
    ];
  }

  return [
    {
      label: 'Admin',
      items: [
        ...adminItems,
        { label: 'Agencies', href: '/dashboard/agencies', icon: Store },
        {
          label: 'Gift Card Availability',
          href: '/dashboard/feature-status/gift-cards',
          icon: Gift,
        },
        { label: 'Admins', href: '/dashboard/admins', icon: ShieldCheck },
        { label: 'Banners', href: '/dashboard/banners', icon: PanelsTopLeft },
        {
          label: 'Subscriptions',
          href: '/dashboard/subscriptions',
          icon: Crown,
        },
        { label: 'Waiting List', href: '/dashboard/waitlist', icon: Clock3 },
        {
          label: 'Notifications',
          href: '/dashboard/notifications',
          icon: Bell,
        },
      ],
    },
  ];
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const account = useAdminAccount();
  const navigation = getNavigation(account.accountType);

  return (
    <nav aria-label="Admin navigation" className="mt-12 grid gap-8">
      {navigation.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-1 text-[12px] font-medium uppercase text-[#98979e]">
            {group.label}
          </p>
          <div className="grid gap-1.5">
            {group.items.map(({ label, href, icon: Icon }) => {
              const active =
                href === '/dashboard'
                  ? pathname === href
                  : href !== '#' && pathname.startsWith(href);

              return (
                <Link
                  key={label}
                  href={href}
                  onClick={href === '#' ? undefined : onNavigate}
                  aria-current={active ? 'page' : undefined}
                  aria-disabled={href === '#' ? true : undefined}
                  className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium transition-colors ${
                    active
                      ? 'bg-[#f3f3f4] text-[#2b2a2f] before:absolute before:-left-5 before:h-5 before:w-1 before:rounded-r-full before:bg-primary'
                      : 'text-[#77777f] hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`size-[18px] ${active ? 'fill-primary text-primary' : 'text-[#85858a]'}`}
                    strokeWidth={active ? 2.2 : 2}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
