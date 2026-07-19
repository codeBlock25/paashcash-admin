import { forwardBackendRequest } from '@/lib/backend-api';

type BannerRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: BannerRouteContext,
): Promise<Response> {
  const { id } = await context.params;
  return forwardBackendRequest(request, `banners/${encodeURIComponent(id)}`);
}

export async function PATCH(
  request: Request,
  context: BannerRouteContext,
): Promise<Response> {
  const { id } = await context.params;
  return forwardBackendRequest(request, `banners/${encodeURIComponent(id)}`);
}

export async function DELETE(
  request: Request,
  context: BannerRouteContext,
): Promise<Response> {
  const { id } = await context.params;
  return forwardBackendRequest(request, `banners/${encodeURIComponent(id)}`);
}
