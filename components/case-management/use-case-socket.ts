'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import type { CaseMessage } from './case-management.types';
import { readApi } from './case-management.types';

type SocketTicket = {
  ticket: string;
  socketUrl: string;
  namespace: string;
};

export function useCaseSocket({
  conversationIds,
  onMessage,
  onRead,
  onAccessRevoked,
  onAssignment,
}: {
  conversationIds: string[];
  onMessage: (message: CaseMessage) => void;
  onRead?: (event: {
    conversationId: string;
    accountId: string;
    readAt: string;
  }) => void;
  onAccessRevoked?: (event: {
    caseId: string;
    conversationIds: string[];
  }) => void;
  onAssignment?: (event: { caseId: string; conversationIds: string[] }) => void;
}) {
  const socketRef = useRef<Socket | null>(null);
  const idsRef = useRef(conversationIds);
  const messageRef = useRef(onMessage);
  const readRef = useRef(onRead);
  const revokedRef = useRef(onAccessRevoked);
  const assignmentRef = useRef(onAssignment);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);

  idsRef.current = conversationIds;
  messageRef.current = onMessage;
  readRef.current = onRead;
  revokedRef.current = onAccessRevoked;
  assignmentRef.current = onAssignment;

  useEffect(() => {
    let disposed = false;

    async function connect() {
      try {
        const ticket = await readApi<SocketTicket>(
          await authenticatedFetch('/api/case-management/socket-ticket', {
            method: 'POST',
          }),
        );
        if (disposed) return;
        const socket = io(`${ticket.socketUrl}${ticket.namespace}`, {
          auth: { ticket: ticket.ticket },
          reconnection: false,
          transports: ['websocket'],
        });
        socketRef.current = socket;
        socket.on('connect', () => {
          setConnected(true);
          for (const conversationId of idsRef.current) {
            socket.emit('case:subscribe', { conversationId });
          }
        });
        socket.on('case:message', (message: CaseMessage) =>
          messageRef.current(message),
        );
        socket.on('case:read', (event) => readRef.current?.(event));
        socket.on('case:access-revoked', (event) =>
          revokedRef.current?.(event),
        );
        socket.on('case:assignment', (event) => assignmentRef.current?.(event));
        socket.on('disconnect', () => {
          setConnected(false);
          socketRef.current = null;
          if (!disposed) reconnectTimer.current = setTimeout(connect, 1500);
        });
      } catch {
        if (!disposed) reconnectTimer.current = setTimeout(connect, 3000);
      }
    }

    void connect();
    return () => {
      disposed = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    for (const conversationId of conversationIds) {
      socket.emit('case:subscribe', { conversationId });
    }
  }, [conversationIds]);

  const send = useCallback(async (conversationId: string, body: string) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      try {
        await socket
          .timeout(5000)
          .emitWithAck('case:send', { conversationId, body });
        return;
      } catch {
        // The persisted HTTP endpoint is the non-polling delivery fallback.
      }
    }
    await readApi(
      await authenticatedFetch(
        `/api/case-management/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ body }),
        },
      ),
    );
  }, []);

  const markRead = useCallback(async (conversationId: string) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      try {
        await socket.timeout(5000).emitWithAck('case:read', { conversationId });
        return;
      } catch {
        // Fall through to the persistence-backed HTTP endpoint.
      }
    }
    await authenticatedFetch(
      `/api/case-management/conversations/${conversationId}/read`,
      { method: 'POST' },
    );
  }, []);

  return { connected, markRead, send };
}
