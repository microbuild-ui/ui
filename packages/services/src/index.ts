/**
 * @microbuild/services
 * 
 * Shared service classes for Microbuild projects.
 * Directus-compatible CRUD services for items, fields, collections.
 */

export { ItemsService, createItemsService } from './items';
export { FieldsService, createFieldsService } from './fields';
export { CollectionsService, createCollectionsService } from './collections';
export { PermissionsService, createPermissionsService, type FieldPermissions } from './permissions';
export { apiRequest, type ApiRequestOptions } from './api-request';

// DaaS Context Provider for direct API access (bypassing proxy routes)
export {
  DaaSProvider,
  useDaaSContext,
  useIsDirectDaaSMode,
  setGlobalDaaSConfig,
  getGlobalDaaSConfig,
  buildApiUrl,
  getApiHeaders,
  type DaaSConfig,
  type DaaSContextValue,
  type DaaSProviderProps,
} from './daas-context';
