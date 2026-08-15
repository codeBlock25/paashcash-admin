'use client';

import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  LoaderCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  type AgencyApplication,
  type AgencyDocumentKey,
  type ApiError,
  apiErrorMessage,
  unwrapApplication,
} from '@/components/agencies/agency.types';
import { AgencyStatusBadge } from '@/components/agencies/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

const documents: {
  key: AgencyDocumentKey;
  kind: string;
  label: string;
  optional?: boolean;
}[] = [
  {
    key: 'businessRegistrationCertificate',
    kind: 'business-registration-certificate',
    label: 'Business registration certificate',
  },
  {
    key: 'governmentLicense',
    kind: 'government-license',
    label: 'Government licence or accreditation',
  },
  {
    key: 'staffIdentityDocument',
    kind: 'staff-identity-document',
    label: 'Staff ID or business-owner passport',
  },
];

export function AgencyApplicationDetail({
  applicationId,
}: {
  applicationId: string;
}) {
  const [application, setApplication] = useState<AgencyApplication | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<'approve' | 'reject' | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const loadApplication = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/admin-dashboard/agency-applications/${encodeURIComponent(applicationId)}`,
        { cache: 'no-store' },
      );
      const result = (await response.json()) as unknown;
      if (!response.ok) {
        throw new Error(
          apiErrorMessage(
            result as ApiError,
            'Unable to load this application.',
          ),
        );
      }
      setApplication(unwrapApplication(result));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to load this application.',
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => void loadApplication(), [loadApplication]);

  async function review(action: 'approve' | 'reject') {
    if (action === 'reject' && reason.trim().length < 3) {
      toast.error('Enter a clear rejection reason.');
      return;
    }
    setActing(action);
    try {
      const response = await authenticatedFetch(
        `/api/admin-dashboard/agency-applications/${encodeURIComponent(applicationId)}/${action}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(
            action === 'reject' ? { reason: reason.trim() } : {},
          ),
        },
      );
      const result = (await response.json()) as unknown;
      if (!response.ok) {
        throw new Error(
          apiErrorMessage(
            result as ApiError,
            `Unable to ${action} this application.`,
          ),
        );
      }
      setApplication(unwrapApplication(result));
      setApproveOpen(false);
      setRejectOpen(false);
      setReason('');
      toast.success(
        action === 'approve'
          ? 'Agency application approved.'
          : 'Agency application rejected.',
      );
      await loadApplication();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Unable to ${action} this application.`,
      );
    } finally {
      setActing(null);
    }
  }

  if (loading) return <DetailLoading />;
  if (!application) {
    return (
      <section className="p-8">
        <Link
          href="/dashboard/agencies"
          className="text-sm text-primary hover:underline"
        >
          Back to agency applications
        </Link>
        <p className="mt-5 text-sm text-[#77757e]">
          The application could not be displayed.
        </p>
      </section>
    );
  }

  const normalizedStatus = application.status.toLowerCase();
  const selectedPlan = application.selectedPlan || application.plan || 'free';
  const acceptedTermsVersion =
    application.acceptedTermsVersion ?? application.termsVersion;

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/dashboard/agencies"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6f6c75] hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Agency applications
        </Link>
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#e8e6ec] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[22px] font-semibold tracking-[-0.025em] text-[#242329]">
                {application.brandName ||
                  application.businessName ||
                  'Unnamed agency'}
              </h2>
              <AgencyStatusBadge status={application.status} />
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold capitalize text-primary">
                {selectedPlan} plan
              </span>
            </div>
            <p className="mt-1 text-[13px] text-[#7e7b85]">
              Submitted{' '}
              {formatDateTime(application.submittedAt || application.createdAt)}
            </p>
          </div>
          {normalizedStatus === 'pending' ? (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setRejectOpen(true)}
              >
                <XCircle /> Reject
              </Button>
              <Button size="lg" onClick={() => setApproveOpen(true)}>
                <CheckCircle2 /> Approve
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-5">
            <InfoCard title="Business profile">
              <Info
                label="Legal business name"
                value={application.businessName}
              />
              <Info label="Brand name" value={application.brandName} />
              <Info
                label="Business email"
                value={application.companyEmail || application.account?.email}
              />
              <Info
                label="Phone number"
                value={
                  application.supportPhoneNumber ||
                  application.account?.phoneNumber
                }
              />
              <Info
                label="Office address"
                value={
                  application.officeAddress ||
                  [application.city, application.country]
                    .filter(Boolean)
                    .join(', ')
                }
              />
              <Info
                label="Company launch date"
                value={formatDate(application.companyLaunchDate)}
              />
              <Info
                label="Corporate website"
                value={
                  application.corporateWebsiteUrl ? (
                    <a
                      href={application.corporateWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open website{' '}
                      <ExternalLink className="ml-1 inline size-3" />
                    </a>
                  ) : (
                    'Not provided'
                  )
                }
              />
            </InfoCard>
            <InfoCard title="Compliance documents">
              <div className="col-span-full grid gap-2">
                {documents.map((document) => (
                  <DocumentButton
                    key={document.key}
                    applicationId={application.id}
                    kind={document.kind}
                    label={document.label}
                  />
                ))}
              </div>
            </InfoCard>
          </div>

          <div className="grid content-start gap-5">
            <InfoCard title="Application choices">
              <Info
                label="Visa categories"
                value={
                  application.preferences?.length
                    ? application.preferences.map(pretty).join(', ')
                    : undefined
                }
              />
              <Info
                label="Escrow preference"
                value={pretty(application.escrowPreference)}
              />
              <Info
                label="Selected plan"
                value={
                  <span className="capitalize">
                    {selectedPlan}{' '}
                    {selectedPlan.toLowerCase() === 'premium' ? (
                      <span className="ml-1 text-[11px] font-normal text-amber-700">
                        Billing unavailable — not active or paid
                      </span>
                    ) : null}
                  </span>
                }
              />
            </InfoCard>
            <InfoCard title="Agreement and review">
              <Info
                label="Accepted terms version"
                value={
                  acceptedTermsVersion
                    ? String(acceptedTermsVersion)
                    : undefined
                }
              />
              <Info
                label="Terms accepted"
                value={formatDateTime(application.termsAcceptedAt)}
              />
              <Info
                label="Reviewed"
                value={formatDateTime(application.reviewedAt)}
              />
              <Info
                label="Reviewed by"
                value={
                  typeof application.reviewedBy === 'string'
                    ? application.reviewedBy
                    : application.reviewedBy?.fullName ||
                      application.reviewedBy?.email
                }
              />
              {application.rejectionReason || application.reviewReason ? (
                <Info
                  label="Review reason"
                  value={
                    application.rejectionReason || application.reviewReason
                  }
                />
              ) : null}
            </InfoCard>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FinancialCard label="Total earnings" value={application.earnings} />
          <FinancialCard
            label="Escrow balance"
            value={application.escrowBalance}
          />
          <FinancialCard
            label="Wallet balance"
            value={application.walletBalance}
          />
          <FinancialCard
            label="Total withdrawals"
            value={application.withdrawalTotal}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-[#e8e6ec] bg-white p-5">
          <h3 className="text-[14px] font-semibold text-[#302e34]">
            Visa history
          </h3>
          {application.visaHistory?.length ? (
            <p className="mt-3 text-[12px] text-[#5f5c65]">
              {application.visaHistory.length.toLocaleString()} real visa{' '}
              {application.visaHistory.length === 1
                ? 'record is'
                : 'records are'}{' '}
              associated with this agency. Detailed history fields are not
              exposed by this API.
            </p>
          ) : (
            <div className="mt-3 rounded-xl bg-[#faf9fb] px-4 py-8 text-center text-[12px] text-[#85828b]">
              No visa history is available for this agency.
            </div>
          )}
        </div>
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve this agency?</DialogTitle>
            <DialogDescription>
              Approval grants the account agency access. This is the only review
              action that should change its account type.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setApproveOpen(false)}
              disabled={acting !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void review('approve')}
              disabled={acting !== null}
            >
              {acting === 'approve' ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <CheckCircle2 />
              )}{' '}
              Approve agency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this application</DialogTitle>
            <DialogDescription>
              The applicant will see this reason and can correct the application
              before resubmitting.
            </DialogDescription>
          </DialogHeader>
          <label className="mt-5 grid gap-2 text-[12px] font-medium text-[#514e57]">
            Reason
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Describe what needs to be corrected…"
              className="resize-y rounded-xl border bg-white px-3 py-2.5 text-[13px] font-normal outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            />
          </label>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={acting !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void review('reject')}
              disabled={acting !== null}
            >
              {acting === 'reject' ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <XCircle />
              )}{' '}
              Reject application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function InfoCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 rounded-2xl border border-[#e8e6ec] bg-white p-5 sm:grid-cols-2">
      <h3 className="col-span-full border-b border-[#efedf2] pb-3 text-[14px] font-semibold text-[#302e34]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode | null;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#97949d]">
        {label}
      </p>
      <div className="mt-1 break-words text-[13px] text-[#38353d]">
        {value || '—'}
      </div>
    </div>
  );
}

function FinancialCard({
  label,
  value,
}: {
  label: string;
  value?: number | null;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e6ec] bg-white p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#97949d]">
        {label}
      </p>
      {value == null ? (
        <p className="mt-2 text-[13px] text-[#8c8992]">Unavailable</p>
      ) : (
        <p className="mt-2 text-[18px] font-semibold text-[#302e34]">
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
          }).format(value)}
        </p>
      )}
    </div>
  );
}

function DocumentButton({
  applicationId,
  kind,
  label,
}: {
  applicationId: string;
  kind: string;
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function openDocument() {
    setLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/admin-dashboard/agency-applications/${encodeURIComponent(applicationId)}/documents/${kind}`,
        { cache: 'no-store' },
      );
      const result = (await response.json()) as {
        message?: string;
        url?: string;
      };
      if (!response.ok || !result.url) {
        throw new Error(result.message || 'Unable to open this document.');
      }
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to open this document.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void openDocument()}
      disabled={loading}
      className="flex items-center justify-between rounded-xl border border-[#eceaf0] p-3 text-left text-[13px] font-medium text-[#39363e] hover:border-primary/40 hover:bg-primary/[0.025] disabled:opacity-60"
    >
      <span className="flex items-center gap-2">
        <FileCheck2 className="size-4 text-primary" />
        {label}
      </span>
      {loading ? (
        <LoaderCircle className="size-3.5 animate-spin text-primary" />
      ) : (
        <ExternalLink className="size-3.5 text-[#96939c]" />
      )}
    </button>
  );
}

function DetailLoading() {
  return (
    <section
      role="status"
      aria-label="Loading agency application"
      className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] p-8"
    >
      <div className="mx-auto max-w-[1180px] animate-pulse space-y-5">
        <div className="h-5 w-40 rounded bg-[#e9e7ec]" />
        <div className="h-32 rounded-2xl bg-white" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-96 rounded-2xl bg-white" />
          <div className="h-72 rounded-2xl bg-white" />
        </div>
      </div>
    </section>
  );
}

function pretty(value?: string | null): string {
  return value ? value.toLowerCase().replaceAll('_', ' ') : '—';
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(date);
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
