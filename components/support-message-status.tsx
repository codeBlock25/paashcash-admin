import { Check, CheckCheck, LoaderCircle } from 'lucide-react';
import type { ChatMessage } from '@/lib/support-messages';

export function SupportMessageStatus({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry: () => void;
}) {
  if (message.delivery === 'failed')
    return (
      <button
        type="button"
        onClick={onRetry}
        className="font-medium underline"
        aria-label="Retry failed message"
      >
        Not sent · Retry
      </button>
    );
  const label =
    message.delivery === 'sending'
      ? 'Sending…'
      : message.readAt
        ? 'Read'
        : 'Sent';
  const Icon =
    message.delivery === 'sending'
      ? LoaderCircle
      : message.readAt
        ? CheckCheck
        : Check;
  return (
    <span
      className={`relative inline-flex items-center gap-1 ${message.readAt ? 'text-sky-500' : ''}`}
      title={label}
    >
      <Icon
        aria-hidden="true"
        size={13}
        className={
          message.delivery === 'sending'
            ? 'animate-spin motion-reduce:animate-none'
            : ''
        }
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
