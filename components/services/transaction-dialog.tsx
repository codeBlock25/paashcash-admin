'use client';

import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ServiceTransaction } from './service.types';

export function TransactionDialog({
  loading,
  onClose,
  open,
  transaction,
}: {
  loading: boolean;
  onClose: () => void;
  open: boolean;
  transaction: ServiceTransaction | null;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[600px] rounded-[22px] px-7 pb-8 pt-6 sm:px-14 sm:pb-9 sm:pt-8"
      >
        <button
          type="button"
          aria-label="Close transaction history"
          onClick={onClose}
          className="mx-auto grid size-14 place-items-center rounded-full bg-[#f2f2f3] text-[#a9a8ac] transition hover:bg-[#e9e8ea] hover:text-[#65636a] focus-visible:ring-3 focus-visible:ring-primary/20"
        >
          <X className="size-6" strokeWidth={1.8} />
        </button>

        <DialogTitle className="mt-9 text-center text-[25px] font-normal tracking-[-0.03em] sm:text-[28px]">
          Transaction History
        </DialogTitle>
        <DialogDescription className="sr-only">
          Full service transaction details
        </DialogDescription>

        {loading && !transaction ? <DialogLoading /> : null}
        {transaction ? <TransactionDetails transaction={transaction} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function TransactionDetails({
  transaction,
}: {
  transaction: ServiceTransaction;
}) {
  const date = new Date(transaction.createdAt);
  const rows = [
    ['Transaction', serviceLabel(transaction.serviceType)],
    ['Currency', transaction.currency],
    ['Status', statusLabel(transaction.status)],
    [
      'Transaction Value',
      formatMoney(transaction.totalKobo, transaction.currency),
    ],
    ['Fee', formatMoney(transaction.feeKobo, transaction.currency)],
    [
      'Credited Amount',
      formatMoney(transaction.amountKobo, transaction.currency),
    ],
    ['Transaction ID', transaction.reference],
  ] as const;

  return (
    <div className="mt-10">
      <dl>
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-5 border-b border-dashed border-[#dedde2] py-3.5 text-[15px] sm:text-[17px]"
          >
            <dt className="text-[#a6a4ad]">{label}</dt>
            <dd
              className={`break-words text-right ${label === 'Status' ? statusTextClass(transaction.status) : 'text-[#6e6c75]'}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {transaction.failureReason ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">
          {transaction.failureReason}
        </p>
      ) : null}

      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-[12px] text-[#a09ea5] sm:text-[13px]">
        <p>
          <span className="font-medium text-[#6f6c74]">Date:</span>{' '}
          {new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          }).format(date)}
        </p>
        <p>
          <span className="font-medium text-[#6f6c74]">Time:</span>{' '}
          {new Intl.DateTimeFormat('en-NG', {
            hour: 'numeric',
            minute: '2-digit',
          }).format(date)}
        </p>
      </div>
    </div>
  );
}

function DialogLoading() {
  return (
    <div
      className="mt-10 grid gap-3"
      role="status"
      aria-label="Loading transaction"
    >
      {Array.from({ length: 7 }, (_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded-md bg-[#f5f4f6]"
        />
      ))}
    </div>
  );
}

export function serviceLabel(serviceType: ServiceTransaction['serviceType']) {
  const labels: Record<ServiceTransaction['serviceType'], string> = {
    airtime: 'Airtime',
    data: 'Data',
    electricity: 'Electricity',
    'cable-tv': 'Cable TV',
    'gift-card': 'Gift Card',
    betting: 'Betting',
    'airtime-to-cash': 'Airtime to Cash',
  };
  return labels[serviceType];
}

export function statusLabel(status: ServiceTransaction['status']) {
  if (status === 'completed') return 'Successful';
  if (status === 'failed') return 'Declined';
  if (status === 'refunded') return 'Refunded';
  return 'Pending';
}

export function statusTextClass(status: ServiceTransaction['status']) {
  if (status === 'completed') return 'text-emerald-500';
  if (status === 'failed') return 'text-red-500';
  if (status === 'refunded') return 'text-blue-500';
  return 'text-amber-500';
}

function formatMoney(valueKobo: string, currency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(valueKobo) / 100);
}
