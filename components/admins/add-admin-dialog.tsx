'use client';

import { LoaderCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import type {
  AdminAccountType,
  ApiError,
} from '@/components/admins/admin.types';
import { getApiErrorMessage } from '@/components/admins/admin.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

type AdminField = 'email' | 'fullName' | 'phoneNumber' | 'role';
type FieldErrors = Partial<Record<AdminField, string>>;

export function AddAdminDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<AdminAccountType>('case_manager');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');

  const close = (nextOpen: boolean) => {
    if (submitting) return;
    onOpenChange(nextOpen);
    if (!nextOpen) resetForm();
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setRole('case_manager');
    setFieldErrors({});
    setFormError('');
  };

  const clearFieldError = (field: AdminField) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError('');
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setFieldErrors({});
    setFormError('');
    setSubmitting(true);
    try {
      const response = await authenticatedFetch('/api/admins', {
        body: JSON.stringify({
          fullName,
          email,
          phoneNumber: phoneNumber || undefined,
          role,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      const result = (await response.json()) as ApiError;
      if (!response.ok) {
        const nextErrors = getFieldErrors(result);
        if (response.status === 409 && !nextErrors.email) {
          nextErrors.email = getApiErrorMessage(
            result,
            'An account with this email already exists.',
          );
        }
        setFieldErrors(nextErrors);
        setFormError(
          result.errors?.root ??
            (Object.keys(nextErrors).length === 0
              ? getApiErrorMessage(result, 'Unable to invite this admin.')
              : ''),
        );
        return;
      }

      toast.success(result.message ?? 'The admin invitation has been sent.');
      close(false);
      onCreated();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to invite this admin.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[760px] rounded-[26px] p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-semibold text-[#242329] sm:text-[28px]">
            Add Admin
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="mt-7">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-6">
            <FormField
              label="Full Name"
              htmlFor="admin-full-name"
              error={fieldErrors.fullName}
            >
              <Input
                id="admin-full-name"
                required
                minLength={3}
                maxLength={255}
                autoComplete="name"
                placeholder="John Doe"
                value={fullName}
                aria-invalid={Boolean(fieldErrors.fullName)}
                aria-describedby={
                  fieldErrors.fullName ? 'admin-full-name-error' : undefined
                }
                onChange={(event) => {
                  setFullName(event.target.value);
                  clearFieldError('fullName');
                }}
                className="h-12 text-[15px]"
              />
            </FormField>
            <FormField
              label="Email Address"
              htmlFor="admin-email"
              error={fieldErrors.email}
            >
              <Input
                id="admin-email"
                required
                type="email"
                autoComplete="email"
                placeholder="john@paashcash.com"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email ? 'admin-email-error' : undefined
                }
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError('email');
                }}
                className="h-12 text-[15px]"
              />
            </FormField>
            <FormField
              label="Phone Number"
              htmlFor="admin-phone"
              error={fieldErrors.phoneNumber}
            >
              <Input
                id="admin-phone"
                type="tel"
                autoComplete="tel"
                placeholder="080..."
                value={phoneNumber}
                aria-invalid={Boolean(fieldErrors.phoneNumber)}
                aria-describedby={
                  fieldErrors.phoneNumber ? 'admin-phone-error' : undefined
                }
                onChange={(event) => {
                  setPhoneNumber(event.target.value);
                  clearFieldError('phoneNumber');
                }}
                className="h-12 text-[15px]"
              />
            </FormField>
            <FormField
              label="Role"
              htmlFor="admin-role"
              error={fieldErrors.role}
            >
              <select
                id="admin-role"
                value={role}
                aria-invalid={Boolean(fieldErrors.role)}
                aria-describedby={
                  fieldErrors.role ? 'admin-role-error' : undefined
                }
                onChange={(event) => {
                  setRole(event.target.value as AdminAccountType);
                  clearFieldError('role');
                }}
                className="h-12 w-full rounded-lg border border-[#e7e7ea] bg-white px-3 text-[15px] text-[#292635] outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15"
              >
                <option value="admin">Admin</option>
                <option value="case_manager">Case Manager</option>
                <option value="admin_case_manager">Admin Case Manager</option>
              </select>
            </FormField>
          </div>

          {formError ? (
            <p
              role="alert"
              className="mt-4 text-[12px] leading-5 text-destructive"
            >
              {formError}
            </p>
          ) : null}

          <div className="mt-7 flex items-center justify-between rounded-xl bg-[#f8f6fd] px-4 py-3">
            <div>
              <p className="text-[14px] font-medium text-[#29272e]">
                Send invite email
              </p>
              <p className="text-[12px] text-[#817e89]">
                The password is created privately when the invite is accepted.
              </p>
            </div>
            <span
              aria-hidden="true"
              className="flex h-6 w-11 items-center justify-end rounded-full bg-primary p-0.5"
            >
              <span className="size-5 rounded-full bg-white shadow-sm" />
            </span>
          </div>

          <DialogFooter className="mt-7 border-t pt-5">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={submitting}
              onClick={() => close(false)}
              className="px-5 text-[#73717b]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={submitting || !fullName.trim() || !email.trim()}
              className="min-w-40 px-5"
            >
              {submitting ? <LoaderCircle className="animate-spin" /> : null}
              {submitting ? 'Sending invite…' : 'Add Admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  htmlFor,
  children,
  error,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-[14px] font-semibold">
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-[12px] leading-4 text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function getFieldErrors(result: ApiError): FieldErrors {
  const errors: FieldErrors = {};
  const knownFields: AdminField[] = [
    'fullName',
    'email',
    'phoneNumber',
    'role',
  ];

  for (const field of knownFields) {
    if (result.errors?.[field]) errors[field] = result.errors[field];
  }

  return errors;
}
