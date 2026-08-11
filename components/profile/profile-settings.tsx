'use client';

import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { useAdminAccount } from '@/components/dashboard/admin-account-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getAdminRoleLabel } from '@/lib/admin-account';

type Availability = 'available' | 'busy' | 'away';

const initialPreferences = {
  emailNotifications: true,
  inAppNotifications: true,
  newMessageAlerts: true,
  overdueCaseAlerts: true,
  availability: 'available' as Availability,
};

const availabilityOptions: Array<{
  value: Availability;
  label: string;
  dot: string;
}> = [
  { value: 'available', label: 'Available', dot: 'bg-[#18ad5a]' },
  { value: 'busy', label: 'Busy', dot: 'bg-[#f15a13]' },
  { value: 'away', label: 'Away', dot: 'bg-[#aaaab3]' },
];

export function ProfileSettings() {
  const account = useAdminAccount();
  const initialProfile = {
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    phone: account.phoneNumber ?? '',
    status: account.status,
    ...initialPreferences,
  };
  const [profile, setProfile] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  const role = getAdminRoleLabel(account);

  function updateField<Key extends keyof typeof profile>(
    field: Key,
    value: (typeof profile)[Key],
  ) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }

    setPhotoUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function saveChanges(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedProfile(profile);
    toast.success('Profile settings saved.');
  }

  function cancelChanges() {
    setProfile(savedProfile);
    toast.info('Unsaved changes discarded.');
  }

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-[#fafafa] p-4 sm:p-6 lg:p-8">
      <form
        onSubmit={saveChanges}
        className="mx-auto max-w-[1440px] rounded-2xl border border-[#e8e7eb] bg-white p-5 shadow-[0_2px_10px_rgba(24,20,38,0.025)] sm:p-7 lg:p-8"
      >
        <h2 className="border-b border-[#eeedf0] pb-5 text-[20px] font-medium tracking-[-0.02em] text-[#222126]">
          Profile Settings
        </h2>

        <div className="flex items-center gap-5 py-6">
          <div className="grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-[25px] font-medium text-white sm:size-[86px] sm:text-[28px]">
            {photoUrl || account.animoji?.imageUrl ? (
              // biome-ignore lint/performance/noImgElement: Local object URLs are not supported by next/image.
              <img
                src={photoUrl ?? account.animoji?.imageUrl}
                alt="Profile preview"
                className="size-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[14px] font-medium text-primary transition hover:text-[#7849e7]"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={() => {
                if (photoUrl) URL.revokeObjectURL(photoUrl);
                setPhotoUrl(undefined);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-[14px] font-medium text-[#797780] transition hover:text-[#2b2930]"
            >
              Remove
            </button>
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
          <ProfileField label="First Name" htmlFor="first-name">
            <Input
              id="first-name"
              value={profile.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
            />
          </ProfileField>
          <ProfileField label="Last Name" htmlFor="last-name">
            <Input
              id="last-name"
              value={profile.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
            />
          </ProfileField>
          <ProfileField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </ProfileField>
          <ProfileField label="Phone number" htmlFor="phone-number">
            <Input
              id="phone-number"
              type="tel"
              value={profile.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </ProfileField>
          <ProfileField label="Role" htmlFor="role">
            <Input
              id="role"
              value={role}
              disabled
              className="bg-[#f7f7f9] text-[#797780] opacity-100"
            />
          </ProfileField>
          <ProfileField label="Status" htmlFor="status">
            <div className="relative">
              <span
                className={`pointer-events-none absolute left-3.5 top-1/2 size-2.5 -translate-y-1/2 rounded-full ${
                  profile.status === 'active' ? 'bg-[#18ad5a]' : 'bg-[#aaaab3]'
                }`}
              />
              <select
                id="status"
                value={profile.status}
                onChange={(event) =>
                  updateField(
                    'status',
                    event.target.value as typeof profile.status,
                  )
                }
                className="h-10 w-full appearance-none rounded-lg border border-[#e7e7ea] bg-white pl-9 pr-10 text-sm text-[#292635] outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#727078]" />
            </div>
          </ProfileField>
        </div>

        <SettingsSection title="Notification Preferences">
          <NotificationRow
            title="Email notifications"
            description="Receive case updates via email"
            checked={profile.emailNotifications}
            onChange={(checked) => updateField('emailNotifications', checked)}
          />
          <NotificationRow
            title="In-app notifications"
            checked={profile.inAppNotifications}
            onChange={(checked) => updateField('inAppNotifications', checked)}
          />
          <NotificationRow
            title="New message alerts"
            checked={profile.newMessageAlerts}
            onChange={(checked) => updateField('newMessageAlerts', checked)}
          />
          <NotificationRow
            title="Overdue case alerts"
            checked={profile.overdueCaseAlerts}
            onChange={(checked) => updateField('overdueCaseAlerts', checked)}
          />
        </SettingsSection>

        <SettingsSection title="Availability">
          <div className="grid gap-3 py-5 sm:grid-cols-3">
            {availabilityOptions.map((option) => {
              const selected = profile.availability === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateField('availability', option.value)}
                  className={`flex h-[52px] items-center gap-3 rounded-xl border px-4 text-left text-[14px] font-medium transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 ${
                    selected
                      ? 'border-primary bg-[#f5f0ff] text-primary'
                      : 'border-[#e3e2e6] bg-white text-[#343239] hover:border-[#cfcbd6]'
                  }`}
                >
                  <span className={`size-2.5 rounded-full ${option.dot}`} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </SettingsSection>

        <div className="flex items-center justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={cancelChanges}
            className="px-5 text-[#333138]"
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" className="h-10 px-6">
            Save Changes
          </Button>
        </div>
      </form>
    </section>
  );
}

function ProfileField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-[13px]">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-7">
      <h3 className="border-b border-[#eeedf0] pb-4 text-[17px] font-medium text-[#252329]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function NotificationRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-5 border-b border-[#f0eff2] py-2.5">
      <div>
        <p className="text-[14px] text-[#3b393f]">{title}</p>
        {description ? (
          <p className="mt-0.5 text-[12px] text-[#8a8891]">{description}</p>
        ) : null}
      </div>
      <Switch checked={checked} aria-label={title} onCheckedChange={onChange} />
    </div>
  );
}
