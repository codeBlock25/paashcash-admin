'use client';

import { ArrowLeft, BadgeDollarSign, CreditCard, IdCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ComponentProps, type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AuthStep = 'login' | 'forgot-password' | 'reset-password';

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact ? 'flex items-center gap-3' : 'flex flex-col items-center gap-4'
      }
    >
      <div
        className={`${compact ? 'size-10 rounded-xl bg-[linear-gradient(145deg,#3b3355,#5f4d85)]' : 'size-[58px] rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,.22),rgba(149,103,254,.1))]'} grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_12px_30px_rgba(0,0,0,.22)]`}
      >
        <Image
          src="/images/brand-mark.svg"
          alt=""
          width={64}
          height={46}
          style={{ width: compact ? 23 : 32, height: 'auto' }}
        />
      </div>
      <span
        className={`${compact ? 'text-sm text-[#252230]' : 'text-lg text-white'} font-medium`}
      >
        Paash Cash
      </span>
    </div>
  );
}

function PromoPanel() {
  return (
    <aside className="auth-promo relative hidden min-h-0 overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_15%_22%,rgba(149,103,254,.19),transparent_38%),linear-gradient(145deg,#27233d_0%,#292740_62%,#282641_100%)] lg:block">
      <div className="absolute inset-x-0 top-[19%] z-10 mx-auto w-[72%] max-w-[470px]">
        <div className="relative mx-auto w-[72%] overflow-hidden rounded-[12px] border border-white/20 bg-white/5 shadow-[0_22px_55px_rgba(5,6,15,.35)]">
          <div className="relative aspect-[1.12/1]">
            <Image
              src="/images/auth-image.png"
              alt="Business owner speaking on the phone"
              fill
              priority
              sizes="32vw"
              className="object-cover object-[center_30%]"
            />
          </div>
        </div>

        <div className="absolute -left-[1%] top-[45%] flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,.18)]">
          <span className="grid size-6 place-items-center rounded-md bg-[#7560ff] text-white">
            <CreditCard className="size-3.5" />
          </span>
          <span className="whitespace-nowrap text-[10px] font-medium text-[#24212c] xl:text-xs">
            Airtime &amp; Bills
          </span>
        </div>

        <div className="absolute -right-[2%] top-[36%] flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,.18)]">
          <span className="grid size-6 place-items-center rounded-md bg-[#ede6ff] text-[#8055ef]">
            <BadgeDollarSign className="size-3.5" />
          </span>
          <span className="whitespace-nowrap text-[10px] font-medium text-[#24212c] xl:text-xs">
            Gift cards
          </span>
        </div>

        <div className="absolute -right-[3%] top-[70%] flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,.18)]">
          <span className="grid size-6 place-items-center rounded-md bg-[#fff0e8] text-[#f27b40]">
            <IdCard className="size-3.5" />
          </span>
          <span className="whitespace-nowrap text-[10px] font-medium text-[#24212c] xl:text-xs">
            Visa Applicants
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[7%] z-10 flex justify-center">
        <BrandMark />
      </div>
    </aside>
  );
}

function Field({
  id,
  label,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}

function AuthCard({
  step,
  initialEmail,
}: {
  step: AuthStep;
  initialEmail: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const submitLogin = (event: FormEvent<HTMLFormElement>) =>
    event.preventDefault();
  const submitForgotPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email) {
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    }
  };
  const submitNewPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword && newPassword === repeatPassword) {
      router.push('/auth/login');
    }
  };

  if (step === 'forgot-password') {
    return (
      <section className="auth-card w-full max-w-[398px] rounded-[20px] border border-[#8f83ae] bg-white px-7 py-8 shadow-[0_7px_0_#251443,0_18px_48px_rgba(28,18,49,.08)] sm:px-9">
        <div className="mb-7 text-center">
          <h1 className="text-[21px] font-medium tracking-[-0.02em] text-[#252230]">
            Forgot Password?
          </h1>
          <p className="mx-auto mt-2 max-w-[300px] text-[12px] leading-[1.45] text-[#5e5968]">
            All good. Enter your account&apos;s email address and we&apos;ll
            send you a link to reset your password.
          </p>
        </div>
        <form onSubmit={submitForgotPassword} className="grid gap-5">
          <Field
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
            className="h-11 w-full rounded-lg text-sm"
          >
            Send reset link
          </Button>
        </form>
        <Link
          href="/auth/login"
          className="mx-auto mt-7 flex items-center gap-2 text-xs font-medium text-primary transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="size-4" />
          Return to Login
        </Link>
      </section>
    );
  }

  if (step === 'reset-password') {
    return (
      <section className="auth-card w-full max-w-[398px] rounded-[20px] border border-[#8f83ae] bg-white px-7 py-8 shadow-[0_7px_0_#251443,0_18px_48px_rgba(28,18,49,.08)] sm:px-9">
        <h1 className="mb-7 text-center text-[21px] font-medium tracking-[-0.02em] text-[#252230]">
          Create Password
        </h1>
        <form onSubmit={submitNewPassword} className="grid gap-5">
          <Field
            id="reset-email"
            label="Email"
            type="email"
            value={email}
            readOnly
          />
          <Field
            id="new-password"
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <Field
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
            disabled={!newPassword || newPassword !== repeatPassword}
            className="mt-1 h-11 w-full rounded-lg text-sm"
          >
            Continue
          </Button>
        </form>
        <Link
          href="/auth/login"
          className="mx-auto mt-7 flex items-center gap-2 text-xs font-medium text-primary transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="size-4" />
          Return to Login
        </Link>
      </section>
    );
  }

  return (
    <section className="auth-card w-full max-w-[398px] rounded-[20px] border border-[#8f83ae] bg-white px-7 py-8 shadow-[0_7px_0_#251443,0_18px_48px_rgba(28,18,49,.08)] sm:px-9">
      <div className="mb-7">
        <h1 className="text-[21px] font-medium tracking-[-0.02em] text-[#252230]">
          Welcome back to Paash Cash
        </h1>
        <p className="mt-2 text-[12px] text-[#5e5968]">
          Please enter your details to login to your account
        </p>
      </div>
      <form onSubmit={submitLogin} className="grid gap-5">
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Field
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
          disabled={!email || !password}
          className="h-11 w-full rounded-lg text-sm disabled:bg-[#ededee] disabled:text-[#c4c2c8] disabled:opacity-100"
        >
          Log in
        </Button>
      </form>
    </section>
  );
}

export function AuthFlow({
  step,
  initialEmail = '',
}: {
  step: AuthStep;
  initialEmail?: string;
}) {
  return (
    <main className="min-h-dvh bg-[#070e12] p-2.5 sm:p-4 lg:p-5">
      <div className="mx-auto grid min-h-[calc(100dvh-40px)] max-w-[1920px] grid-cols-1 gap-3 lg:grid-cols-[34.4%_1fr]">
        <PromoPanel />
        <section className="auth-surface relative flex min-h-[calc(100dvh-32px)] items-center justify-center overflow-hidden rounded-[18px] bg-[#fbfbfc] px-5 py-16 sm:px-10 lg:min-h-0">
          <div className="absolute left-6 top-6 z-10 lg:hidden">
            <BrandMark compact />
          </div>
          <div className="relative z-10 flex w-full justify-center">
            <AuthCard step={step} initialEmail={initialEmail} />
          </div>
        </section>
      </div>
    </main>
  );
}
