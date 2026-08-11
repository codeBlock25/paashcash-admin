import { forwardBackendRequest } from '@/lib/backend-api';

export function PATCH(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'notifications/read-all');
}
