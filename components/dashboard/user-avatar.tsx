import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';

import { Avatar } from '@/components/ui/avatar';

export function UserAvatar({
  firstName,
  imageUrl,
  lastName,
  size = 'md',
}: {
  firstName: string;
  imageUrl?: string | null;
  lastName: string;
  size?: 'sm' | 'md';
}) {
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <Avatar
      aria-label={fullName}
      className={`${size === 'sm' ? 'size-10' : 'size-11'} border border-primary/20 bg-primary`}
    >
      {imageUrl ? (
        <AvatarPrimitive.Image
          src={imageUrl}
          alt=""
          className="size-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback className="grid size-full place-items-center text-[12px] font-medium text-white">
        {initials}
      </AvatarPrimitive.Fallback>
    </Avatar>
  );
}
