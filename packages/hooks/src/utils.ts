/**
 * Utility functions for hooks
 */

// Re-export apiRequest from services which respects DaaS configuration
// This ensures hooks work in both Next.js (proxy mode) and Storybook (direct mode)
export { apiRequest } from '@microbuild/services';

/**
 * Check if the primary key is valid for API operations
 * Returns false for new/unsaved items (primaryKey is "+" or null/undefined)
 */
export function isValidPrimaryKey(primaryKey: string | number | null | undefined): primaryKey is string | number {
  if (primaryKey === null || primaryKey === undefined) return false;
  if (primaryKey === '+' || primaryKey === '') return false;
  return true;
}
