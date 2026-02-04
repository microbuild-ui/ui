/**
 * Relations API Route
 * 
 * Proxies relation schema requests to the DaaS backend.
 * Required for M2O, M2M, O2M, and M2A relation components.
 * 
 * @microbuild/origin: api-routes/relations
 * @microbuild/version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, getDaasUrl } from '@/lib/api/auth-headers';

/**
 * GET /api/relations
 * Get all relation definitions
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    
    // Forward query parameters (e.g., filter by collection)
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${daasUrl}/api/relations${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ errors: [{ message: 'Request failed' }] }));
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Relations API error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}
