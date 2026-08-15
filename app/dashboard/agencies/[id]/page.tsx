import { redirect } from 'next/navigation';
import { AgencyApplicationDetail } from '@/components/agencies/agency-application-detail';
import { getAdminSession } from '@/lib/admin-session';

type AgencyApplicationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgencyApplicationRoute({
  params,
}: AgencyApplicationPageProps) {
  const account = await getAdminSession();
  if (account?.accountType !== 'admin') redirect('/dashboard');
  const { id } = await params;
  return <AgencyApplicationDetail applicationId={id} />;
}
