export type DashboardRange = 'all' | 'year' | 'month' | 'week';

export type CountMetric = {
  value: number;
  changePercentage: number | null;
};

export type MoneyMetric = {
  valueKobo: string;
  changePercentage: number | null;
};

export type AdminDashboard = {
  range: DashboardRange;
  overview: {
    registeredUsers: CountMetric;
    visaApplicants: CountMetric;
    agencies: CountMetric;
    caseManagers: CountMetric;
  };
  revenue: {
    totalPaid: MoneyMetric;
    heldInWallets: MoneyMetric;
    revenue: MoneyMetric;
    payingCustomers: CountMetric;
  };
  services: Array<{
    serviceType:
      | 'airtime'
      | 'data'
      | 'electricity'
      | 'cable-tv'
      | 'gift-card'
      | 'betting'
      | 'airtime-to-cash';
    orders: number;
    incomeKobo: string;
  }>;
  subscriptions: { free: number; premium: number };
};

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-NG').format(value);
}

export function formatNaira(valueKobo: string): string {
  const naira = Number(valueKobo) / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(naira) ? naira : 0);
}

export function formatChange(value: number | null): string {
  if (value === null) return '—';
  return `${value > 0 ? '+' : ''}${value}%`;
}
