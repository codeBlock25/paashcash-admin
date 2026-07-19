import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminShell } from '@/components/dashboard/admin-shell';
import { getAdminSession } from '@/lib/admin-session';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const account = await getAdminSession();
  if (!account) redirect('/auth/login');

  return <AdminShell>{children}</AdminShell>;
}
