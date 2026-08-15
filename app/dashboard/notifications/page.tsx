import { CaseNotificationsPage } from '@/components/case-management/case-notifications-page';
import { NotificationsPage } from '@/components/notifications/notifications-page';
import { getAdminSession } from '@/lib/admin-session';

export default async function NotificationsRoute() {
  const account = await getAdminSession();
  return account?.accountType === 'admin' ? (
    <NotificationsPage />
  ) : (
    <CaseNotificationsPage />
  );
}
