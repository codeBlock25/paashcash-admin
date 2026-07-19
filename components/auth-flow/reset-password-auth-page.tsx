'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { AuthCard } from './auth-card';
import { AuthField } from './auth-field';
import { AuthLayout } from './auth-layout';

type ResetPasswordAuthPageProps = {
  initialEmail?: string;
  initialToken?: string;
};

export function ResetPasswordAuthPage({
  initialEmail = '',
  initialToken = '',
}: ResetPasswordAuthPageProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialToken || !initialEmail) {
      toast.error(
        'This reset link is incomplete. Request a new password reset link.',
        { id: 'invalid-reset-link' },
      );
    }
  }, [initialEmail, initialToken]);

  const submitNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !initialToken ||
      !initialEmail ||
      !newPassword ||
      newPassword !== repeatPassword ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        body: JSON.stringify({
          email: initialEmail,
          isAdmin: true,
          password: newPassword,
          token: initialToken,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to reset your password.');
      }

      toast.success(result.message ?? 'Your password has been reset.');
      router.push('/auth/login');
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to reset your password.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <h1 className="mb-7 text-center text-[21px] font-medium tracking-[-0.02em] text-[#252230]">
          Create Password
        </h1>
        <form onSubmit={submitNewPassword} className="grid gap-5">
          <AuthField
            id="reset-email"
            label="Email"
            type="email"
            value={initialEmail}
            readOnly
          />
          <AuthField
            id="new-password"
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <AuthField
            id="repeat-password"
            label="Repeat Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat new password"
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
          />
          <Button
            type="submit"
            size="lg"
            disabled={
              !initialToken ||
              !initialEmail ||
              !newPassword ||
              newPassword !== repeatPassword ||
              isSubmitting
            }
            className="mt-1 h-11 w-full rounded-lg text-sm"
          >
            {isSubmitting ? 'Resetting…' : 'Continue'}
          </Button>
        </form>
        <Link
          href="/auth/login"
          className="mx-auto mt-7 flex items-center gap-2 text-xs font-medium text-primary transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="size-4" />
          Return to Login
        </Link>
      </AuthCard>
    </AuthLayout>
  );
}
