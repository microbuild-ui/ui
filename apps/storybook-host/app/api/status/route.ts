/**
 * GET /api/status
 *
 * Returns the current DaaS connection status.
 * Called by Storybook stories to check if the host proxy is ready.
 */

import { NextResponse } from 'next/server';
import { getDaaSConfig } from '@/lib/cookie';

export async function GET() {
  const config = await getDaaSConfig();

  if (!config) {
    return NextResponse.json({
      connected: false,
      url: null,
      user: null,
    });
  }

  // Verify connection by fetching current user
  try {
    const response = await fetch(`${config.url}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({
        connected: true,
        url: config.url,
        user: null,
        error: `Auth failed: ${response.status}`,
      });
    }

    const userData = await response.json();

    return NextResponse.json({
      connected: true,
      url: config.url,
      user: userData.data || userData,
    });
  } catch (error) {
    return NextResponse.json({
      connected: true,
      url: config.url,
      user: null,
      error: error instanceof Error ? error.message : 'Connection error',
    });
  }
}
