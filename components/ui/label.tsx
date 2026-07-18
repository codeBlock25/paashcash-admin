import type * as React from 'react';

import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // This wrapper receives htmlFor from every call site; Biome cannot infer it through props.
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is forwarded to the native label.
    <label
      data-slot="label"
      className={cn(
        'text-xs font-medium leading-none text-[#272432]',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
