import { forwardBackendRequest } from '@/lib/backend-api';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  return forwardBackendRequest(
    request,
    `notifications/${encodeURIComponent(id)}/read`,
  );
}
