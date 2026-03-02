/**
 * useRelationPermissionsM2A
 *
 * Port of the Directus useRelationPermissionsM2A composable.
 *
 * Checks **both** junction and related-collection permissions per CRUD operation
 * and returns per-collection permission maps consumed by the ListM2A component.
 *
 * Permission logic:
 * - createAllowed[collection] = junction.create AND related.create
 * - selectAllowed              = junction.create  (link existing = only needs junction row)
 * - updateAllowed[collection]  = junction.update AND related.update
 * - deleteAllowed[collection]  =
 *     if one_deselect_action === 'delete' → junction.delete
 *     else (nullify)                      → junction.update AND related.update
 */

import { useMemo } from 'react';
import { usePermissions, type PermissionAction } from './usePermissions';
import type { M2ARelationInfo } from './useRelationM2A';

/** Per-collection boolean map */
export type PerCollectionPermission = Record<string, boolean>;

export interface RelationPermissionsM2A {
  /** Whether user can create new items per related collection */
  createAllowed: PerCollectionPermission;
  /** Whether user can link existing items (only needs junction create) */
  selectAllowed: boolean;
  /** Whether user can edit items per related collection */
  updateAllowed: PerCollectionPermission;
  /** Whether user can remove/unlink items per related collection */
  deleteAllowed: PerCollectionPermission;
  /** Whether permissions are still loading */
  loading: boolean;
}

/**
 * Hook to compute M2A relation permissions following the Directus pattern.
 *
 * @param relationInfo – resolved M2ARelationInfo (null while loading)
 */
export function useRelationPermissionsM2A(
  relationInfo: M2ARelationInfo | null,
): RelationPermissionsM2A {
  // Collect all collections we need to check permissions for
  const junctionCollection = relationInfo?.junctionCollection.collection ?? null;
  const relatedCollections = useMemo(
    () => relationInfo?.allowedCollections.map((c) => c.collection) ?? [],
    [relationInfo?.allowedCollections],
  );

  // Build list of all collections to pre-fetch permissions for
  const allCollections = useMemo(() => {
    const cols: string[] = [];
    if (junctionCollection) cols.push(junctionCollection);
    cols.push(...relatedCollections);
    return cols;
  }, [junctionCollection, relatedCollections]);

  // Use the existing usePermissions hook to pre-fetch all needed collections
  const { canPerform, loading } = usePermissions({ collections: allCollections, autoFetch: true });

  // Helper: check permission for a collection + action
  const can = (collection: string | null, action: PermissionAction): boolean => {
    if (!collection) return false;
    return canPerform(collection, action);
  };

  // Determine the deselect action from the relation metadata
  const oneDeselectAction = relationInfo?.relation?.meta?.one_deselect_action ?? 'nullify';

  // Build per-collection permission maps
  const createAllowed = useMemo<PerCollectionPermission>(() => {
    const map: PerCollectionPermission = {};
    for (const coll of relatedCollections) {
      // Need junction.create AND related.create
      map[coll] = can(junctionCollection, 'create') && can(coll, 'create');
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedCollections, junctionCollection, loading]);

  const selectAllowed = useMemo<boolean>(() => {
    // Only needs junction.create to link existing items
    return can(junctionCollection, 'create');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [junctionCollection, loading]);

  const updateAllowed = useMemo<PerCollectionPermission>(() => {
    const map: PerCollectionPermission = {};
    for (const coll of relatedCollections) {
      // Need junction.update AND related.update
      map[coll] = can(junctionCollection, 'update') && can(coll, 'update');
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedCollections, junctionCollection, loading]);

  const deleteAllowed = useMemo<PerCollectionPermission>(() => {
    const map: PerCollectionPermission = {};
    for (const coll of relatedCollections) {
      if (oneDeselectAction === 'delete') {
        // Removing link deletes the junction row → only junction.delete needed
        map[coll] = can(junctionCollection, 'delete');
      } else {
        // Nullify → needs junction.update AND related.update
        map[coll] = can(junctionCollection, 'update') && can(coll, 'update');
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedCollections, junctionCollection, oneDeselectAction, loading]);

  return { createAllowed, selectAllowed, updateAllowed, deleteAllowed, loading };
}
