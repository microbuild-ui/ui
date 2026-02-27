/**
 * Single File API Route
 * 
 * Proxies single file operations to the DaaS backend.
 * 
 * @buildpad/origin: api-routes/files-id
 * @buildpad/version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, getDaasUrl } from '@/lib/api/auth-headers';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/files/[id]
 * Get file metadata by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    
    const response = await fetch(`${daasUrl}/api/files/${id}`, {
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
    console.error('Files GET by ID error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/files/[id]
 * Update file metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    const body = await request.json();
    
    const response = await fetch(`${daasUrl}/api/files/${id}`, {
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
    console.error('Files PATCH error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files/[id]
 * Delete a file
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    
    const response = await fetch(`${daasUrl}/api/files/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ errors: [{ message: 'Request failed' }] }));
      return NextResponse.json(error, { status: response.status });
    }
    
    return NextResponse.json({ data: null });
  } catch (error) {
    console.error('Files DELETE error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}
