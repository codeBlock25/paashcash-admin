const DEFAULT_API_URL = 'http://localhost:6070';

const AUTH_COOKIE_NAMES = ['accessToken', 'refreshToken'] as const;

export type RefreshedSession = {
  cookieHeader: string;
  setCookies: string[];
};

const pendingRefreshes = new Map<
  string,
  { expiresAt: number; result: Promise<RefreshedSession | null> }
>();

export function getBackendApiUrl(): string {
  return (process.env.BACKEND_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');
}

function getSetCookies(response: Response): string[] {
  return response.headers.getSetCookie();
}

export function mergeResponseCookies(
  cookieHeader: string,
  setCookies: string[],
): string {
  const cookies = new Map<string, string>();

  for (const cookie of cookieHeader.split(';')) {
    const separator = cookie.indexOf('=');
    if (separator < 0) continue;
    cookies.set(
      cookie.slice(0, separator).trim(),
      cookie.slice(separator + 1).trim(),
    );
  }

  for (const setCookie of setCookies) {
    const cookie = setCookie.split(';', 1)[0];
    const separator = cookie.indexOf('=');
    if (separator < 0) continue;
    cookies.set(cookie.slice(0, separator).trim(), cookie.slice(separator + 1));
  }

  return [...cookies].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function requestRefreshedSession(
  cookieHeader: string,
): Promise<RefreshedSession | null> {
  if (!cookieHeader) return null;

  try {
    const response = await fetch(`${getBackendApiUrl()}/api/auth/refresh`, {
      cache: 'no-store',
      headers: { cookie: cookieHeader },
      method: 'POST',
    });
    if (!response.ok) return null;

    const setCookies = getSetCookies(response);
    if (setCookies.length === 0) return null;

    return {
      cookieHeader: mergeResponseCookies(cookieHeader, setCookies),
      setCookies,
    };
  } catch {
    return null;
  }
}

export function refreshBackendSession(
  cookieHeader: string,
): Promise<RefreshedSession | null> {
  const now = Date.now();
  for (const [key, refresh] of pendingRefreshes) {
    if (refresh.expiresAt <= now) pendingRefreshes.delete(key);
  }

  const pending = pendingRefreshes.get(cookieHeader);
  if (pending) return pending.result;

  const result = requestRefreshedSession(cookieHeader);
  pendingRefreshes.set(cookieHeader, { expiresAt: now + 5_000, result });
  return result;
}

export function clearAuthCookies(headers: Headers): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  for (const name of AUTH_COOKIE_NAMES) {
    headers.append(
      'set-cookie',
      `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure}`,
    );
  }
}

function terminalUnauthorizedResponse(): Response {
  const headers = new Headers({ 'content-type': 'application/json' });
  clearAuthCookies(headers);
  return Response.json(
    { message: 'Your session has expired. Please log in again.' },
    { headers, status: 401 },
  );
}

async function toClientResponse(
  response: Response,
  setCookies: string[] = [],
): Promise<Response> {
  const headers = new Headers({
    'content-type': response.headers.get('content-type') ?? 'application/json',
  });
  for (const cookie of setCookies) headers.append('set-cookie', cookie);

  return new Response(await response.arrayBuffer(), {
    headers,
    status: response.status,
  });
}

export async function forwardAuthRequest(
  request: Request,
  endpoint: string,
): Promise<Response> {
  const apiUrl = getBackendApiUrl();
  const body = await request.text();

  try {
    const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
      body,
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });

    const headers = new Headers({
      'content-type':
        response.headers.get('content-type') ?? 'application/json',
    });
    for (const cookie of response.headers.getSetCookie()) {
      headers.append('set-cookie', cookie);
    }

    return new Response(await response.text(), {
      headers,
      status: response.status,
    });
  } catch {
    return Response.json(
      { message: 'The authentication service is temporarily unavailable.' },
      { status: 503 },
    );
  }
}

export async function forwardBackendRequest(
  request: Request,
  endpoint: string,
  options: { refreshOnUnauthorized?: boolean } = {},
): Promise<Response> {
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const cookie = request.headers.get('cookie');
  if (contentType) headers.set('content-type', contentType);
  if (cookie) headers.set('cookie', cookie);

  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;
  const requestUrl = new URL(request.url);
  const backendUrl = new URL(
    `${getBackendApiUrl()}/api/${endpoint.replace(/^\/+/, '')}`,
  );
  backendUrl.search = requestUrl.search;

  try {
    let response = await fetch(backendUrl, {
      body,
      cache: 'no-store',
      headers,
      method,
    });

    if (response.status !== 401 || options.refreshOnUnauthorized === false) {
      return toClientResponse(response);
    }

    const refreshedSession = await refreshBackendSession(cookie ?? '');
    if (!refreshedSession) return terminalUnauthorizedResponse();

    headers.set('cookie', refreshedSession.cookieHeader);
    response = await fetch(backendUrl, {
      body,
      cache: 'no-store',
      headers,
      method,
    });

    if (response.status === 401) return terminalUnauthorizedResponse();
    return toClientResponse(response, refreshedSession.setCookies);
  } catch {
    return Response.json(
      { message: 'The backend service is temporarily unavailable.' },
      { status: 503 },
    );
  }
}
