/**
 * Microbuild Hooks
 * 
 * Re-exports all React hooks.
 * This file is copied to your project and can be customized.
 */

// Relation hooks
export { useRelationM2M, type M2MRelationInfo } from './useRelationM2M';
export { useRelationM2MItems, type M2MItem, type M2MQueryParams } from './useRelationM2MItems';
export { useRelationM2O, useRelationM2OItem, type M2ORelationInfo, type M2OItem } from './useRelationM2O';
export { useRelationO2M, useRelationO2MItems, type O2MRelationInfo, type O2MItem, type O2MQueryParams } from './useRelationO2M';
export { 
  useRelationM2A, 
  useRelationM2AItems, 
  type M2ARelationInfo, 
  type M2AItem, 
  type M2AQueryParams
} from './useRelationM2A';

// File hooks
export { 
  useFiles, 
  type FileUpload, 
  type FileUploadOptions, 
  type DirectusFile 
} from './useFiles';

// API helpers
export { api, directusAPI, createDirectusAPI, type DirectusAPIConfig, type QueryParams } from './api';

// Re-export types for convenience
export type { 
  Relation, 
  RelationMeta, 
  RelationSchema, 
  RelationCollectionMeta, 
  RelationFieldInfo 
} from '@/lib/microbuild/types';

// Utility functions
export { apiRequest, isValidPrimaryKey } from './utils';
