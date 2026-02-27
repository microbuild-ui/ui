/**
 * Auth Login API Route (Proxy)
 * 
 * Proxies login requests to the DaaS backend.
 * This ensures no CORS issues because the browser only talks to the same-origin Next.js server.
 * 
 * Pattern: Browser → Next.js API Route → DaaS Backend → Supabase Auth
 * 
 * @buildpad/origin: api-routes/auth-login
 * @buildpad/version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/login
 * 
 * Authenticates user with email/password via Supabase Auth.
 * The session cookie is set server-side, avoiding CORS issues.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { errors: [{ message: 'Email and password are required' }] },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { errors: [{ message: error.message }] },
        { status: 401 }
      );
    }

    return NextResponse.json({
      data: {
        user: data.user,
        session: {
          access_token: data.session?.access_token,
          expires_at: data.session?.expires_at,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Login failed' }] },
      { status: 500 }
    );
  }
}
