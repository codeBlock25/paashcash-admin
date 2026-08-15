import { CaseDetailPage } from '@/components/case-management/case-detail-page';
export default async function CaseRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseDetailPage caseId={id} />;
}
