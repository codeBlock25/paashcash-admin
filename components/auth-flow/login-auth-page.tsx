'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { AuthCard } from './auth-card';
import { AuthField } from './auth-field';
import { AuthLayout } from './auth-layout';

export function LoginAuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        body: JSON.stringify({ email, isAdminLogin: true, password }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? 'Invalid email or password.');
      }

      toast.success('Welcome back. You are now logged in.');
      router.replace('/dashboard');
      router.refresh();
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to log in right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-7">
          <h1 className="text-[21px] font-medium tracking-[-0.02em] text-[#252230]">
            Welcome back to Paash Cash
          </h1>
          <p className="mt-2 text-[12px] text-[#5e5968]">
            Please enter your details to login to your account
          </p>
        </div>
        <form onSubmit={submitLogin} className="grid gap-5">
          <AuthField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Enter Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Link
            href="/auth/forgot-password"
            className="justify-self-center text-xs font-medium text-primary underline underline-offset-2 transition-opacity hover:opacity-70"
          >
            Forgot Password?
          </Link>
          <Button
            type="submit"
            size="lg"
            disabled={!email || !password || isSubmitting}
            className="h-11 w-full rounded-lg text-sm disabled:bg-[#ededee] disabled:text-[#c4c2c8] disabled:opacity-100"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
