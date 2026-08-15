'use client';

import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  LoaderCircle,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import type {
  CaseConversation,
  CaseMessage,
  ManagedCaseDetail,
} from './case-management.types';
import { readApi } from './case-management.types';
import { Badge, label } from './cases-page';
import { useCaseSocket } from './use-case-socket';

export function CaseDetailPage({ caseId }: { caseId: string }) {
  const actor = useAdminAccount();
  const [item, setItem] = useState<ManagedCaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItem(
        await readApi(
          await authenticatedFetch(`/api/case-management/cases/${caseId}`, {
            cache: 'no-store',
          }),
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load case.',
      );
    } finally {
      setLoading(false);
    }
  }, [caseId]);
  useEffect(() => {
    void load();
  }, [load]);
  if (loading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  if (!item) return <div className="p-8">Case unavailable.</div>;
  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1300px]">
        <Link
          href="/dashboard/cases"
          className="mb-4 inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium hover:bg-accent"
        >
          <ArrowLeft />
          Back to cases
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">
              {item.visaType || 'Visa case'} · {item.id.slice(0, 8)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.applicant.fullName} with {item.agency.fullName}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge>{label(item.status)}</Badge>
            <Badge>{label(item.priority)}</Badge>
          </div>
        </div>
        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="font-semibold">Case conversations</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Applicant and agency messages remain separate.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <ConversationPanel
                  caseId={item.id}
                  party="applicant"
                  conversation={item.conversations.find(
                    (value) => value.party === 'applicant',
                  )}
                />
                <ConversationPanel
                  caseId={item.id}
                  party="agency"
                  conversation={item.conversations.find(
                    (value) => value.party === 'agency',
                  )}
                />
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="font-semibold">Document request tracking</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Read-only workflow status. Secure file access remains in the
                existing casework flow.
              </p>
              <div className="mt-4 space-y-3">
                {item.documentRequests.length ? (
                  item.documentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start gap-3 rounded-xl bg-[#faf9fb] p-3"
                    >
                      <FileText className="mt-0.5 size-4" />
                      <div>
                        <p className="text-sm font-medium">{request.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.reason}
                        </p>
                        <Badge>{label(request.status)}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No document requests.
                  </p>
                )}
              </div>
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="font-semibold">Case parties</h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Applicant</dt>
                  <dd>{item.applicant.fullName}</dd>
                  <dd className="text-xs text-muted-foreground">
                    {item.applicant.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Agency</dt>
                  <dd>{item.agency.fullName}</dd>
                  <dd className="text-xs text-muted-foreground">
                    {item.agency.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Assigned manager</dt>
                  <dd>{item.assignment?.managerName || 'Unassigned'}</dd>
                </div>
              </dl>
            </div>
            <EscalationForm caseId={item.id} onRaised={load} />
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">No financial authority</p>
              <p className="mt-1 text-xs">
                This workspace cannot release escrow, move wallet funds, or
                alter payment authority.
              </p>
            </div>
            {actor.accountType === 'admin_case_manager' &&
            item.assignment?.managerAccountId !== actor.id ? (
              <Button
                className="w-full"
                onClick={async () => {
                  try {
                    await readApi(
                      await authenticatedFetch(
                        `/api/case-management/cases/${item.id}/take`,
                        { method: 'POST' },
                      ),
                    );
                    toast.success('Case assigned to you.');
                    void load();
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : 'Unable to take case.',
                    );
                  }
                }}
              >
                Take this case
              </Button>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}

function ConversationPanel({
  caseId,
  party,
  conversation,
}: {
  caseId: string;
  party: 'applicant' | 'agency';
  conversation?: CaseConversation;
}) {
  const actor = useAdminAccount();
  const [current, setCurrent] = useState(conversation);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const onMessage = useCallback((message: CaseMessage) => {
    setMessages((currentMessages) =>
      currentMessages.some((item) => item.id === message.id)
        ? currentMessages
        : [...currentMessages, message],
    );
  }, []);
  const { markRead, send: sendLive } = useCaseSocket({
    conversationIds: current ? [current.id] : [],
    onMessage,
    onAccessRevoked: (event) => {
      if (!current || !event.conversationIds.includes(current.id)) return;
      setCurrent(undefined);
      setMessages([]);
      toast.info('This case was reassigned and is no longer available.');
    },
  });
  const loadMessages = useCallback(
    async (id: string) => {
      setMessages(
        await readApi(
          await authenticatedFetch(
            `/api/case-management/conversations/${id}/messages`,
            { cache: 'no-store' },
          ),
        ),
      );
      await markRead(id);
    },
    [markRead],
  );
  useEffect(() => {
    if (current) void loadMessages(current.id).catch(() => undefined);
  }, [current, loadMessages]);
  async function ensureConversation() {
    if (current) return current;
    const created = await readApi<CaseConversation>(
      await authenticatedFetch(
        `/api/case-management/cases/${caseId}/conversations`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ party }),
        },
      ),
    );
    setCurrent(created);
    return created;
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    try {
      const active = await ensureConversation();
      await sendLive(active.id, body);
      setBody('');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to send message.',
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="rounded-xl border p-4">
      <p className="font-medium">
        {party === 'applicant' ? 'Applicant' : 'Agency'}
      </p>
      <div className="mt-3 h-48 space-y-2 overflow-y-auto rounded-lg bg-[#faf9fb] p-3">
        {messages.length ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.senderAccountId === actor.id ? 'ml-auto bg-primary text-white' : 'bg-white'}`}
            >
              <p>{message.body}</p>
              <p className="mt-1 text-[10px] opacity-65">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No messages yet.</p>
        )}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <Input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={`Message ${party}`}
        />
        <Button size="icon" disabled={pending || !body.trim()}>
          {pending ? <LoaderCircle className="animate-spin" /> : <Send />}
        </Button>
      </form>
    </div>
  );
}

function EscalationForm({
  caseId,
  onRaised,
}: {
  caseId: string;
  onRaised: () => void;
}) {
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('other');
  const [priority, setPriority] = useState('high');
  const [pending, setPending] = useState(false);
  async function submit() {
    setPending(true);
    try {
      await readApi(
        await authenticatedFetch(
          `/api/case-management/cases/${caseId}/escalations`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ reason, priority, description }),
          },
        ),
      );
      toast.success('Escalation raised.');
      setDescription('');
      onRaised();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to raise escalation.',
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-amber-600" />
        <h3 className="font-semibold">Raise escalation</h3>
      </div>
      <select
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        className="mt-4 h-10 w-full rounded-lg border px-3 text-sm"
      >
        {[
          'sla_overdue',
          'applicant_not_responding',
          'document_issue',
          'other',
        ].map((value) => (
          <option key={value} value={value}>
            {label(value)}
          </option>
        ))}
      </select>
      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
        className="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
      >
        {['normal', 'high', 'urgent'].map((value) => (
          <option key={value} value={value}>
            {label(value)}
          </option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Describe the blocker or risk"
        className="mt-3 min-h-24 w-full rounded-lg border p-3 text-sm"
      />
      <Button
        className="mt-3 w-full"
        variant="outline"
        disabled={pending || description.trim().length < 3}
        onClick={() => void submit()}
      >
        {pending ? <LoaderCircle className="animate-spin" /> : null}Raise
        escalation
      </Button>
    </div>
  );
}
