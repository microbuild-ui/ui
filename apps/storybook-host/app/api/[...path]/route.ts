/**
 * DaaS Catch-All Proxy Route
 *
 * Proxies any /api/* request to the configured DaaS backend.
 * Reads the DaaS URL and token from an encrypted httpOnly cookie
 * set by the /api/connect endpoint.
 *
 * This is the key piece that eliminates CORS issues — the browser
 * talks to the same origin and this server-side route forwards
 * the request with the Bearer token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDaaSConfig } from '@/lib/cookie';

type RouteParams = { params: Promise<{ path: string[] }> };

async function proxyToDaaS(
  request: NextRequest,
  { params }: RouteParams
) {
  const config = await getDaaSConfig();

  if (!config) {
    return NextResponse.json(
      {
        errors: [
          {
            message:
              'Not connected to DaaS. Configure your connection at the settings page.',
          },
        ],
      },
      { status: 401 }
    );
  }

  const { path } = await params;
  const daasPath = `/api/${path.join('/')}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${config.url}${daasPath}${searchParams ? `?${searchParams}` : ''}`;

  // Build headers — inject Bearer token
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.token}`,
  };

  // Forward content-type if present
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  // Build fetch options
  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  // Forward body for non-GET/HEAD requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const body = await request.arrayBuffer();
      if (body.byteLength > 0) {
        fetchOptions.body = body;
      }
    } catch {
      // No body — that's fine
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/json',
        ...(response.headers.get('Cache-Control') && {
          'Cache-Control': response.headers.get('Cache-Control')!,
        }),
      },
    });
  } catch (error) {
    console.error('[DaaS Proxy] Error:', error);
    return NextResponse.json(
      {
        errors: [
          {
            message:
              error instanceof Error ? error.message : 'Proxy request failed',
          },
        ],
      },
      { status: 502 }
    );
  }
}

export const GET = proxyToDaaS;
export const POST = proxyToDaaS;
export const PATCH = proxyToDaaS;
export const PUT = proxyToDaaS;
export const DELETE = proxyToDaaS;
