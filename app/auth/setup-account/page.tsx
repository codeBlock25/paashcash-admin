import { SetupAdminAccountPage } from '@/components/auth-flow';

export default async function SetupAdminAccountRoute({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string | string[];
    token?: string | string[];
  }>;
}) {
  const { email, token } = await searchParams;

  return (
    <SetupAdminAccountPage
      initialEmail={typeof email === 'string' ? email : ''}
      initialToken={typeof token === 'string' ? token : ''}
    />
  );
}
