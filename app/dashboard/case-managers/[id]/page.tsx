import { CaseManagerProfile } from '@/components/case-management/case-manager-profile';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <CaseManagerProfile id={(await params).id} />; }
