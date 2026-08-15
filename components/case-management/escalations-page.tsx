'use client';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { Button, buttonVariants } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import type { CaseEscalation } from './case-management.types';
import { readApi } from './case-management.types';
import { Badge, label } from './cases-page';

export function EscalationsPage() {
  const actor = useAdminAccount();
  const [items, setItems] = useState<CaseEscalation[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(
        await readApi(
          await authenticatedFetch('/api/case-management/escalations', {
            cache: 'no-store',
          }),
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load escalations.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function resolve(item: CaseEscalation) {
    const internalAction = window.prompt(
      'Resolution or internal action taken:',
    );
    if (!internalAction || internalAction.trim().length < 3) return;
    try {
      await readApi(
        await authenticatedFetch(
          `/api/case-management/escalations/${item.id}`,
          {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ status: 'resolved', internalAction }),
          },
        ),
      );
      toast.success('Escalation resolved.');
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to resolve.',
      );
    }
  }
  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] p-4 sm:p-8">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-xl font-semibold">Escalations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Case managers see escalations for their assigned cases. Administrators
          control closure.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
          {loading ? (
            <div className="grid place-items-center py-20">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 border-b p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="mt-1 size-5 text-amber-600" />
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <p className="font-medium">{label(item.reason)}</p>
                      <Badge>{label(item.priority)}</Badge>
                      <Badge>{label(item.status)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Case {item.caseId.slice(0, 8)} ·{' '}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    className={buttonVariants({
                      size: 'sm',
                      variant: 'outline',
                    })}
                    href={`/dashboard/cases/${item.caseId}`}
                  >
                    Open case
                  </Link>
                  {actor.accountType !== 'case_manager' &&
                  item.status !== 'resolved' ? (
                    <Button size="sm" onClick={() => void resolve(item)}>
                      Resolve
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No escalations.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
