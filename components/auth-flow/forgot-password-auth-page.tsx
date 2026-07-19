'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { AuthCard } from './auth-card';
import { AuthField } from './auth-field';
import { AuthLayout } from './auth-layout';

export function ForgotPasswordAuthPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/request-reset-password', {
        body: JSON.stringify({ email, isAdmin: true }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to send the reset link.');
      }

      toast.success(
        result.message ?? 'A password reset has been sent to your email.',
      );
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to send the reset link.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-7 text-center">
          <h1 className="text-[21px] font-medium tracking-[-0.02em] text-[#252230]">
            Forgot Password?
          </h1>
          <p className="mx-auto mt-2 max-w-75 text-[12px] leading-[1.45] text-[#5e5968]">
            All good. Enter your account&apos;s email address and we&apos;ll
            send you a link to reset your password.
          </p>
        </div>
        <form onSubmit={submitForgotPassword} className="grid gap-5">
          <AuthField
            id="forgot-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Enter Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button
            type="submit"
            size="lg"
            disabled={!email || isSubmitting}
            className="h-11 w-full rounded-lg text-sm"
          >
            {isSubmitting ? 'Sending…' : 'Send reset link'}
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
