/**
 * API Request Helper
 * 
 * Makes requests to local API routes (server-side proxy to DaaS backend)
 */

/**
 * Make request to local API route
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  return response.json();
}
