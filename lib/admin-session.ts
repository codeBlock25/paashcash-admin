import 'server-only';

import { cookies } from 'next/headers';

import { getBackendApiUrl } from '@/lib/backend-api';

export type AdminAccount = {
  accountType:
    | 'admin'
    | 'admin_case_manager'
    | 'case_manager'
    | 'admin_support'
    | 'support_user';
  adminRoleLevel:
    | 'admin_case_manager'
    | 'case_manager'
    | 'admin_support'
    | 'support_user'
    | null;
  animoji?: {
    imageUrl: string;
    name: string;
  } | null;
  email: string;
  firstName: string;
  fullName: string;
  id: string;
  lastName: string;
  phoneNumber: string | null;
  status: 'active' | 'inactive';
};

export async function getAdminSession(): Promise<AdminAccount | null> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  try {
    const response = await fetch(`${getBackendApiUrl()}/api/auth/profile`, {
      cache: 'no-store',
      headers: { cookie: cookieHeader },
    });
    if (!response.ok) return null;

    const result = (await response.json()) as { account?: AdminAccount };
    if (
      result.account?.accountType !== 'admin' &&
      result.account?.accountType !== 'admin_case_manager' &&
      result.account?.accountType !== 'case_manager' &&
      result.account?.accountType !== 'admin_support' &&
      result.account?.accountType !== 'support_user'
    ) {
      return null;
    }

    return result.account;
  } catch {
    return null;
  }
}
