import { forwardBackendRequest } from '@/lib/backend-api';

type AgencyTermsRouteContext = {
  params: Promise<{ path: string[] }>;
};

function endpoint(path: string[]): string {
  return `auth/admin/agency-terms/${path.map(encodeURIComponent).join('/')}`;
}

export async function GET(request: Request, context: AgencyTermsRouteContext) {
  return forwardBackendRequest(request, endpoint((await context.params).path));
}

export async function PUT(request: Request, context: AgencyTermsRouteContext) {
  return forwardBackendRequest(request, endpoint((await context.params).path));
}

export async function PATCH(
  request: Request,
  context: AgencyTermsRouteContext,
) {
  return forwardBackendRequest(request, endpoint((await context.params).path));
}

export async function POST(request: Request, context: AgencyTermsRouteContext) {
  return forwardBackendRequest(request, endpoint((await context.params).path));
}
