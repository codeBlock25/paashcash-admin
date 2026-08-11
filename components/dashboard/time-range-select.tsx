'use client';

import { Select } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import type { DashboardRange } from '@/components/dashboard/dashboard-types';

const ranges: Array<{ label: string; value: DashboardRange }> = [
  { label: 'All Time', value: 'all' },
  { label: 'This Year', value: 'year' },
  { label: 'This Month', value: 'month' },
  { label: 'This Week', value: 'week' },
];

export function TimeRangeSelect({
  value,
  action,
}: {
  value: DashboardRange;
  action: (value: DashboardRange) => void;
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) action(nextValue);
      }}
      items={ranges}
    >
      <Select.Trigger
        aria-label="Dashboard time range"
        className="flex h-10 min-w-36 items-center justify-between gap-3 rounded-lg border bg-white px-3 text-[13px] font-medium text-[#45444a] shadow-xs outline-none transition hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="size-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} align="end" className="z-60">
          <Select.Popup className="min-w-36 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg outline-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
            {ranges.map((range) => (
              <Select.Item
                key={range.value}
                value={range.value}
                className="grid cursor-default grid-cols-[1fr_16px] items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none data-[highlighted]:bg-muted"
              >
                <Select.ItemText>{range.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="size-3.5 text-primary" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
