/**
 * @microbuild/services
 * 
 * Shared service classes for Microbuild projects.
 * Directus-compatible CRUD services for items, fields, collections.
 * Authentication follows DaaS architecture with multiple auth methods.
 */

export { ItemsService, createItemsService } from './items';
export { FieldsService, createFieldsService } from './fields';
export { CollectionsService, createCollectionsService } from './collections';
export { PermissionsService, createPermissionsService, type FieldPermissions } from './permissions';
export { apiRequest, type ApiRequestOptions } from './api-request';

// DaaS Context Provider for direct API access (bypassing proxy routes)
// Includes authentication state management following DaaS architecture
export {
  DaaSProvider,
  useDaaSContext,
  useIsDirectDaaSMode,
  setGlobalDaaSConfig,
  getGlobalDaaSConfig,
  buildApiUrl,
  getApiHeaders,
  type DaaSConfig,
  type DaaSUser,
  type DaaSContextValue,
  type DaaSProviderProps,
} from './daas-context';

// Auth module - server-side authentication and authorization utilities
export {
  // Session management
  configureAuth,
  createAuthenticatedClient,
  getCurrentUser,
  isAdmin,
  getUserRole,
  getUserProfile,
  getAccountability,
  AuthenticationError,
  isAuthenticationError,
  type AuthClientConfig,
  type AuthenticatedClient,
  type AccountabilityInfo,
  // Permission enforcement
  enforcePermission,
  getAccessibleFields,
  getUserPermissions,
  validateFieldsAccess,
  filterFields,
  filterFieldsArray,
  filterResponseFields,
  isFieldAccessible,
  getPermissionFilters,
  PermissionError,
  type PermissionCheck,
  type PermissionDetails,
  // Filter utilities
  applyFilterToQuery,
  applyFilter,
  applyFieldOperators,
  resolveFilterDynamicValues,
  FILTER_OPERATORS,
  type FilterObject,
  type QueryBuilder,
} from './auth';
