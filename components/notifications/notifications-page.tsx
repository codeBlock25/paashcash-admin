'use client';

import { AlertTriangle, Bell, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  MarkAllReadButton,
  notificationsReadAllEvent,
} from '@/components/notifications/mark-all-read-button';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

type Notification = {
  id: string;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationResponse = {
  items: Notification[];
  meta: { totalItems: number };
};

type ApiError = { message?: string | string[] };

export function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(
        '/api/notifications?limit=100',
        {
          cache: 'no-store',
        },
      );
      const result = (await response.json()) as NotificationResponse | ApiError;

      if (!response.ok) {
        const message = (result as ApiError).message;
        throw new Error(
          Array.isArray(message)
            ? message.join(' ')
            : message || 'Unable to load notifications.',
        );
      }

      setNotifications((result as NotificationResponse).items);
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
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    function handleAllRead() {
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, readAt })),
      );
    }

    window.addEventListener(notificationsReadAllEvent, handleAllRead);
    return () =>
      window.removeEventListener(notificationsReadAllEvent, handleAllRead);
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt,
  ).length;
  const groups = useMemo(
    () => groupNotifications(notifications),
    [notifications],
  );

  async function openNotification(notification: Notification) {
    if (!notification.ctaUrl || openingId) return;
    setOpeningId(notification.id);

    try {
      if (!notification.readAt) {
        const response = await authenticatedFetch(
          `/api/notifications/${encodeURIComponent(notification.id)}/read`,
          { method: 'PATCH' },
        );
        if (!response.ok) throw new Error('Unable to open this notification.');

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, readAt: new Date().toISOString() }
              : item,
          ),
        );
      }

      if (notification.ctaUrl.startsWith('/')) {
        router.push(notification.ctaUrl);
      } else {
        const destination = new URL(notification.ctaUrl);
        if (!['http:', 'https:'].includes(destination.protocol)) {
          throw new Error('This notification has an invalid destination.');
        }
        window.location.assign(destination.href);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to open this notification.',
      );
      setOpeningId(null);
    }
  }

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-white px-4 py-7 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#242328]">
              Notifications
            </h2>
            {!loading && unreadCount > 0 ? (
              <span className="rounded-full bg-[#fff0f0] px-3 py-1 text-[12px] font-medium text-[#e53434]">
                {unreadCount} unread
              </span>
            ) : null}
          </div>
          <MarkAllReadButton compact disabled={loading || unreadCount === 0} />
        </div>

        {loading ? <NotificationsLoading /> : null}

        {!loading && notifications.length === 0 ? (
          <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-[#dfdde4] px-6 text-center">
            <div>
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#f4efff] text-primary">
                <Bell className="size-5" />
              </div>
              <p className="mt-4 text-[15px] font-medium text-[#29272e]">
                You’re all caught up
              </p>
              <p className="mt-1 text-[13px] text-[#85828b]">
                New system alerts and activity updates will appear here.
              </p>
            </div>
          </div>
        ) : null}

        {!loading
          ? groups.map((group) => (
              <div key={group.label} className="mb-8">
                <h3 className="mb-4 text-[12px] font-medium uppercase tracking-[0.02em] text-[#a09da7]">
                  {group.label}
                </h3>
                <div className="grid gap-4">
                  {group.items.map((notification) => {
                    const visual = notificationVisual(notification);
                    const Icon = visual.icon;
                    const unread = !notification.readAt;

                    return (
                      <article
                        key={notification.id}
                        className="grid min-h-[86px] grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border border-[#e5e3e8] px-4 py-4 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:gap-4 sm:px-5"
                      >
                        <span
                          aria-hidden="true"
                          className={`size-2.5 rounded-full ${unread ? 'bg-[#2f6df6]' : 'bg-transparent'}`}
                        />
                        <div
                          className={`grid size-10 place-items-center rounded-full ${visual.background} ${visual.foreground}`}
                        >
                          <Icon className="size-5" strokeWidth={2} />
                        </div>
                        <div className="col-start-2 min-w-0 sm:col-start-auto">
                          <p className="truncate text-[14px] font-semibold leading-5 text-[#25242a]">
                            {notification.title}
                          </p>
                          <p className="truncate text-[13px] leading-5 text-[#7e7b85]">
                            {notification.message}
                          </p>
                        </div>
                        <div className="col-span-2 flex items-center justify-between gap-4 pl-[52px] sm:col-span-1 sm:block sm:min-w-32 sm:pl-0 sm:text-right">
                          <time
                            dateTime={notification.createdAt}
                            className="block text-[12px] text-[#aaa7b0]"
                          >
                            {formatRelativeTime(notification.createdAt)}
                          </time>
                          {notification.ctaLabel && notification.ctaUrl ? (
                            <button
                              type="button"
                              disabled={openingId === notification.id}
                              onClick={() =>
                                void openNotification(notification)
                              }
                              className="mt-1 text-[13px] font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-60"
                            >
                              {openingId === notification.id
                                ? 'Opening…'
                                : notification.ctaLabel}
                            </button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}

function notificationVisual(notification: Notification) {
  const type = String(notification.data?.notificationType ?? '').toLowerCase();
  const value = `${type} ${notification.title}`.toLowerCase();

  if (value.includes('escalat') || value.includes('alert')) {
    return {
      icon: AlertTriangle,
      background: 'bg-[#fff0f1]',
      foreground: 'text-[#e52e35]',
    };
  }
  if (value.includes('message') || value.includes('chat')) {
    return {
      icon: MessageSquare,
      background: 'bg-[#eef4ff]',
      foreground: 'text-[#316cf4]',
    };
  }
  return {
    icon: Bell,
    background: 'bg-[#f4efff]',
    foreground: 'text-primary',
  };
}

function groupNotifications(notifications: Notification[]) {
  const groups = new Map<string, Notification[]>();
  for (const notification of notifications) {
    const label = dateGroupLabel(notification.createdAt);
    groups.set(label, [...(groups.get(label) ?? []), notification]);
  }
  return Array.from(groups, ([label, items]) => ({ label, items }));
}

function dateGroupLabel(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(date);
}

function sameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatRelativeTime(value: string): string {
  const elapsedSeconds = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 1_000),
  );
  if (elapsedSeconds < 60) return 'Just now';
  if (elapsedSeconds < 3_600)
    return `${Math.floor(elapsedSeconds / 60)} min ago`;
  if (elapsedSeconds < 86_400)
    return `${Math.floor(elapsedSeconds / 3_600)} hr ago`;
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

function NotificationsLoading() {
  return (
    <div role="status" aria-label="Loading notifications">
      <div className="mb-4 h-4 w-16 animate-pulse rounded bg-[#efedf2]" />
      <div className="grid gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-[86px] items-center gap-4 rounded-2xl border border-[#e5e3e8] px-5 py-4"
          >
            <div className="size-2.5 animate-pulse rounded-full bg-[#e9e7ec]" />
            <div className="size-10 animate-pulse rounded-full bg-[#efedf2]" />
            <div className="flex-1">
              <div className="h-4 w-56 max-w-full animate-pulse rounded bg-[#e9e7ec]" />
              <div className="mt-2 h-3 w-80 max-w-full animate-pulse rounded bg-[#f0eef2]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
