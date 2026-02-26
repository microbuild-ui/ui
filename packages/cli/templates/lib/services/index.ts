/**
 * Microbuild Services
 *
 * Re-exports all service classes.
 * This file is copied to your project and can be customized.
 */

export { apiRequest, type ApiRequestOptions } from "./api-request";
export { CollectionsService, createCollectionsService } from "./collections";
export { FieldsService, createFieldsService } from "./fields";
export {
  PermissionsService,
  createPermissionsService,
  type CollectionAccess,
  type CollectionActionAccess,
  type FieldPermissions,
} from "./permissions";

// DaaS Context Provider for direct API access (bypassing proxy routes)
export {
  DaaSProvider,
  buildApiUrl,
  getApiHeaders,
  getGlobalDaaSConfig,
  setGlobalDaaSConfig,
  useDaaSContext,
  useIsDirectDaaSMode,
  type DaaSConfig,
  type DaaSContextValue,
  type DaaSProviderProps,
} from "./daas-context";
