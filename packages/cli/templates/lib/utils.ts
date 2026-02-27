/**
 * Buildpad Utils - Barrel Export
 * 
 * This file re-exports all utilities from the utils folder.
 * It exists to support both import patterns:
 *   - import { cn } from '@/lib/microbuild/utils'     (folder import)
 *   - import { cn } from '@/lib/microbuild/utils.ts'  (file import)
 * 
 * @microbuild-origin lib/utils
 * @microbuild-version 1.0.0
 */

// Re-export everything from the utils folder
export * from './utils/index';
