import { forwardBackendRequest } from '@/lib/backend-api';

export function GET(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'visa-bookings/admin/escrows');
}
