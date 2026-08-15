'use client';

import { LoaderCircle, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import type { CaseConversation, CaseMessage } from './case-management.types';
import { readApi } from './case-management.types';
import { label } from './cases-page';
import { useCaseSocket } from './use-case-socket';

export function InboxPage() {
  const actor = useAdminAccount();
  const [items, setItems] = useState<CaseConversation[]>([]);
  const [selected, setSelected] = useState<CaseConversation>();
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const result = await readApi<CaseConversation[]>(
        await authenticatedFetch('/api/case-management/conversations', {
          cache: 'no-store',
        }),
      );
      setItems(result);
      setSelected((current) => current ?? result[0]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load inbox.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  const conversationIds = useMemo(() => items.map((item) => item.id), [items]);
  const onMessage = useCallback(
    (message: CaseMessage) => {
      setItems((current) =>
        current.map((item) =>
          item.id === message.conversationId
            ? {
                ...item,
                latestMessage: message,
                unread:
                  selected?.id === message.conversationId
                    ? 0
                    : (item.unread ?? 0) + 1,
              }
            : item,
        ),
      );
      if (selected?.id === message.conversationId) {
        setMessages((current) =>
          current.some((item) => item.id === message.id)
            ? current
            : [...current, message],
        );
      }
    },
    [selected?.id],
  );
  const {
    connected,
    markRead,
    send: sendLive,
  } = useCaseSocket({
    conversationIds,
    onMessage,
    onRead: (event) => {
      if (event.accountId !== actor.id) return;
      setItems((current) =>
        current.map((item) =>
          item.id === event.conversationId ? { ...item, unread: 0 } : item,
        ),
      );
    },
    onAccessRevoked: (event) => {
      const revoked = new Set(event.conversationIds);
      setItems((current) => current.filter((item) => !revoked.has(item.id)));
      setSelected((current) =>
        current && revoked.has(current.id) ? undefined : current,
      );
      setMessages([]);
      toast.info('A case was reassigned and removed from your inbox.');
    },
    onAssignment: () => void loadInbox(),
  });
  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);
  useEffect(() => {
    if (!selected) return;
    void (async () => {
      setMessages(
        await readApi(
          await authenticatedFetch(
            `/api/case-management/conversations/${selected.id}/messages`,
            { cache: 'no-store' },
          ),
        ),
      );
      await markRead(selected.id);
      setItems((current) =>
        current.map((item) =>
          item.id === selected.id ? { ...item, unread: 0 } : item,
        ),
      );
    })();
  }, [markRead, selected]);
  async function send(event: FormEvent) {
    event.preventDefault();
    if (!selected || !body.trim()) return;
    try {
      await sendLive(selected.id, body);
      setBody('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send.');
    }
  }
  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#faf9fb] p-4 sm:p-8">
      <div className="mx-auto max-w-[1300px]">
        <h2 className="text-xl font-semibold">Case inbox</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every thread belongs to one case and either its applicant or agency.
        </p>
        <div className="mt-6 grid min-h-[620px] overflow-hidden rounded-2xl border bg-white lg:grid-cols-[360px_1fr]">
          <aside className="border-r">
            <div className="flex items-center justify-between border-b p-4 font-medium">
              Conversations
              <span
                className={`size-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-400'}`}
                title={connected ? 'Live' : 'Reconnecting'}
              />
            </div>
            {loading ? (
              <LoaderCircle className="m-6 animate-spin" />
            ) : items.length ? (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`flex w-full items-start justify-between border-b p-4 text-left ${selected?.id === item.id ? 'bg-[#f6f2fb]' : 'hover:bg-muted/50'}`}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.participant || label(item.party)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Case {item.caseId.slice(0, 8)} · {label(item.party)}
                    </p>
                    <p className="mt-1 max-w-[250px] truncate text-xs text-muted-foreground">
                      {item.latestMessage?.body || 'No messages'}
                    </p>
                  </div>
                  {item.unread ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                      {item.unread}
                    </span>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <MessageCircle className="mx-auto mb-2" />
                No conversations yet.
              </div>
            )}
          </aside>
          <main className="flex min-h-[620px] flex-col">
            {selected ? (
              <>
                <header className="flex items-center justify-between border-b p-4">
                  <div>
                    <p className="font-medium">
                      {selected.participant || label(selected.party)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {label(selected.party)} conversation
                    </p>
                  </div>
                  <Link
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'sm',
                    })}
                    href={`/dashboard/cases/${selected.caseId}`}
                  >
                    Open case
                  </Link>
                </header>
                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm ${message.senderAccountId === actor.id ? 'ml-auto bg-primary text-white' : 'bg-muted'}`}
                    >
                      <p>{message.body}</p>
                      <p className="mt-1 text-[10px] opacity-65">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <form onSubmit={send} className="flex gap-2 border-t p-4">
                  <Input
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Write a case message"
                  />
                  <Button disabled={!body.trim()}>
                    <Send />
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="grid flex-1 place-items-center text-muted-foreground">
                Select a conversation.
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
