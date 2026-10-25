export type ChatMessage = {
  id: string;
  clientMessageId?: string | null;
  body: string;
  senderKind: string;
  internal?: boolean;
  createdAt: string;
  readAt?: string | null;
  delivery?: 'sending' | 'failed';
};

// A server echo can arrive before the POST response. Correlate by the client
// UUID so realtime refreshes neither duplicate nor erase an outgoing bubble.
export function mergeMessages(previous: ChatMessage[], latest: ChatMessage[]) {
  const ids = new Set(latest.flatMap((m) => [m.id, m.clientMessageId]));
  return [
    ...previous.filter(
      (m) => !ids.has(m.id) && !ids.has(m.clientMessageId ?? m.id),
    ),
    ...latest.map((message) => ({
      ...message,
      readAt:
        message.readAt ?? previous.find((old) => old.id === message.id)?.readAt,
    })),
  ].sort(
    (a, b) =>
      a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  );
}

export function confirmMessage(
  previous: ChatMessage[],
  clientId: string,
  result: { id: string; createdAt: string; clientMessageId?: string },
) {
  const echoed = previous.some((m) => m.id === result.id && !m.delivery);
  return previous
    .filter((m) => !(echoed && m.delivery && m.clientMessageId === clientId))
    .map((m) =>
      m.delivery && m.clientMessageId === clientId
        ? { ...m, ...result, delivery: undefined }
        : m,
    );
}
