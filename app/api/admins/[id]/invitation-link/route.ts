import { forwardBackendRequest } from '@/lib/backend-api';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  return forwardBackendRequest(
    request,
    `admins/${encodeURIComponent(id)}/invitation-link`,
  );
}
