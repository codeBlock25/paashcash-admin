import { forwardBackendRequest } from '@/lib/backend-api';

export async function PATCH(
  request: Request,
  context: RouteContext<'/api/visa-escrows/[id]/progress'>,
): Promise<Response> {
  const { id } = await context.params;
  return forwardBackendRequest(
    request,
    `visa-bookings/admin/escrows/${id}/progress`,
  );
}
