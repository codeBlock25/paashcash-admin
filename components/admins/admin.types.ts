export type AdminAccountType = 'admin' | 'admin_case_manager' | 'case_manager';

export type AdminListItem = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  accountType: AdminAccountType;
  roleLevel: 'admin_case_manager' | 'case_manager' | null;
  status: 'active' | 'inactive' | 'invited';
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type AdminsResponse = {
  items: AdminListItem[];
  meta: PaginationMeta;
  summary: { active: number; inactive: number };
};

export type ApiError = {
  errors?: Record<string, string>;
  message?: string | string[];
};

export function getApiErrorMessage(result: ApiError, fallback: string): string {
  if (result.errors?.root) return result.errors.root;
  return Array.isArray(result.message)
    ? result.message.join(' ')
    : result.message || fallback;
}
