'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  type ApiError,
  apiErrorMessage,
} from '@/components/agencies/agency.types';
import { Button } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

type Content = {
  privacyPolicy: string;
  termsAndConditions: string;
  dataConsent: string;
};
type Policy = Content & {
  id: string;
  createdAt: string;
  publishedByAccountId: string;
};
const fields = [
  ['privacyPolicy', 'Privacy Policy'],
  ['termsAndConditions', 'Terms & Conditions'],
  ['dataConsent', 'Data Consent'],
] as const;
const empty: Content = {
  privacyPolicy: '',
  termsAndConditions: '',
  dataConsent: '',
};
const endpoint = '/api/auth/admin/registration-policies';

export function RegistrationPoliciesPage() {
  const [versions, setVersions] = useState<Policy[]>([]);
  const [content, setContent] = useState<Content>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(endpoint, {
        cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          apiErrorMessage(
            result as ApiError,
            'Unable to load registration policies.',
          ),
        );
      const policies = result as Policy[];
      setVersions(policies);
      setContent(policies[0] ?? empty);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to load registration policies.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  async function publish() {
    setSaving(true);
    try {
      const response = await authenticatedFetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(
            fields.map(([key]) => [key, content[key].trim()]),
          ),
          previousVersionId: versions[0]?.id ?? null,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          apiErrorMessage(
            result as ApiError,
            'Unable to publish registration policies.',
          ),
        );
      const policy = result as Policy;
      setVersions((previous) => [policy, ...previous].slice(0, 50));
      setContent(policy);
      toast.success(
        'Registration policies published. New users will see this version.',
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : 'Unable to publish registration policies.',
      );
    } finally {
      setSaving(false);
    }
  }

  const valid = fields.every(
    ([key]) =>
      content[key].trim().length >= 20 && content[key].trim().length <= 100000,
  );
  const changed = fields.some(
    ([key]) => content[key].trim() !== (versions[0]?.[key] ?? ''),
  );
  if (loading)
    return (
      <p role="status" className="p-6">
        Loading registration policies…
      </p>
    );
  if (error)
    return (
      <div className="space-y-4 p-6">
        <p role="alert">{error}</p>
        <Button onClick={() => void load()}>Retry</Button>
      </div>
    );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Registration Policies</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage the three documents users accept before registering in the
          mobile app. Publish all three together; changes take effect
          immediately.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {versions[0]
            ? `Last published: ${new Date(versions[0].createdAt).toLocaleString()}`
            : 'No policies published. Registration is unavailable until you publish the first version.'}
        </p>
      </div>
      <form
        className="space-y-6 rounded-xl border bg-card p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid && changed && !saving) void publish();
        }}
      >
        {fields.map(([key, label]) => (
          <div key={key} className="space-y-2">
            <label htmlFor={key} className="block text-sm font-medium">
              {label}
            </label>
            <textarea
              id={key}
              required
              minLength={20}
              maxLength={100000}
              rows={10}
              disabled={saving}
              value={content[key]}
              onChange={(event) =>
                setContent((previous) => ({
                  ...previous,
                  [key]: event.target.value,
                }))
              }
              className="w-full rounded-md border bg-background p-3 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Plain text or Markdown, 20–100,000 characters. Enter the complete
              approved document.
            </p>
          </div>
        ))}
        <p className="text-sm text-muted-foreground">
          Publishing creates an immutable version. Previous versions and users’
          acceptance records are retained. If another admin publishes while you
          edit, reload before publishing your changes.
        </p>
        <Button type="submit" disabled={!valid || !changed || saving}>
          {saving ? 'Publishing…' : 'Publish policies'}
        </Button>
      </form>
      <Button variant="outline" disabled={saving} onClick={() => void load()}>
        Reload published policies
      </Button>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Published history</h2>
        {versions.map((policy, index) => (
          <details key={policy.id} className="rounded-lg border p-4">
            <summary className="cursor-pointer text-sm">
              {index === 0 ? 'Current · ' : ''}
              {new Date(policy.createdAt).toLocaleString()} · {policy.id}
            </summary>
            <p className="mt-3 text-xs text-muted-foreground">
              Published by account {policy.publishedByAccountId}
            </p>
            {fields.map(([key, label]) => (
              <div key={key} className="mt-4">
                <h3 className="font-medium">{label}</h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                  {policy[key]}
                </p>
              </div>
            ))}
          </details>
        ))}
      </section>
    </div>
  );
}
