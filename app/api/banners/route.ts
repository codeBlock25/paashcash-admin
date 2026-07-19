import { forwardBackendRequest } from '@/lib/backend-api';

export function GET(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'banners');
}

export function POST(request: Request): Promise<Response> {
  return forwardBackendRequest(request, 'banners');
}
