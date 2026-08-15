import { forwardBackendRequest } from '@/lib/backend-api';

type AgencyApplicationRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: AgencyApplicationRouteContext,
): Promise<Response> {
  const { id } = await context.params;
  return forwardBackendRequest(
    request,
    `auth/admin/agency-applications/${encodeURIComponent(id)}`,
  );
}
