import type { ComponentProps } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AuthField({
  id,
  label,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} aria-label={label} aria-labelledby={id} />
    </div>
  );
}
