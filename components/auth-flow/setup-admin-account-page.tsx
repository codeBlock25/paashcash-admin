'use client';

import { ArrowLeft, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AuthCard } from './auth-card';
import { AuthField } from './auth-field';
import { AuthLayout } from './auth-layout';

export function SetupAdminAccountPage({
  initialEmail = '',
  initialToken = '',
}: {
  initialEmail?: string;
  initialToken?: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialEmail || !initialToken) {
      toast.error('This invitation link is incomplete or invalid.', {
        id: 'invalid-admin-invitation',
      });
    }
  }, [initialEmail, initialToken]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !initialEmail ||
      !initialToken ||
      password.length < 8 ||
      password !== repeatPassword ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admins/accept-invitation', {
        body: JSON.stringify({
          email: initialEmail,
          token: initialToken,
          password,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      const result = (await response.json()) as {
        message?: string | string[];
      };
      if (!response.ok) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(' ')
            : result.message || 'Unable to set up your account.',
        );
      }

      toast.success(
        typeof result.message === 'string'
          ? result.message
          : 'Your admin account is ready.',
      );
      router.push('/auth/login');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to set up your account.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <h1 className="text-center text-[21px] font-medium tracking-[-0.02em] text-[#252230]">
          Set up your admin account
        </h1>
        <p className="mx-auto mb-7 mt-2 max-w-[330px] text-center text-[12px] leading-5 text-[#7b7782]">
          Create a private password to accept your Paash Cash invitation.
        </p>
        <form onSubmit={submit} className="grid gap-5">
          <AuthField
            id="invitation-email"
            label="Email"
            type="email"
            value={initialEmail}
            readOnly
          />
          <AuthField
            id="invitation-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <AuthField
            id="invitation-repeat-password"
            label="Repeat Password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Repeat your password"
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
          />
          <Button
            type="submit"
            size="lg"
            disabled={
              !initialEmail ||
              !initialToken ||
              password.length < 8 ||
              password !== repeatPassword ||
              submitting
            }
            className="mt-1 h-11 w-full rounded-lg text-sm"
          >
            {submitting ? <LoaderCircle className="animate-spin" /> : null}
            {submitting ? 'Setting up…' : 'Create account'}
          </Button>
        </form>
        <Link
          href="/auth/login"
          className="mx-auto mt-7 flex items-center gap-2 text-xs font-medium text-primary transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="size-4" /> Return to Login
        </Link>
      </AuthCard>
    </AuthLayout>
  );
}
