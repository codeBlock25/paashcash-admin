import { forwardBackendRequest } from '@/lib/backend-api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  return forwardBackendRequest(
    request,
    `services/admin/purchases/${encodeURIComponent(id)}`,
  );
}
