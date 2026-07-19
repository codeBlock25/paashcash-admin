import 'server-only';

import { cookies } from 'next/headers';

import { getBackendApiUrl } from '@/lib/backend-api';

type AdminAccount = {
  accountType: 'admin' | 'admin_case_manager';
  email: string;
  id: string;
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
      result.account?.accountType !== 'admin_case_manager'
    ) {
      return null;
    }

    return result.account;
  } catch {
    return null;
  }
}
