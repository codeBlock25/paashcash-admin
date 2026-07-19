import { SubscriptionDetailPage } from '@/components/subscriptions/subscription-detail-page';

export default async function SubscriptionDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubscriptionDetailPage id={id} />;
}
