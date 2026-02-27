/**
 * Fields API Route
 * 
 * Proxies field schema requests to the DaaS backend.
 * Required for CollectionForm, VForm, and dynamic field rendering.
 * 
 * @buildpad/origin: api-routes/fields
 * @buildpad/version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, getDaasUrl } from '@/lib/api/auth-headers';

type RouteParams = { params: Promise<{ collection: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { collection } = await params;
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();
    
    const response = await fetch(`${daasUrl}/api/fields/${collection}`, {
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
    console.error('Fields API error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}
