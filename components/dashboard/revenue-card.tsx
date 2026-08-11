import { Card } from '@/components/ui/card';

export function RevenueCard({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change: string;
}) {
  return (
    <Card className="min-h-32 p-5 shadow-none">
      <p className="text-[13px] text-[#74737b]">{title}</p>
      <p className="mt-5 text-[23px] font-medium leading-7 tracking-[-0.025em] text-[#29282d]">
        {value}
      </p>
      <p className="mt-1 text-[12px] text-[#77767e]">
        {change === '—'
          ? 'No prior-period comparison'
          : `${change} from the previous period`}
      </p>
    </Card>
  );
}
