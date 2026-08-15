export type CasePriority = 'low' | 'normal' | 'high' | 'urgent';

export type ManagedCase = {
  id: string;
  bookingId: string;
  status: string;
  priority: CasePriority;
  slaDueAt: string | null;
  updatedAt: string;
  applicantName: string;
  agencyName: string;
  visaType: string | null;
  destinationCountryId: string | null;
  assignment: null | {
    id: string;
    managerAccountId: string;
    managerName: string | null;
    assignedAt: string;
  };
};

export type ManagedCaseDetail = ManagedCase & {
  applicant: { id: string; fullName: string; email: string };
  agency: { id: string; fullName: string; email: string };
  applicants: Record<string, unknown>[];
  conversations: CaseConversation[];
  escalations: CaseEscalation[];
  documentRequests: Array<{
    id: string;
    label: string;
    reason: string;
    status: string;
    createdAt: string;
  }>;
  documents: Array<{
    id: string;
    requestId: string | null;
    kind: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }>;
};

export type CaseManager = {
  id: string;
  fullName: string;
  email: string;
  accountType: 'case_manager' | 'admin_case_manager';
  status: 'active' | 'inactive';
  activeCases: number;
};

export type CaseConversation = {
  id: string;
  caseId: string;
  party: 'agency' | 'applicant';
  participant?: string;
  latestMessage?: CaseMessage | null;
  unread?: number;
};

export type CaseMessage = {
  id: string;
  conversationId: string;
  senderAccountId: string;
  body: string;
  createdAt: string;
};

export type CaseEscalation = {
  id: string;
  caseId: string;
  reason: string;
  priority: CasePriority;
  status: 'open' | 'in_review' | 'resolved';
  description: string;
  internalAction: string | null;
  raisedByAccountId: string;
  createdAt: string;
};

export async function readApi<T>(response: Response): Promise<T> {
  const result = (await response.json()) as T & { message?: string | string[] };
  if (!response.ok) {
    const message = result.message;
    throw new Error(
      Array.isArray(message) ? message.join(' ') : message || 'Request failed.',
    );
  }
  return result;
}
