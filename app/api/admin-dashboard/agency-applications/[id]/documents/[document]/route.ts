import { forwardBackendRequest } from '@/lib/backend-api';

type AgencyDocumentRouteContext = {
  params: Promise<{ document: string; id: string }>;
};

export async function GET(
  request: Request,
  context: AgencyDocumentRouteContext,
): Promise<Response> {
  const { document, id } = await context.params;
  return forwardBackendRequest(
    request,
    `auth/admin/agency-applications/${encodeURIComponent(id)}/documents/${encodeURIComponent(document)}`,
  );
}
