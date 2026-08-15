import { redirect } from 'next/navigation';
import { GiftCardAvailabilityPage } from '@/components/feature-status/gift-card-availability-page';
import { getAdminSession } from '@/lib/admin-session';

export default async function GiftCardAvailabilityRoute() {
  const account = await getAdminSession();
  if (account?.accountType !== 'admin') {
    redirect('/dashboard');
  }
  return <GiftCardAvailabilityPage />;
}
