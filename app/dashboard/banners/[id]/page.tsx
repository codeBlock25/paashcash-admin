import { BannerDetail } from '@/components/banners/banner-detail';

export default async function BannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BannerDetail bannerId={id} />;
}
