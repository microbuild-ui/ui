/**
 * Files API Route
 * 
 * Proxies file operations to the DaaS backend.
 * Required for file upload components.
 * 
 * @buildpad/origin: api-routes/files
 * @buildpad/version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, getDaasUrl } from '@/lib/api/auth-headers';

/**
 * GET /api/files
 * List files with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    
    // Forward query parameters
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${daasUrl}/api/files${searchParams ? `?${searchParams}` : ''}`;
    
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
    console.error('Files GET error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/files
 * Upload a file
 */
export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    
    // Get the form data from the request
    const formData = await request.formData();
    
    // Remove Content-Type header to let fetch set it with boundary for multipart
    const { 'Content-Type': _, ...restHeaders } = headers as Record<string, string>;
    
    const response = await fetch(`${daasUrl}/api/files`, {
      method: 'POST',
      headers: restHeaders,
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ errors: [{ message: 'Upload failed' }] }));
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Files POST error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}
