'use client';

import { Gift, LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

type GiftCardAvailability = {
  available: boolean;
  key: 'gift-cards';
  updatedAt: string | null;
  updatedById: string | null;
};

type ApiError = { message?: string | string[] };

export function GiftCardAvailabilityPage() {
  const [status, setStatus] = useState<GiftCardAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(
        '/api/feature-status/admin/gift-cards',
        { cache: 'no-store' },
      );
      const result = (await response.json()) as GiftCardAvailability | ApiError;
      if (!response.ok) throw new Error(apiMessage(result));
      setStatus(result as GiftCardAvailability);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to load gift-card availability.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setAvailable(available: boolean) {
    if (!status || saving) return;
    const previous = status;
    setStatus({ ...status, available });
    setSaving(true);
    try {
      const response = await authenticatedFetch(
        '/api/feature-status/admin/gift-cards',
        {
          body: JSON.stringify({ available }),
          headers: { 'content-type': 'application/json' },
          method: 'PATCH',
        },
      );
      const result = (await response.json()) as GiftCardAvailability | ApiError;
      if (!response.ok) throw new Error(apiMessage(result));
      setStatus(result as GiftCardAvailability);
      toast.success(
        available
          ? 'Gift-card foundation is now visible in the mobile app.'
          : 'Gift cards now show Coming Soon in the mobile app.',
      );
    } catch (error) {
      setStatus(previous);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to update gift-card availability.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-8">
      <Card>
        <div className="p-6 pb-3">
          <h2 className="flex items-center gap-3 text-lg font-semibold">
            <span className="grid size-10 place-items-center rounded-full bg-primary/10">
              <Gift className="size-5 text-primary" />
            </span>
            Gift-card availability
          </h2>
        </div>
        <div className="p-6 pt-3">
          {loading ? (
            <div className="flex min-h-28 items-center justify-center">
              <LoaderCircle className="size-6 animate-spin text-primary" />
            </div>
          ) : status ? (
            <div className="flex flex-col gap-5 rounded-xl border bg-[#fcfbfc] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <p className="font-medium text-[#2b2a2f]">
                  Show the Cardtonic-ready foundation
                </p>
                <p className="mt-1 text-sm leading-6 text-[#77777f]">
                  Off keeps the mobile Coming Soon screen. On reveals a safe
                  integration-ready screen; it does not enable trading or
                  collect gift-card orders until Cardtonic is connected.
                </p>
                {status.updatedAt ? (
                  <p className="mt-3 text-xs text-[#98979e]">
                    Last updated {new Date(status.updatedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {status.available ? 'Visible' : 'Coming Soon'}
                </span>
                <Switch
                  aria-label="Gift-card availability"
                  checked={status.available}
                  disabled={saving}
                  onCheckedChange={setAvailable}
                />
              </div>
            </div>
          ) : (
            <button
              className="text-sm font-medium text-primary"
              onClick={() => void load()}
              type="button"
            >
              Retry
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

function apiMessage(result: GiftCardAvailability | ApiError): string {
  if ('message' in result) {
    return Array.isArray(result.message)
      ? result.message.join(', ')
      : (result.message ?? 'Unable to update gift-card availability.');
  }
  return 'Unable to update gift-card availability.';
}
