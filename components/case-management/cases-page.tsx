'use client';

import { BriefcaseBusiness, LoaderCircle, Search, Send } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import type { CaseManager, ManagedCase } from './case-management.types';
import { readApi } from './case-management.types';

export function CasesPage() {
  const actor = useAdminAccount();
  const canAssign = actor.accountType !== 'case_manager';
  const [items, setItems] = useState<ManagedCase[]>([]);
  const [managers, setManagers] = useState<CaseManager[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [assignment, setAssignment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<ManagedCase | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      if (canAssign) params.set('assignment', assignment);
      const result = await readApi<{ items: ManagedCase[] }>(
        await authenticatedFetch(`/api/case-management/cases?${params}`, {
          cache: 'no-store',
        }),
      );
      setItems(result.items);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load cases.',
      );
    } finally {
      setLoading(false);
    }
  }, [assignment, canAssign, search, status]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!canAssign) return;
    void authenticatedFetch('/api/case-management/managers', {
      cache: 'no-store',
    })
      .then(readApi<CaseManager[]>)
      .then(setManagers)
      .catch(() => undefined);
  }, [canAssign]);

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div>
          <h2 className="text-xl font-semibold text-[#242329]">
            {canAssign ? 'Case Assignments' : 'My Cases'}
          </h2>
          <p className="mt-1 text-sm text-[#7e7b85]">
            {canAssign
              ? 'Assign and monitor visa casework. Financial and escrow controls are not available here.'
              : 'Only visa cases currently assigned to you are shown.'}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border bg-white p-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search applicant, agency or case ID"
              className="pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border bg-white px-3 text-sm"
          >
            <option value="">All statuses</option>
            {[
              'pending',
              'in_review',
              'interview',
              'review',
              'approved',
              'rejected',
              'completed',
            ].map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
          {canAssign ? (
            <select
              value={assignment}
              onChange={(event) => setAssignment(event.target.value)}
              className="rounded-lg border bg-white px-3 text-sm"
            >
              <option value="all">All assignments</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          ) : null}
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border bg-white">
          {loading ? (
            <div className="grid place-items-center py-20">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#faf9fb] text-xs text-muted-foreground">
                  <tr>
                    <th className="p-4">CASE</th>
                    <th>APPLICANT / AGENCY</th>
                    <th>STATUS</th>
                    <th>PRIORITY</th>
                    <th>ASSIGNEE</th>
                    <th className="pr-4">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-4">
                        <p className="font-medium">
                          {item.visaType || 'Visa case'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.id.slice(0, 8)}
                        </p>
                      </td>
                      <td>
                        <p>{item.applicantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.agencyName}
                        </p>
                      </td>
                      <td>
                        <Badge>{label(item.status)}</Badge>
                      </td>
                      <td>
                        <Badge>{label(item.priority)}</Badge>
                      </td>
                      <td>
                        {item.assignment?.managerName ||
                          (item.assignment ? 'Assigned manager' : 'Unassigned')}
                      </td>
                      <td className="pr-4">
                        <div className="flex gap-2">
                          <Link
                            className={buttonVariants({
                              size: 'sm',
                              variant: 'outline',
                            })}
                            href={`/dashboard/cases/${item.id}`}
                          >
                            Open
                          </Link>
                          {canAssign ? (
                            <Button
                              size="sm"
                              onClick={() => setAssigning(item)}
                            >
                              <Send className="size-3.5" />
                              {item.assignment ? 'Reassign' : 'Assign'}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <BriefcaseBusiness className="mx-auto text-muted-foreground" />
              <p className="mt-3 font-medium">No cases found</p>
            </div>
          )}
        </div>
      </div>
      {assigning ? (
        <AssignDialog
          item={assigning}
          managers={managers}
          onClose={() => setAssigning(null)}
          onAssigned={() => {
            setAssigning(null);
            void load();
          }}
        />
      ) : null}
    </section>
  );
}

function AssignDialog({
  item,
  managers,
  onClose,
  onAssigned,
}: {
  item: ManagedCase;
  managers: CaseManager[];
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [managerAccountId, setManagerAccountId] = useState(
    item.assignment?.managerAccountId || '',
  );
  const [reason, setReason] = useState(
    item.assignment ? 'Workload reassignment' : 'Initial case assignment',
  );
  const [priority, setPriority] = useState(item.priority);
  const [pending, setPending] = useState(false);
  async function submit() {
    setPending(true);
    try {
      await readApi(
        await authenticatedFetch(
          `/api/case-management/cases/${item.id}/assign`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              managerAccountId,
              reason,
              priority,
              notifyParticipants: false,
            }),
          },
        ),
      );
      toast.success(item.assignment ? 'Case reassigned.' : 'Case assigned.');
      onAssigned();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to assign case.',
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">
          {item.assignment ? 'Reassign case' : 'Assign case'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {item.applicantName} · {item.id.slice(0, 8)}
        </p>
        <label className="mt-5 block text-sm font-medium">
          Case manager
          <select
            value={managerAccountId}
            onChange={(event) => setManagerAccountId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border px-3"
          >
            <option value="">Select manager</option>
            {managers
              .filter((manager) => manager.status === 'active')
              .map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName} ({manager.activeCases} active)
                </option>
              ))}
          </select>
        </label>
        <label
          htmlFor="case-assignment-priority"
          className="mt-4 block text-sm font-medium"
        >
          Priority
          <select
            id="case-assignment-priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as ManagedCase['priority'])
            }
            className="mt-2 h-11 w-full rounded-lg border px-3"
          >
            {['low', 'normal', 'high', 'urgent'].map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor="case-assignment-reason"
          className="mt-4 block text-sm font-medium"
        >
          Reason
          <Input
            id="case-assignment-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-2"
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={pending || !managerAccountId || reason.trim().length < 3}
            onClick={() => void submit()}
          >
            {pending ? <LoaderCircle className="animate-spin" /> : null}Save
            assignment
          </Button>
        </div>
      </div>
    </div>
  );
}

export const label = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[#f1eef7] px-2.5 py-1 text-xs font-medium text-[#5b477e]">
      {children}
    </span>
  );
}
