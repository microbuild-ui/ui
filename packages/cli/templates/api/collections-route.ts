/**
 * Collections API Route
 *
 * Proxies collection metadata requests to the DaaS backend.
 * Required for ContentNavigation and useCollections hook.
 *
 * @microbuild/origin: api-routes/collections
 * @microbuild/version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, getDaasUrl } from '@/lib/api/auth-headers';

/**
 * GET /api/collections
 * List all collections the current user has access to
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();

    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${daasUrl}/api/collections${searchParams ? `?${searchParams}` : ''}`;

    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        errors: [{ message: 'Request failed' }],
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Collections API error:', error);
    return NextResponse.json(
      {
        errors: [
          {
            message:
              error instanceof Error ? error.message : 'Internal server error',
          },
        ],
      },
      { status: 500 }
    );
  }
}
