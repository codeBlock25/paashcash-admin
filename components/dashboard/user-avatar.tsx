import { Avatar } from '@/components/ui/avatar';

export function UserAvatar({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <Avatar
      aria-label="Joshua Adenuga"
      className={`${size === 'sm' ? 'size-10' : 'size-11'} profile-avatar border border-[#f3a14d]`}
    />
  );
}
