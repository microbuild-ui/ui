/**
 * Auth Logout API Route (Proxy)
 * 
 * Proxies logout requests through the Next.js server.
 * Clears the Supabase session cookie server-side.
 * 
 * @microbuild/origin: api-routes/auth-logout
 * @microbuild/version: 1.0.0
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/logout
 * 
 * Signs out the current user and clears session cookies.
 */
export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        { errors: [{ message: error.message }] },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    console.error('Unexpected logout error:', error);
    return NextResponse.json(
      { errors: [{ message: 'Failed to logout' }] },
      { status: 500 }
    );
  }
}
