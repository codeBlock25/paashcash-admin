'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Release = {
  id: string;
  trancheNumber: number;
  verifiedCompletionPercent: number;
  amountKobo: string;
  releasedAt: string;
  approvedByAccountId: string;
  platformDebitTransactionId: string;
  agencyCreditTransactionId: string;
};

type Progress = {
  id: string;
  previousCompletionPercent: number;
  completionPercent: number;
  verifiedByAccountId: string;
  note: string;
  createdAt: string;
};

type Escrow = {
  id: string;
  bookingId: string;
  customerAccountId: string;
  agencyAccountId: string;
  amountKobo: string;
  currency: string;
  status: string;
  escrowPreference: string;
  maximumTranches: number;
  verifiedCompletionPercent: number;
  releasedAmountKobo: string;
  resolutionStatus: string;
  releases: Release[];
  progressHistory: Progress[];
  customerDebitTransactionId: string;
  platformCreditTransactionId: string;
  refundPlatformDebitTransactionId: string | null;
  refundCustomerCreditTransactionId: string | null;
};

const money = (minor: string, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(
    Number(minor) / 100,
  );

async function responseBody(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? 'Request failed.');
  return body;
}

export function VisaEscrowsPage() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [selected, setSelected] = useState<Escrow | null>(null);
  const [completion, setCompletion] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const values = (await responseBody(
      await fetch('/api/visa-escrows'),
    )) as Escrow[];
    setEscrows(values);
    setSelected((current) =>
      current
        ? (values.find((value) => value.id === current.id) ?? null)
        : null,
    );
  }, []);

  useEffect(() => {
    void load().catch((error) => toast.error(error.message));
  }, [load]);

  async function act(path: string, method: 'PATCH' | 'POST', body: object) {
    if (!selected) return;
    setBusy(true);
    try {
      await responseBody(
        await fetch(`/api/visa-escrows/${selected.id}/${path}`, {
          method,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );
      toast.success('Escrow updated.');
      setNote('');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Visa booking escrow</h1>
        <p className="text-sm text-muted-foreground">
          Verify case progress and approve internal Paash Cash wallet releases.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-3">
          {escrows.map((escrow) => (
            <button
              type="button"
              key={escrow.id}
              onClick={() => {
                setSelected(escrow);
                setCompletion(String(escrow.verifiedCompletionPercent));
              }}
              className="w-full rounded-xl border bg-card p-4 text-left hover:border-primary"
            >
              <div className="flex justify-between gap-3">
                <span className="font-medium">
                  Booking {escrow.bookingId.slice(0, 8)}
                </span>
                <span className="text-xs uppercase">
                  {escrow.status.replaceAll('_', ' ')}
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {money(escrow.amountKobo, escrow.currency)} ·{' '}
                {escrow.escrowPreference} · {escrow.verifiedCompletionPercent}%
                verified
              </div>
            </button>
          ))}
          {escrows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No funded visa escrows.
            </p>
          )}
        </div>
        {selected && (
          <section className="space-y-5 rounded-xl border bg-card p-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Funded</span>
                <p className="font-medium">{money(selected.amountKobo)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Released</span>
                <p className="font-medium">
                  {money(selected.releasedAmountKobo)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Schedule</span>
                <p>{selected.maximumTranches} tranche(s)</p>
              </div>
              <div>
                <span className="text-muted-foreground">Resolution</span>
                <p>{selected.resolutionStatus.replaceAll('_', ' ')}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="completion">
                Verified completion percentage
              </label>
              <input
                id="completion"
                type="number"
                min="0"
                max="100"
                value={completion}
                onChange={(event) => setCompletion(event.target.value)}
                className="h-9 w-full rounded-lg border px-3"
              />
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Required verification or cancellation note"
                className="min-h-20 w-full rounded-lg border p-3 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || note.trim().length < 3}
                  onClick={() =>
                    act('progress', 'PATCH', {
                      completionPercent: Number(completion),
                      note,
                    })
                  }
                >
                  Record verified progress
                </Button>
                <Button
                  disabled={busy}
                  variant="secondary"
                  onClick={() =>
                    act('releases', 'POST', {
                      idempotencyKey: crypto.randomUUID(),
                      note: note || null,
                    })
                  }
                >
                  Approve next release
                </Button>
                <Button
                  disabled={busy || note.trim().length < 3}
                  variant="destructive"
                  onClick={() =>
                    act('cancel', 'POST', {
                      idempotencyKey: crypto.randomUUID(),
                      reason: note,
                    })
                  }
                >
                  Cancel / refund
                </Button>
              </div>
            </div>
            <div>
              <h2 className="font-medium">Release and ledger history</h2>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                Funding ledger: customer debit{' '}
                {selected.customerDebitTransactionId} · platform credit{' '}
                {selected.platformCreditTransactionId}
              </p>
              {selected.refundPlatformDebitTransactionId && (
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  Refund ledger: platform debit{' '}
                  {selected.refundPlatformDebitTransactionId} · customer credit{' '}
                  {selected.refundCustomerCreditTransactionId}
                </p>
              )}
              <div className="mt-2 space-y-2 text-sm">
                {selected.releases.map((release) => (
                  <div key={release.id} className="rounded-lg bg-muted p-3">
                    Tranche {release.trancheNumber}: {money(release.amountKobo)}{' '}
                    at {release.verifiedCompletionPercent}% ·{' '}
                    {new Date(release.releasedAt).toLocaleString()}
                    <p className="break-all text-xs text-muted-foreground">
                      Platform debit {release.platformDebitTransactionId} ·
                      agency credit {release.agencyCreditTransactionId}
                    </p>
                  </div>
                ))}
                {selected.releases.length === 0 && (
                  <p className="text-muted-foreground">No funds released.</p>
                )}
              </div>
            </div>
            <div>
              <h2 className="font-medium">Verified completion history</h2>
              <div className="mt-2 space-y-2 text-sm">
                {selected.progressHistory.map((progress) => (
                  <div key={progress.id} className="rounded-lg bg-muted p-3">
                    {progress.previousCompletionPercent}% →{' '}
                    {progress.completionPercent}% · {progress.note}
                    <p className="text-xs text-muted-foreground">
                      {new Date(progress.createdAt).toLocaleString()} ·{' '}
                      {progress.verifiedByAccountId}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
