import { CasesPage } from '@/components/case-management/cases-page';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { getAdminSession } from '@/lib/admin-session';

export default async function DashboardPage() {
  const account = await getAdminSession();
  return account?.accountType === 'case_manager' ? (
    <CasesPage />
  ) : (
    <DashboardContent />
  );
}
