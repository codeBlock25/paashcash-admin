'use client';

import { LoaderCircle, MessageCircle } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { SupportMessageStatus } from '@/components/support-message-status';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import {
  confirmMessage,
  type ChatMessage as Message,
  mergeMessages,
} from '@/lib/support-messages';

type Conversation = {
  id: string;
  subject: string;
  category: string;
  assignedAccountId: string | null;
  assignedName: string | null;
  closedAt: string | null;
  rating: number | null;
  feedback: string | null;
  channel: string;
};
type InboxTab = 'active' | 'unassigned' | 'ended';
async function api(path: string, body?: object) {
  const response = await authenticatedFetch(
    `/api/support/${path}`,
    body
      ? {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Support request failed.');
  return data;
}
export default function SupportPage() {
  const account = useAdminAccount();
  const [items, setItems] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [internal, setInternal] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const selectedId = useRef<string | null>(null);
  const [tab, setTab] = useState<InboxTab>('active');
  const [listLoading, setListLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [visible, setVisible] = useState(true);
  const queryRef = useRef({ page, limit: 20, lifecycle: tab });
  queryRef.current = { page, limit: 20, lifecycle: tab };
  const messageList = useRef<HTMLDivElement>(null);
  const acknowledged = useRef('');
  const [historyPage, setHistoryPage] = useState(1);
  const [messageTotal, setMessageTotal] = useState(0);

  useEffect(() => {
    let disposed = false;
    let reconnect: ReturnType<typeof setTimeout>;
    async function connect() {
      try {
        const ticket = await api('socket-ticket', {});
        if (disposed) return;
        const socket = io(`${ticket.socketUrl}${ticket.namespace}`, {
          auth: { ticket: ticket.ticket },
          transports: ['websocket'],
          reconnection: false,
        });
        socketRef.current = socket;
        socket.on('support:ready', () => {
          setConnected(true);
          socket.emit('support:inbox', queryRef.current);
          if (selectedId.current)
            socket.emit('support:subscribe', {
              conversationId: selectedId.current,
            });
        });
        socket.on('support:inbox', (data) => {
          if (
            data.page === queryRef.current.page &&
            data.lifecycle === queryRef.current.lifecycle
          ) {
            setListLoading(false);
            setItems(data.items);
            setTotal(data.total);
            setPage((current) =>
              Math.min(current, Math.max(1, Math.ceil(data.total / 20))),
            );
          }
        });
        socket.on('support:messages', (data) => {
          if (data.conversationId !== selectedId.current) return;
          setSelected(data.conversation);
          const latest: Message[] = [...data.messages.items].reverse();
          setMessages((previous) => mergeMessages(previous, latest));
          setChatLoading(false);
          setMessageTotal(data.messages.total);
        });
        const retry = () => {
          socket.removeAllListeners();
          socket.disconnect();
          if (socketRef.current === socket) socketRef.current = null;
          setConnected(false);
          if (!disposed) reconnect = setTimeout(connect, 3000);
        };
        socket.on('disconnect', retry);
        socket.on('connect_error', retry);
        socket.on('support:error', () =>
          setError('Support connection failed. Please reload to reconnect.'),
        );
      } catch (e) {
        if (!disposed) {
          setError(e instanceof Error ? e.message : 'Connection failed.');
          reconnect = setTimeout(connect, 5000);
        }
      }
    }
    void connect();
    return () => {
      disposed = true;
      clearTimeout(reconnect);
      socketRef.current?.disconnect();
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    socketRef.current?.emit('support:inbox', {
      page,
      limit: 20,
      lifecycle: tab,
    });
    void api(`conversations?page=${page}&limit=20&lifecycle=${tab}`)
      .then((data) => {
        if (!cancelled) {
          setItems(data.items);
          setTotal(data.total);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, tab]);

  useEffect(() => {
    const update = () =>
      setVisible(document.visibilityState === 'visible' && document.hasFocus());
    update();
    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);
    window.addEventListener('blur', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('focus', update);
      window.removeEventListener('blur', update);
    };
  }, []);

  const lastReceived = messages
    .filter((m) => !m.delivery && !m.internal)
    .at(-1);
  const conversationId = selected?.id;
  useEffect(() => {
    if (!visible || !conversationId || !lastReceived) return;
    const key = `${conversationId}/${lastReceived.id}`;
    let cancelled = false;
    const markRead = () => {
      if (acknowledged.current === key) return;
      void api(`conversations/${conversationId}/read/${lastReceived.id}`, {})
        .then(() => {
          if (!cancelled) acknowledged.current = key;
        })
        .catch(() => {});
    };
    markRead();
    const timer = setInterval(markRead, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [visible, conversationId, lastReceived]);

  const latestMessageKey =
    messages.at(-1)?.clientMessageId ?? messages.at(-1)?.id;
  useLayoutEffect(() => {
    if (!latestMessageKey) return;
    const list = messageList.current;
    list?.scrollTo({ top: list.scrollHeight, behavior: 'instant' });
  }, [latestMessageKey]);

  async function select(c: Conversation) {
    selectedId.current = c.id;
    setSelected(c);
    setMessages([]);
    setMessageTotal(0);
    setChatLoading(true);
    setInternal(false);
    setBody('');
    setError('');
    setHistoryPage(1);
    socketRef.current?.emit('support:subscribe', { conversationId: c.id });
    try {
      const [detail, history] = await Promise.all([
        api(`conversations/${c.id}`),
        api(`conversations/${c.id}/messages`),
      ]);
      if (selectedId.current !== c.id) return;
      setSelected(detail);
      setMessages((previous) =>
        mergeMessages(previous, [...history.items].reverse()),
      );
      setMessageTotal(history.total);
    } catch (e) {
      if (selectedId.current === c.id)
        setError(
          e instanceof Error ? e.message : 'Unable to open conversation.',
        );
    } finally {
      if (selectedId.current === c.id) setChatLoading(false);
    }
  }

  async function sendMessage(retry?: Message) {
    if (!selected || busy || (!retry && !body.trim())) return;
    const id = selected.id;
    const clientMessageId = retry?.clientMessageId ?? crypto.randomUUID();
    const text = retry?.body ?? body.trim();
    const note = retry?.internal ?? internal;
    const outgoing: Message = {
      id: clientMessageId,
      clientMessageId,
      body: text,
      internal: note,
      senderKind: 'staff',
      createdAt: retry?.createdAt ?? new Date().toISOString(),
      delivery: 'sending',
    };
    setMessages((previous) => [
      ...previous.filter((m) => m.clientMessageId !== clientMessageId),
      outgoing,
    ]);
    if (!retry) setBody('');
    setBusy(true);
    setPendingAction('messages');
    setError('');
    try {
      const result = await api(`conversations/${id}/messages`, {
        body: text,
        internal: note,
        clientMessageId,
      });
      if (selectedId.current !== id) return;
      setMessages((previous) =>
        confirmMessage(previous, clientMessageId, result),
      );
    } catch (e) {
      if (selectedId.current !== id) return;
      setMessages((previous) =>
        previous.map((m) =>
          m.clientMessageId === clientMessageId && m.delivery
            ? { ...m, delivery: 'failed' }
            : m,
        ),
      );
      setError(e instanceof Error ? e.message : 'Message could not be sent.');
    } finally {
      setBusy(false);
      setPendingAction('');
    }
  }
  async function action(name: string) {
    if (!selected || busy) return;
    const id = selected.id;
    setBusy(true);
    setPendingAction(name);
    setError('');
    try {
      await api(`conversations/${id}/${name}`, {});
      const [detail, data] = await Promise.all([
        api(`conversations/${id}`),
        api(`conversations/${id}/messages`),
      ]);
      if (selectedId.current !== id) return;
      setSelected(detail);
      setMessages((previous) =>
        mergeMessages(previous, [...data.items].reverse()),
      );
      setHistoryPage(1);
      setMessageTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
      setPendingAction('');
    }
  }
  async function older() {
    if (!selected || historyLoading) return;
    const id = selected.id;
    setHistoryLoading(true);
    try {
      const next = historyPage + 1;
      const data = await api(`conversations/${id}/messages?page=${next}`);
      if (selectedId.current !== id) return;
      setMessages((previous) => [
        ...data.items
          .reverse()
          .filter((m: Message) => !previous.some((p) => p.id === m.id)),
        ...previous,
      ]);
      setHistoryPage(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load messages.');
    } finally {
      setHistoryLoading(false);
    }
  }
  const mine = !!selected && selected.assignedAccountId === account.id;
  const canReply = mine && !selected?.closedAt;
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Support inbox</h1>
        <span className="text-sm text-muted-foreground">
          {connected ? 'Live' : 'Reconnecting…'}
        </span>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(180px,35%)_minmax(0,1fr)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-white">
          <div className="shrink-0 border-b p-3">
            <h2 className="mb-3 font-medium">Customer conversations</h2>
            <div
              className="flex gap-1 rounded-lg bg-gray-100 p-1"
              role="tablist"
              aria-label="Conversation status"
            >
              {(['active', 'unassigned', 'ended'] as const).map((value) => (
                <button
                  key={value}
                  id={`tab-${value}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  aria-controls="conversation-list"
                  tabIndex={tab === value ? 0 : -1}
                  onKeyDown={(event) => {
                    const values = ['active', 'unassigned', 'ended'] as const;
                    const index = values.indexOf(value);
                    const next =
                      event.key === 'ArrowRight'
                        ? values[(index + 1) % 3]
                        : event.key === 'ArrowLeft'
                          ? values[(index + 2) % 3]
                          : event.key === 'Home'
                            ? values[0]
                            : event.key === 'End'
                              ? values[2]
                              : null;
                    if (next) {
                      event.preventDefault();
                      document.getElementById(`tab-${next}`)?.click();
                      document.getElementById(`tab-${next}`)?.focus();
                    }
                  }}
                  onClick={() => {
                    setTab(value);
                    setPage(1);
                    setSelected(null);
                    selectedId.current = null;
                    setMessages([]);
                  }}
                  className={`min-w-0 flex-1 rounded-md px-2 py-2 text-xs font-medium ${tab === value ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
                >
                  {value === 'active'
                    ? 'Active'
                    : value === 'unassigned'
                      ? 'Unassigned'
                      : 'Ended'}
                </button>
              ))}
            </div>
          </div>
          <div
            id="conversation-list"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            aria-busy={listLoading}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
          >
            {listLoading ? (
              <div role="status" className="space-y-3">
                <span className="sr-only">Loading conversations…</span>
                {[0, 1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-20 animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                {tab === 'ended'
                  ? 'No ended conversations.'
                  : tab === 'unassigned'
                    ? 'No conversations waiting for an agent.'
                    : 'No active conversations.'}
              </p>
            ) : (
              items.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => void select(c)}
                  aria-pressed={selected?.id === c.id}
                  className={`mb-2 block w-full rounded-lg border p-3 text-left transition-colors hover:bg-violet-50 ${selected?.id === c.id ? 'border-primary/30 bg-violet-50' : ''}`}
                >
                  <strong className="block truncate">{c.subject}</strong>
                  <small>
                    {c.channel} · {c.category} ·{' '}
                    {c.closedAt ? 'Ended' : c.assignedName || 'Unassigned'}
                  </small>
                </button>
              ))
            )}
          </div>
          <footer className="flex shrink-0 items-center justify-between border-t p-3 text-sm">
            <button
              type="button"
              disabled={listLoading || page === 1}
              onClick={() => setPage((n) => n - 1)}
              className="rounded-md px-2 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              {page} / {Math.max(1, Math.ceil(total / 20))}
            </span>
            <button
              type="button"
              disabled={listLoading || page * 20 >= total}
              onClick={() => setPage((n) => n + 1)}
              className="rounded-md px-2 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </footer>
        </aside>
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border bg-white">
          {selected ? (
            <>
              <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b p-4">
                <div>
                  <h2 className="font-semibold">{selected.subject}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selected.closedAt
                      ? 'Conversation ended'
                      : selected.assignedName
                        ? `Assigned to ${selected.assignedName}`
                        : 'Waiting for an agent'}
                  </p>
                </div>
                {!selected.closedAt &&
                  (!selected.assignedAccountId ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => action('claim')}
                      className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
                    >
                      {pendingAction === 'claim' ? (
                        <span className="flex items-center gap-2">
                          <LoaderCircle size={16} className="animate-spin" />{' '}
                          Picking up…
                        </span>
                      ) : (
                        'Pick up conversation'
                      )}
                    </button>
                  ) : (
                    mine && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => action('close')}
                        className="rounded-lg border px-4 py-2"
                      >
                        {pendingAction === 'close' ? (
                          <span className="flex items-center gap-2">
                            <LoaderCircle size={16} className="animate-spin" />{' '}
                            Ending…
                          </span>
                        ) : (
                          'End conversation'
                        )}
                      </button>
                    )
                  ))}
              </header>
              <div
                ref={messageList}
                aria-busy={chatLoading}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4"
                role="log"
                aria-live="polite"
              >
                {chatLoading && (
                  <p
                    role="status"
                    className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground"
                  >
                    <LoaderCircle size={18} className="animate-spin" /> Loading
                    conversation…
                  </p>
                )}
                {messages.filter((m) => !m.delivery).length < messageTotal && (
                  <button
                    type="button"
                    disabled={historyLoading}
                    onClick={older}
                    className="text-sm underline"
                  >
                    {historyLoading ? 'Loading…' : 'Load earlier messages'}
                  </button>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[90%] whitespace-pre-wrap break-words rounded-xl p-3 ${m.internal ? 'bg-amber-50' : m.senderKind === 'staff' ? 'ml-auto bg-violet-50' : 'bg-gray-100'}`}
                  >
                    <small className="mb-1 block text-xs text-muted-foreground">
                      {m.internal
                        ? 'Internal note'
                        : m.senderKind === 'staff'
                          ? 'Support'
                          : 'Customer'}{' '}
                      · {new Date(m.createdAt).toLocaleString()}
                    </small>
                    {m.body}
                    {m.senderKind === 'staff' && (
                      <div className="mt-1 flex justify-end text-xs text-muted-foreground">
                        <SupportMessageStatus
                          message={m}
                          onRetry={() => void sendMessage(m)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {selected.rating && (
                <p className="border-t p-4">
                  Rating: {selected.rating}/5
                  {selected.feedback ? ` — ${selected.feedback}` : ''}
                </p>
              )}
              {canReply ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendMessage();
                  }}
                  className="shrink-0 space-y-2 border-t p-4"
                >
                  <label className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={internal}
                      onChange={(e) => setInternal(e.target.checked)}
                    />
                    Internal note
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      aria-label="Reply to customer"
                      maxLength={5000}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border p-3"
                      placeholder={
                        internal ? 'Private note…' : 'Write a reply…'
                      }
                    />
                    <button
                      type="submit"
                      disabled={busy || !body.trim()}
                      className="rounded-lg bg-primary px-5 text-primary-foreground disabled:opacity-50"
                    >
                      {pendingAction === 'messages' ? (
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                          aria-label="Sending message"
                        />
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="border-t p-4 text-sm text-muted-foreground">
                  {selected.closedAt
                    ? 'This conversation is closed.'
                    : selected.assignedAccountId
                      ? 'View only. Only the assigned agent can respond.'
                      : 'Pick up this conversation to respond.'}
                </p>
              )}
            </>
          ) : (
            <p className="m-auto max-w-md p-8 text-center text-sm text-muted-foreground">
              <MessageCircle className="mx-auto mb-3 size-9 text-primary/50" />
              Select a conversation to view it. Pick it up when you’re ready to
              help.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
