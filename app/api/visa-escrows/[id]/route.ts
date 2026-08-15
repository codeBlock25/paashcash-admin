import { forwardBackendRequest } from '@/lib/backend-api';

export async function GET(
  request: Request,
  context: RouteContext<'/api/visa-escrows/[id]'>,
): Promise<Response> {
  const { id } = await context.params;
  return forwardBackendRequest(request, `visa-bookings/admin/escrows/${id}`);
}
