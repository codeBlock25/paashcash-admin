import { forwardBackendRequest } from '@/lib/backend-api';

export function POST(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'admins/accept-invitation', {
    refreshOnUnauthorized: false,
  });
}
