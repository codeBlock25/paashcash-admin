const DEFAULT_API_URL = 'http://localhost:6070';

export function getBackendApiUrl(): string {
  return (process.env.BACKEND_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');
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
): Promise<Response> {
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const cookie = request.headers.get('cookie');
  if (contentType) headers.set('content-type', contentType);
  if (cookie) headers.set('cookie', cookie);

  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const requestUrl = new URL(request.url);
  const backendUrl = new URL(
    `${getBackendApiUrl()}/api/${endpoint.replace(/^\/+/, '')}`,
  );
  backendUrl.search = requestUrl.search;

  try {
    const response = await fetch(backendUrl, {
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      headers,
      method,
    });

    return new Response(await response.arrayBuffer(), {
      headers: {
        'content-type':
          response.headers.get('content-type') ?? 'application/json',
      },
      status: response.status,
    });
  } catch {
    return Response.json(
      { message: 'The backend service is temporarily unavailable.' },
      { status: 503 },
    );
  }
}
