import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
};

export function AgencyStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset',
        statusStyles[normalized] ??
          'bg-slate-100 text-slate-700 ring-slate-200',
      )}
    >
      {normalized.replaceAll('_', ' ')}
    </span>
  );
}
