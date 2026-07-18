import { AuthFlow } from '@/components/auth-flow';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthFlow
      step="reset-password"
      initialEmail={typeof email === 'string' ? email : ''}
    />
  );
}
