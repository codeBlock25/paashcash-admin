import { forwardBackendRequest } from '@/lib/backend-api';

export async function POST(
  request: Request,
  context: RouteContext<'/api/visa-escrows/[id]/releases'>,
): Promise<Response> {
  const { id } = await context.params;
  return forwardBackendRequest(
    request,
    `visa-bookings/admin/escrows/${id}/releases`,
  );
}
