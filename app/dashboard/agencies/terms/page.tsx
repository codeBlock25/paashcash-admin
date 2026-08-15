import { redirect } from 'next/navigation';
import { AgencyTermsPage } from '@/components/agencies/agency-terms-page';
import { getAdminSession } from '@/lib/admin-session';

export default async function AgencyTermsRoute() {
  const account = await getAdminSession();
  if (account?.accountType !== 'admin') redirect('/dashboard');
  return <AgencyTermsPage />;
}
