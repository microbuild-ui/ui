/**
 * Microbuild Services
 * 
 * Re-exports all service classes.
 * This file is copied to your project and can be customized.
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
