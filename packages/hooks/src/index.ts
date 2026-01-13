/**
 * @microbuild/hooks
 * 
 * Shared React hooks for Microbuild projects.
 * Directus-compatible relation hooks for M2M, M2O, O2M relationships.
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

// Selection & Preset hooks
export { 
    useSelection, 
    type UseSelectionOptions, 
    type UseSelectionReturn 
} from './useSelection';
export { 
    usePreset, 
    type UsePresetOptions, 
    type UsePresetReturn,
    type Filter,
    type Query
} from './usePreset';

// Navigation guard hooks (Directus-style)
export { 
    useEditsGuard, 
    useHasEdits,
    type UseEditsGuardOptions, 
    type UseEditsGuardReturn 
} from './useEditsGuard';

// Clipboard and Storage hooks (Directus-style)
export {
    useClipboard,
    type UseClipboardOptions,
    type UseClipboardReturn
} from './useClipboard';
export {
    useLocalStorage,
    type LocalStorageValue,
    type UseLocalStorageOptions,
    type UseLocalStorageReturn
} from './useLocalStorage';

// API helpers
export { api, directusAPI, createDirectusAPI, type DirectusAPIConfig, type QueryParams } from './api';

// Re-export types for convenience
export type { Relation, RelationMeta, RelationSchema, RelationCollectionMeta, RelationFieldInfo } from '@microbuild/types';

// Utility functions
export { apiRequest, isValidPrimaryKey } from './utils';
