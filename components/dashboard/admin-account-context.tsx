'use client';

import { createContext, useContext } from 'react';

import type { AdminAccount } from '@/lib/admin-session';

const AdminAccountContext = createContext<AdminAccount | null>(null);

export function AdminAccountProvider({
  account,
  children,
}: {
  account: AdminAccount;
  children: React.ReactNode;
}) {
  return (
    <AdminAccountContext.Provider value={account}>
      {children}
    </AdminAccountContext.Provider>
  );
}

export function useAdminAccount() {
  const account = useContext(AdminAccountContext);
  if (!account) {
    throw new Error(
      'useAdminAccount must be used within AdminAccountProvider.',
    );
  }
  return account;
}
