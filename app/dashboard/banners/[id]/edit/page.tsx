import { BannerForm } from '@/components/banners/banner-form';

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BannerForm bannerId={id} />;
}
