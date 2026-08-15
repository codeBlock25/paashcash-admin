'use client';
import { Bell, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import { readApi } from './case-management.types';

type Item = {
  id: string;
  caseId: string | null;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};
export function CaseNotificationsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(
        (
          await readApi<{ items: Item[] }>(
            await authenticatedFetch('/api/case-management/notifications', {
              cache: 'no-store',
            }),
          )
        ).items,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to load notifications.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function mark(all: boolean, id?: string) {
    await readApi(
      await authenticatedFetch('/api/case-management/notifications/read', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(all ? { all: true } : { ids: [id] }),
      }),
    );
    await load();
  }
  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] p-4 sm:p-8">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Case notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Assignments, messages, escalations, and workflow updates.
            </p>
          </div>
          <Button variant="outline" onClick={() => void mark(true)}>
            Mark all read
          </Button>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
          {loading ? (
            <div className="grid place-items-center py-20">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className={`flex gap-4 border-b p-5 last:border-0 ${item.readAt ? '' : 'bg-[#faf7ff]'}`}
              >
                <Bell className="mt-1 size-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    {item.caseId ? (
                      <Link
                        className={buttonVariants({
                          variant: 'outline',
                          size: 'sm',
                        })}
                        href={`/dashboard/cases/${item.caseId}`}
                      >
                        Open case
                      </Link>
                    ) : null}
                    {!item.readAt ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void mark(false, item.id)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No case notifications.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
