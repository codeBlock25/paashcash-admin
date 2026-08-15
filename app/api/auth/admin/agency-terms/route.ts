import { forwardBackendRequest } from '@/lib/backend-api';

export function GET(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'auth/admin/agency-terms');
}

export function PUT(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'auth/admin/agency-terms');
}

export function PATCH(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'auth/admin/agency-terms');
}

export function POST(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'auth/admin/agency-terms');
}
