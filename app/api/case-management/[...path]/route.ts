import { forwardBackendRequest } from '@/lib/backend-api';

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: Request, { params }: Context) {
  const { path } = await params;
  return forwardBackendRequest(
    request,
    `case-management/${path.map(encodeURIComponent).join('/')}`,
  );
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
