import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  clearAuthCookies,
  getBackendApiUrl,
  refreshBackendSession,
} from '@/lib/backend-api';

function redirectToLogin(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL('/auth/login', request.url));
  clearAuthCookies(response.headers);
  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  if (!cookieHeader) return redirectToLogin(request);

  try {
    let profileResponse = await fetch(
      `${getBackendApiUrl()}/api/auth/profile`,
      { cache: 'no-store', headers: { cookie: cookieHeader } },
    );

    if (profileResponse.status !== 401) return NextResponse.next();

    const refreshedSession = await refreshBackendSession(cookieHeader);
    if (!refreshedSession) return redirectToLogin(request);

    profileResponse = await fetch(`${getBackendApiUrl()}/api/auth/profile`, {
      cache: 'no-store',
      headers: { cookie: refreshedSession.cookieHeader },
    });
    if (profileResponse.status === 401) return redirectToLogin(request);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('cookie', refreshedSession.cookieHeader);
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    for (const cookie of refreshedSession.setCookies) {
      response.headers.append('set-cookie', cookie);
    }
    return response;
  } catch {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: '/dashboard/:path*',
};
