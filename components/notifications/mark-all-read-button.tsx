'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import { cn } from '@/lib/utils';

export const notificationsReadAllEvent = 'paash:notifications-read-all';

type MarkAllReadButtonProps = {
  className?: string;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
};

export function MarkAllReadButton({
  className,
  disabled = false,
  compact = false,
  label = 'Mark all read',
}: MarkAllReadButtonProps) {
  const [pending, setPending] = useState(false);

  async function markAllRead() {
    setPending(true);
    try {
      const response = await authenticatedFetch('/api/notifications/read-all', {
        method: 'PATCH',
      });
      const result = (await response.json()) as {
        message?: string | string[];
        updatedCount?: number;
      };

      if (!response.ok) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(' ')
            : result.message || 'Unable to mark notifications as read.',
        );
      }

      window.dispatchEvent(
        new CustomEvent(notificationsReadAllEvent, {
          detail: { updatedCount: result.updatedCount ?? 0 },
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to mark notifications as read.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={compact ? 'ghost' : 'default'}
      disabled={disabled || pending}
      onClick={markAllRead}
      className={cn(
        compact
          ? 'h-auto px-0 text-[13px] font-medium text-primary hover:bg-transparent hover:text-primary/80'
          : 'h-10 px-5',
        className,
      )}
    >
      {pending ? 'Marking as read…' : label}
    </Button>
  );
}
