import { redirect } from 'next/navigation';
import { CasesPage } from '@/components/case-management/cases-page';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { getAdminSession } from '@/lib/admin-session';

export default async function DashboardPage() {
  const account = await getAdminSession();
  if (
    account?.accountType === 'support_user' ||
    account?.accountType === 'admin_support'
  )
    redirect('/dashboard/support');
  return account?.accountType === 'case_manager' ? (
    <CasesPage />
  ) : (
    <DashboardContent />
  );
}
