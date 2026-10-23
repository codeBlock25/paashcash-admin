import { forwardBackendRequest } from '@/lib/backend-api';

export function GET(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'auth/admin/registration-policies');
}

export function POST(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'auth/admin/registration-policies');
}
