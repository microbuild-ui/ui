/**
 * @microbuild/services/auth
 * 
 * Authentication and authorization utilities for DaaS applications.
 * Provides reusable session management, permission enforcement, and filter utilities.
 * 
 * @module @microbuild/services/auth
 */

export {
  // Configuration
  configureAuth,
  getAuthConfig,
  // Session management
  createAuthenticatedClient,
  getCurrentUser,
  isAdmin,
  getUserRole,
  getUserProfile,
  getAccountability,
  isAuthenticationError,
  // Error types
  AuthenticationError,
  // Types
  type AuthClientConfig,
  type AuthenticatedClient,
  type AccountabilityInfo,
} from './session';

export {
  enforcePermission,
  getAccessibleFields,
  getUserPermissions,
  validateFieldsAccess,
  filterFields,
  filterFieldsArray,
  filterResponseFields,
  isFieldAccessible,
  getPermissionFilters,
  applyFilterToQuery,
  resolveFilterDynamicValues,
  PermissionError,
  type PermissionCheck,
  type PermissionDetails,
  type FilterObject,
} from './enforcer';

export {
  applyFilter,
  applyFieldOperators,
  type QueryBuilder,
  FILTER_OPERATORS,
} from './filter-to-query';
