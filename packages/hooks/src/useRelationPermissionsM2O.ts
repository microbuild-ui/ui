/**
 * useRelationPermissionsM2O
 *
 * Port of the Directus useRelationPermissionsM2O composable.
 *
 * Checks related-collection permissions for the M2O interface.
 *
 * Permission logic (matches Directus exactly):
 * - createAllowed = related.create
 * - updateAllowed = related.update
 *
 * @module @buildpad/hooks/useRelationPermissionsM2O
 */

import { useMemo } from 'react';
import { usePermissions, type PermissionAction } from './usePermissions';
import type { M2ORelationInfo } from './useRelationM2O';

export interface RelationPermissionsM2O {
    /** Whether user can create new related items */
    createAllowed: boolean;
    /** Whether user can edit related items */
    updateAllowed: boolean;
    /** Whether permissions are still loading */
    loading: boolean;
}

/**
 * Hook to compute M2O relation permissions following the Directus pattern.
 *
 * @param relationInfo - Resolved M2ORelationInfo (null while loading)
 */
export function useRelationPermissionsM2O(
    relationInfo: M2ORelationInfo | null,
): RelationPermissionsM2O {
    const relatedCollection = relationInfo?.relatedCollection.collection ?? null;

    const allCollections = useMemo(() => {
        const cols: string[] = [];
        if (relatedCollection) cols.push(relatedCollection);
        return cols;
    }, [relatedCollection]);

    const { canPerform, loading } = usePermissions({ collections: allCollections, autoFetch: true });

    const can = (collection: string | null, action: PermissionAction): boolean => {
        if (!collection) return false;
        return canPerform(collection, action);
    };

    const createAllowed = useMemo<boolean>(() => {
        return can(relatedCollection, 'create');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [relatedCollection, loading]);

    const updateAllowed = useMemo<boolean>(() => {
        return can(relatedCollection, 'update');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [relatedCollection, loading]);

    return { createAllowed, updateAllowed, loading };
}
