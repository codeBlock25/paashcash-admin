import type { AdminAccount } from '@/lib/admin-session';

export function getAdminRoleLabel(account: AdminAccount) {
  if (account.accountType === 'admin') return 'Super Admin';
  if (account.adminRoleLevel === 'case_manager') return 'Case Manager';
  return 'Admin Case Manager';
}
