'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

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
type Message = {
  id: string;
  body: string;
  senderKind: string;
  internal: boolean;
  createdAt: string;
};
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
  const pageRef = useRef(page);
  pageRef.current = page;
  const end = useRef<HTMLDivElement>(null);
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
          socket.emit('support:inbox');
          if (selectedId.current)
            socket.emit('support:subscribe', {
              conversationId: selectedId.current,
            });
        });
        socket.on('support:inbox', (data) => {
          if (pageRef.current === 1) {
            setItems(data.items);
            setTotal(data.total);
          }
        });
        socket.on('support:messages', (data) => {
          if (data.conversationId !== selectedId.current) return;
          setSelected(data.conversation);
          setMessages((previous) => {
            const latest: Message[] = [...data.messages.items].reverse();
            const ids = new Set(latest.map((m) => m.id));
            const oldest = latest[0]?.createdAt;
            return [
              ...previous.filter(
                (m) => !ids.has(m.id) && oldest && m.createdAt < oldest,
              ),
              ...latest,
            ];
          });
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
    if (!selected)
      void api(`conversations?page=${page}&limit=20`)
        .then((data) => {
          setItems(data.items);
          setTotal(data.total);
        })
        .catch((e) => setError(e.message));
  }, [page, selected]);
  const latestMessageId = messages.at(-1)?.id;
  useEffect(() => {
    if (latestMessageId) end.current?.scrollIntoView({ block: 'nearest' });
  }, [latestMessageId]);

  async function select(c: Conversation) {
    selectedId.current = c.id;
    setSelected(c);
    setMessages([]);
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
      setMessages(history.items.reverse());
      setMessageTotal(history.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to open conversation.');
    }
  }
  async function action(name: string) {
    if (!selected || busy) return;
    const id = selected.id;
    setBusy(true);
    setError('');
    try {
      await api(
        `conversations/${id}/${name}`,
        name === 'messages' ? { body: body.trim(), internal } : {},
      );
      if (name === 'messages' && selectedId.current === id) setBody('');
      const [detail, data] = await Promise.all([
        api(`conversations/${id}`),
        api(`conversations/${id}/messages`),
      ]);
      if (selectedId.current !== id) return;
      setSelected(detail);
      setMessages(data.items.reverse());
      setHistoryPage(1);
      setMessageTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }
  async function older() {
    if (!selected) return;
    const id = selected.id;
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
    }
  }
  const mine = !!selected && selected.assignedAccountId === account.id;
  const canReply = mine && !selected?.closedAt;
  return (
    <div className="space-y-4">
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
      <div className="grid min-h-[65vh] gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-xl border bg-white p-3">
          <h2 className="mb-3 font-medium">Customer conversations</h2>
          {items.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No conversations yet.
            </p>
          )}
          {items.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => select(c)}
              className={`mb-2 block w-full rounded-lg border p-3 text-left ${selected?.id === c.id ? 'bg-violet-50' : ''}`}
            >
              <strong className="block">{c.subject}</strong>
              <small>
                {c.channel} · {c.category} ·{' '}
                {c.closedAt ? 'Ended' : c.assignedName || 'Unassigned'}
              </small>
            </button>
          ))}
          <div className="flex justify-between">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => {
                setSelected(null);
                selectedId.current = null;
                setPage(page - 1);
              }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page * 20 >= total}
              onClick={() => {
                setSelected(null);
                selectedId.current = null;
                setPage(page + 1);
              }}
            >
              Next
            </button>
          </div>
        </aside>
        <section className="flex min-w-0 flex-col rounded-xl border bg-white">
          {selected ? (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
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
                      Pick up conversation
                    </button>
                  ) : (
                    mine && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => action('close')}
                        className="rounded-lg border px-4 py-2"
                      >
                        End conversation
                      </button>
                    )
                  ))}
              </header>
              <div
                className="max-h-[55vh] flex-1 space-y-3 overflow-y-auto p-4"
                role="log"
                aria-live="polite"
              >
                {messages.length < messageTotal && (
                  <button
                    type="button"
                    onClick={older}
                    className="text-sm underline"
                  >
                    Load earlier messages
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
                  </div>
                ))}
                <div ref={end} />
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
                    void action('messages');
                  }}
                  className="space-y-2 border-t p-4"
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
                      Send
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
            <p className="m-auto p-12 text-muted-foreground">
              Select a conversation to view it. Pick it up when you’re ready to
              help.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
