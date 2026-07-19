import { redirect } from 'next/navigation';

import { getAdminSession } from '@/lib/admin-session';

export default async function Home() {
  redirect((await getAdminSession()) ? '/dashboard' : '/auth/login');
}
