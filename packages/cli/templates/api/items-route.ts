/**
 * Items Collection API Route
 * 
 * Proxies CRUD operations for collection items to the DaaS backend.
 * Supports DaaS-compatible query parameters.
 * 
 * @microbuild/origin: api-routes/items
 * @microbuild/version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, getDaasUrl } from '@/lib/api/auth-headers';

type RouteParams = { params: Promise<{ collection: string }> };

/**
 * GET /api/items/[collection]
 * List items with optional filtering, sorting, and pagination
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { collection } = await params;
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    
    // Forward all query parameters
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${daasUrl}/api/items/${collection}${searchParams ? `?${searchParams}` : ''}`;
    
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
    console.error('Items GET error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/items/[collection]
 * Create a new item
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { collection } = await params;
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    const body = await request.json();
    
    const response = await fetch(`${daasUrl}/api/items/${collection}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ errors: [{ message: 'Request failed' }] }));
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Items POST error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}
