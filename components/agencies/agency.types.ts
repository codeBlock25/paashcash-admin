export type AgencyApplicationStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected';

export type AgencyDocumentKey =
  | 'companyProfileImage'
  | 'businessRegistrationCertificate'
  | 'governmentLicense'
  | 'staffIdentityDocument';

export type AgencyApplication = {
  id: string;
  accountId?: string;
  account?: {
    email?: string;
    fullName?: string;
    phoneNumber?: string | null;
  };
  businessName?: string;
  brandName?: string;
  companyEmail?: string;
  supportPhoneNumber?: string;
  officeAddress?: string;
  city?: string;
  country?: string;
  companyLaunchDate?: string;
  preferences?: string[];
  corporateWebsiteUrl?: string | null;
  escrowPreference?: string | null;
  selectedPlan?: string | null;
  plan?: string | null;
  status: AgencyApplicationStatus | string;
  applicationStatus?: AgencyApplicationStatus | string;
  rejectionReason?: string | null;
  reviewReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: { fullName?: string; email?: string } | string | null;
  acceptedTermsVersion?: string | number | null;
  termsVersion?: string | number | null;
  termsAcceptedAt?: string | null;
  escrowAgreementAcceptedAt?: string | null;
  reviewerAccountId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  orderCount?: number | null;
  ordersCount?: number | null;
  rating?: number | null;
  earnings?: number | null;
  escrowBalance?: number | null;
  walletBalance?: number | null;
  withdrawalTotal?: number | null;
  visaHistory?: unknown[];
  documents?: Partial<Record<AgencyDocumentKey, boolean | object | string>>;
};

export type PaginationMeta = {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type AgencyApplicationListResponse = {
  items: AgencyApplication[];
  meta?: PaginationMeta;
};

export type ApiError = { message?: string | string[] };

export function apiErrorMessage(error: ApiError, fallback: string): string {
  return Array.isArray(error.message)
    ? error.message.join(' ')
    : error.message || fallback;
}

export function unwrapApplication(value: unknown): AgencyApplication {
  const response = value as {
    application?: AgencyApplication;
    item?: AgencyApplication;
  };
  return normalizeApplication(
    response.application ?? response.item ?? (value as AgencyApplication),
  );
}

export function normalizeApplicationList(
  value: unknown,
): AgencyApplicationListResponse {
  if (Array.isArray(value)) {
    return { items: (value as AgencyApplication[]).map(normalizeApplication) };
  }
  const response = value as {
    applications?: AgencyApplication[];
    data?: AgencyApplication[];
    items?: AgencyApplication[];
    meta?: PaginationMeta;
  };
  return {
    items: (response.items ?? response.applications ?? response.data ?? []).map(
      normalizeApplication,
    ),
    meta: response.meta,
  };
}

function normalizeApplication(
  application: AgencyApplication,
): AgencyApplication {
  return {
    ...application,
    status: application.status ?? application.applicationStatus ?? 'draft',
    termsAcceptedAt:
      application.termsAcceptedAt ?? application.escrowAgreementAcceptedAt,
    reviewedBy: application.reviewedBy ?? application.reviewerAccountId,
  };
}
