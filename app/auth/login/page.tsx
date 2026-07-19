import { redirect } from 'next/navigation';

import { LoginAuthPage } from '@/components/auth-flow';
import { getAdminSession } from '@/lib/admin-session';

export default async function LoginPage() {
  if (await getAdminSession()) redirect('/dashboard');

  return <LoginAuthPage />;
}
