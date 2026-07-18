import type * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-lg border border-[#e7e7ea] bg-white px-3 py-2 text-sm text-[#292635] shadow-[0_1px_1px_rgba(20,16,35,0.02)] outline-none transition-[border-color,box-shadow] placeholder:text-[#b8b6be] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
