'use client';

import { ArrowLeft, LoaderCircle, Save, Send } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  type ApiError,
  apiErrorMessage,
} from '@/components/agencies/agency.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

type AgencyTerms = {
  id?: string;
  content: string;
  version?: string | number;
  status?: string;
  effectiveAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { fullName?: string; email?: string } | string | null;
  updatedBy?: { fullName?: string; email?: string } | string | null;
  publishedBy?: { fullName?: string; email?: string } | string | null;
  createdByAccountId?: string;
  updatedByAccountId?: string;
  publishedByAccountId?: string | null;
};

function normalizeTerms(value: unknown): AgencyTerms {
  const result = value as { current?: AgencyTerms; terms?: AgencyTerms };
  return result.current ?? result.terms ?? (value as AgencyTerms);
}

function normalizeTermsList(value: unknown): AgencyTerms[] {
  if (Array.isArray(value)) return value as AgencyTerms[];
  const result = value as { items?: AgencyTerms[]; terms?: AgencyTerms[] };
  return result.items ?? result.terms ?? [];
}

export function AgencyTermsPage() {
  const [current, setCurrent] = useState<AgencyTerms | null>(null);
  const [versions, setVersions] = useState<AgencyTerms[]>([]);
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('1');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);

  const loadTerms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(
        '/api/auth/admin/agency-terms',
        { cache: 'no-store' },
      );
      const result = (await response.json()) as unknown;
      if (!response.ok)
        throw new Error(
          apiErrorMessage(result as ApiError, 'Unable to load agency terms.'),
        );
      const allTerms = normalizeTermsList(result);
      const draft = allTerms.find((term) => !term.publishedAt) ?? null;
      const now = Date.now();
      const published =
        allTerms.find((term) => {
          const effectiveAt = term.effectiveAt
            ? new Date(term.effectiveAt).getTime()
            : Number.NaN;
          return Boolean(term.publishedAt) && effectiveAt <= now;
        }) ?? null;
      const editable = draft ?? published;
      setVersions(allTerms);
      setCurrent(published);
      setContent(editable?.content ?? '');
      setVersion(
        draft?.version
          ? String(draft.version)
          : published?.version
            ? String(Number(published.version) + 1)
            : '1',
      );
      setEffectiveDate(toDateInput(editable?.effectiveAt));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load agency terms.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void loadTerms(), [loadTerms]);

  async function submit(action: 'draft' | 'publish') {
    if (!content.trim()) {
      toast.error('Terms content cannot be empty.');
      return;
    }
    if (!effectiveDate) {
      toast.error('Choose an effective date before saving.');
      return;
    }
    setSaving(action);
    try {
      const draftResponse = await authenticatedFetch(
        '/api/auth/admin/agency-terms/draft',
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            content: content.trim(),
            effectiveAt: new Date(
              `${effectiveDate}T00:00:00.000Z`,
            ).toISOString(),
          }),
        },
      );
      const draftResult = (await draftResponse.json()) as
        | AgencyTerms
        | ApiError;
      if (!draftResponse.ok)
        throw new Error(
          apiErrorMessage(
            draftResult as ApiError,
            'Unable to save agency terms.',
          ),
        );
      const draft = normalizeTerms(draftResult);
      setVersion(String(draft.version ?? version));
      if (action === 'draft') {
        toast.success('Draft saved.');
        return;
      }
      if (!draft.id) throw new Error('The saved draft did not include an ID.');
      const response = await authenticatedFetch(
        `/api/auth/admin/agency-terms/${encodeURIComponent(draft.id)}/publish`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({}),
        },
      );
      const result = (await response.json()) as unknown;
      if (!response.ok)
        throw new Error(
          apiErrorMessage(
            result as ApiError,
            'Unable to publish agency terms.',
          ),
        );
      toast.success('Agency terms published.');
      await loadTerms();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to update agency terms.',
      );
    } finally {
      setSaving(null);
    }
  }

  if (loading)
    return (
      <section
        role="status"
        aria-label="Loading agency terms"
        className="grid min-h-[calc(100dvh-86px)] place-items-center bg-[#faf9fb]"
      >
        <LoaderCircle className="size-6 animate-spin text-primary" />
      </section>
    );

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/dashboard/agencies"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6f6c75] hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Agency applications
        </Link>
        <div className="mt-5">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#242329]">
            Agency agreement terms
          </h2>
          <p className="mt-1 text-[13px] text-[#7e7b85]">
            Maintain the versioned escrow agreement shown during onboarding.
            Published versions remain part of the acceptance audit trail.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.45fr_0.8fr]">
          <div className="rounded-2xl border border-[#e8e6ec] bg-white p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label
                htmlFor="agency-terms-version"
                className="grid gap-2 text-[12px] font-medium text-[#514e57]"
              >
                Version
                <Input
                  id="agency-terms-version"
                  value={version}
                  disabled
                  placeholder="Assigned on save"
                />
              </label>
              <label
                htmlFor="agency-terms-effective-date"
                className="grid gap-2 text-[12px] font-medium text-[#514e57]"
              >
                Effective date
                <Input
                  id="agency-terms-effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(event) => setEffectiveDate(event.target.value)}
                />
              </label>
            </div>
            <label
              htmlFor="agency-terms-content"
              className="mt-5 grid gap-2 text-[12px] font-medium text-[#514e57]"
            >
              Terms content
              <textarea
                id="agency-terms-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={22}
                placeholder="Enter plain text or Markdown…"
                className="resize-y rounded-xl border bg-white px-4 py-3 font-mono text-[12px] leading-6 outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
              />
            </label>
            <p className="mt-2 text-[11px] text-[#8c8992]">
              Content is stored as plain text/Markdown and is never rendered as
              untrusted HTML.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="lg"
                disabled={saving !== null}
                onClick={() => void submit('draft')}
              >
                {saving === 'draft' ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Save />
                )}{' '}
                Save draft
              </Button>
              <Button
                size="lg"
                disabled={saving !== null}
                onClick={() => void submit('publish')}
              >
                {saving === 'publish' ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Send />
                )}{' '}
                Publish version
              </Button>
            </div>
          </div>

          <div className="grid content-start gap-5">
            <div className="rounded-2xl border border-[#e8e6ec] bg-white p-5">
              <h3 className="text-[14px] font-semibold text-[#302e34]">
                Current published version
              </h3>
              {current ? (
                <dl className="mt-4 grid gap-3 text-[12px]">
                  <TermMeta
                    label="Version"
                    value={current.version ? String(current.version) : '—'}
                  />
                  <TermMeta
                    label="Effective"
                    value={formatDate(current.effectiveAt)}
                  />
                  <TermMeta
                    label="Published"
                    value={formatDateTime(current.publishedAt)}
                  />
                  <TermMeta
                    label="Published by"
                    value={
                      actor(current.publishedBy) ||
                      current.publishedByAccountId ||
                      '—'
                    }
                  />
                </dl>
              ) : (
                <p className="mt-3 text-[12px] text-[#85828b]">
                  No terms have been published yet.
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-[#e8e6ec] bg-white p-5">
              <h3 className="text-[14px] font-semibold text-[#302e34]">
                Version history
              </h3>
              <div className="mt-3 divide-y divide-[#efedf2]">
                {versions.length ? (
                  versions.map((term, index) => (
                    <div
                      key={term.id ?? `${term.version}-${index}`}
                      className="py-3 text-[12px]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[#39363e]">
                          Version {term.version ?? '—'}
                        </p>
                        <span className="rounded-full bg-[#f2f0f5] px-2 py-1 capitalize text-[#6f6c75]">
                          {term.publishedAt ? 'published' : 'draft'}
                        </span>
                      </div>
                      <p className="mt-1 text-[#8c8992]">
                        Effective {formatDate(term.effectiveAt)} · Updated{' '}
                        {formatDateTime(term.updatedAt)}
                      </p>
                      <p className="mt-1 break-all text-[10px] text-[#aaa7b0]">
                        Updated by {term.updatedByAccountId ?? 'unavailable'}
                        {term.publishedAt
                          ? ` · Published by ${term.publishedByAccountId ?? 'unavailable'}`
                          : ''}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="py-3 text-[12px] text-[#85828b]">
                    No agreement versions exist yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TermMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[#8c8992]">{label}</dt>
      <dd className="text-right font-medium text-[#39363e]">{value}</dd>
    </div>
  );
}
function actor(value?: AgencyTerms['publishedBy']): string {
  return typeof value === 'string'
    ? value
    : value?.fullName || value?.email || '';
}
function toDateInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}
function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(date);
}
function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}
