/**
 * POST /api/disconnect
 *
 * Clears the DaaS config cookie.
 */

import { NextResponse } from 'next/server';
import { clearDaaSConfig } from '@/lib/cookie';

export async function POST() {
  await clearDaaSConfig();
  return NextResponse.json({ success: true });
}
