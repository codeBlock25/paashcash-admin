import { forwardAuthRequest } from '@/lib/backend-api';

export async function POST(request: Request) {
  return forwardAuthRequest(request, 'forgot-password');
}
