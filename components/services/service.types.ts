export type ServiceType =
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'cable-tv'
  | 'gift-card'
  | 'betting'
  | 'airtime-to-cash';

export type TransactionStatus =
  | 'created'
  | 'payment-approved'
  | 'submitted-to-provider'
  | 'provider-processing'
  | 'completed'
  | 'failed'
  | 'refund-pending'
  | 'refunded';

export type ServiceTransaction = {
  id: string;
  reference: string;
  serviceType: ServiceType;
  status: TransactionStatus;
  paymentStatus: 'pending' | 'approved' | 'refunded';
  providerCode: string;
  providerReference: string | null;
  productCode: string;
  customerIdentifier: string;
  amountKobo: string;
  feeKobo: string;
  discountKobo: string;
  totalKobo: string;
  currency: string;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string | null;
  };
};

export type PaginationMeta = {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type ServicesResponse = {
  items: ServiceTransaction[];
  meta: PaginationMeta;
};

export type ApiError = { message?: string | string[] };
