import { ResetPasswordAuthPage } from '@/components/auth-flow';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string | string[];
    token?: string | string[];
  }>;
}) {
  const { email, token } = await searchParams;

  return (
    <ResetPasswordAuthPage
      initialEmail={typeof email === 'string' ? email : ''}
      initialToken={typeof token === 'string' ? token : ''}
    />
  );
}
