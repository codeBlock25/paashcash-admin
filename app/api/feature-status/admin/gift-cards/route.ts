import { forwardBackendRequest } from '@/lib/backend-api';

export function GET(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'feature-status/admin/gift-cards');
}

export function PATCH(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'feature-status/admin/gift-cards');
}
