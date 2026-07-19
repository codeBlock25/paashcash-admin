'use client';

import { Crown, House, IdCard, PanelsTopLeft, Store, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { label: 'Dashboard', href: '/dashboard', icon: House },
  { label: 'Visa Applicants', href: '#', icon: IdCard },
  { label: 'Agencies', href: '#', icon: Store },
  { label: 'Services', href: '#', icon: Zap },
  { label: 'Banners', href: '/dashboard/banners', icon: PanelsTopLeft },
  { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: Crown },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="mt-3 grid gap-1.5">
      {navigation.map(({ label, href, icon: Icon }) => {
        const active =
          href === '/dashboard'
            ? pathname === href
            : href !== '#' && pathname.startsWith(href);

        return (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
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
    </nav>
  );
}
