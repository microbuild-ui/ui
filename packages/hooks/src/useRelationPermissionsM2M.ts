/**
 * useRelationPermissionsM2M
 *
 * Port of the DaaS useRelationPermissionsM2M composable.
 *
 * Checks **both** junction and related-collection permissions per CRUD operation.
 *
 * Permission logic (matches DaaS exactly):
 * - createAllowed = junction.create AND related.create
 * - selectAllowed = junction.create  (linking existing = only needs junction row)
 * - updateAllowed = junction.update AND related.update
 * - deleteAllowed =
 *     if one_deselect_action === 'delete' → junction.delete
 *     else (nullify)                      → junction.update
 *
 * @module @buildpad/hooks/useRelationPermissionsM2M
 */

import { useMemo } from 'react';
import { usePermissions, type PermissionAction } from './usePermissions';
import type { M2MRelationInfo } from './useRelationM2M';

export interface RelationPermissionsM2M {
    /** Whether user can create new related items */
    createAllowed: boolean;
    /** Whether user can link existing related items (only needs junction create) */
    selectAllowed: boolean;
    /** Whether user can edit related items */
    updateAllowed: boolean;
    /** Whether user can remove/unlink items */
    deleteAllowed: boolean;
    /** Whether permissions are still loading */
    loading: boolean;
}

/**
 * Hook to compute M2M relation permissions following the DaaS pattern.
 *
 * @param relationInfo - Resolved M2MRelationInfo (null while loading)
 */
export function useRelationPermissionsM2M(
    relationInfo: M2MRelationInfo | null,
): RelationPermissionsM2M {
    const junctionCollection = relationInfo?.junctionCollection.collection ?? null;
    const relatedCollection = relationInfo?.relatedCollection.collection ?? null;

    // Build list of all collections to pre-fetch permissions for
    const allCollections = useMemo(() => {
        const cols: string[] = [];
        if (junctionCollection) cols.push(junctionCollection);
        if (relatedCollection) cols.push(relatedCollection);
        return cols;
    }, [junctionCollection, relatedCollection]);

    const { canPerform, loading } = usePermissions({ collections: allCollections, autoFetch: true });

    // Helper
    const can = (collection: string | null, action: PermissionAction): boolean => {
        if (!collection) return false;
        return canPerform(collection, action);
    };

    // Determine the deselect action from the junction relation metadata
    const oneDeselectAction = relationInfo?.junction?.meta?.one_deselect_action ?? 'nullify';

    const createAllowed = useMemo<boolean>(() => {
        return can(junctionCollection, 'create') && can(relatedCollection, 'create');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [junctionCollection, relatedCollection, loading]);

    const selectAllowed = useMemo<boolean>(() => {
        return can(junctionCollection, 'create');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [junctionCollection, loading]);

    const updateAllowed = useMemo<boolean>(() => {
        return can(junctionCollection, 'update') && can(relatedCollection, 'update');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [junctionCollection, relatedCollection, loading]);

    const deleteAllowed = useMemo<boolean>(() => {
        if (oneDeselectAction === 'delete') {
            return can(junctionCollection, 'delete');
        }
        // nullify → only need junction.update
        return can(junctionCollection, 'update');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [junctionCollection, oneDeselectAction, loading]);

    return { createAllowed, selectAllowed, updateAllowed, deleteAllowed, loading };
}
