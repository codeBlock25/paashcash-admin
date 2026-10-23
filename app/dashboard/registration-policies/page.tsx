import { redirect } from 'next/navigation';
import { RegistrationPoliciesPage } from '@/components/registration-policies/registration-policies-page';
import { getAdminSession } from '@/lib/admin-session';

export default async function RegistrationPoliciesRoute() {
  const account = await getAdminSession();
  if (account?.accountType !== 'admin') redirect('/dashboard');
  return <RegistrationPoliciesPage />;
}
