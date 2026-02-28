/**
 * API Auth Headers Helper
 * 
 * Forwards authentication tokens from Supabase session to DaaS backend.
 * This file is copied to your project by the Buildpad CLI.
 * 
 * @buildpad/origin: api-routes/auth-headers
 * @buildpad/version: 1.0.0
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Get authentication headers for DaaS API requests
 * Extracts the access token from the current Supabase session
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

/**
 * Get the DaaS backend URL from environment
 */
export function getDaasUrl(): string {
  const url = process.env.NEXT_PUBLIC_BUILDPAD_DAAS_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_BUILDPAD_DAAS_URL is not configured in .env.local');
  }
  return url;
}

/**
 * Make an authenticated request to the DaaS backend
 */
export async function daasRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const baseUrl = getDaasUrl();
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || `Request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { data: data.data ?? data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
