/**
 * Items Single Item API Route
 * 
 * Proxies single item CRUD operations to the DaaS backend.
 * 
 * @buildpad/origin: api-routes/items-id
 * @buildpad/version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, getDaasUrl } from '@/lib/api/auth-headers';

type RouteParams = { params: Promise<{ collection: string; id: string }> };

/**
 * GET /api/items/[collection]/[id]
 * Get a single item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { collection, id } = await params;
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    
    // Forward query parameters (e.g., fields)
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${daasUrl}/api/items/${collection}/${id}${searchParams ? `?${searchParams}` : ''}`;
    
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
    console.error('Items GET by ID error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/items/[collection]/[id]
 * Update an existing item
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { collection, id } = await params;
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    const body = await request.json();
    
    const response = await fetch(`${daasUrl}/api/items/${collection}/${id}`, {
      method: 'PATCH',
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
    console.error('Items PATCH error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/items/[collection]/[id]
 * Delete an item
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { collection, id } = await params;
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    
    const response = await fetch(`${daasUrl}/api/items/${collection}/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ errors: [{ message: 'Request failed' }] }));
      return NextResponse.json(error, { status: response.status });
    }
    
    return NextResponse.json({ data: null });
  } catch (error) {
    console.error('Items DELETE error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}
