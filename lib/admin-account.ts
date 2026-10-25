import type { AdminAccount } from '@/lib/admin-session';

export function getAdminRoleLabel(account: AdminAccount) {
  if (account.accountType === 'admin') return 'Super Admin';
  if (account.accountType === 'support_user') return 'Support Agent';
  if (account.accountType === 'admin_support') return 'Support Admin';
  if (account.adminRoleLevel === 'case_manager') return 'Case Manager';
  return 'Admin Case Manager';
}
