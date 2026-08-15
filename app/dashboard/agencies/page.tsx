import { redirect } from 'next/navigation';
import { AgenciesPage } from '@/components/agencies/agencies-page';
import { getAdminSession } from '@/lib/admin-session';

export default async function AgenciesRoute() {
  const account = await getAdminSession();
  if (account?.accountType !== 'admin') redirect('/dashboard');
  return <AgenciesPage />;
}
