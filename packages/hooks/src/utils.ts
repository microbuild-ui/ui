/**
 * Utility functions for hooks
 */

/**
 * Check if the primary key is valid for API operations
 * Returns false for new/unsaved items (primaryKey is "+" or null/undefined)
 */
export function isValidPrimaryKey(primaryKey: string | number | null | undefined): primaryKey is string | number {
  if (primaryKey === null || primaryKey === undefined) return false;
  if (primaryKey === '+' || primaryKey === '') return false;
  return true;
}

/**
 * Make API request helper
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
