import { useState, useEffect, useCallback } from 'react';
import { notifications } from '@mantine/notifications';

/**
 * Make API request helper
 */
async function apiRequest<T = unknown>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
    }

    return response.json();
}

interface CollectionMeta {
    display_template?: string;
    icon?: string;
    singleton?: boolean;
    [key: string]: unknown;
}

interface CollectionInfo {
    collection: string;
    meta?: CollectionMeta;
    name?: string;
    icon?: string;
}

interface FieldMeta {
    interface?: string;
    options?: Record<string, unknown>;
    [key: string]: unknown;
}

interface FieldInfo {
    field: string;
    type?: string;
    meta?: FieldMeta;
}

interface RelationMeta {
    id?: number;
    one_field?: string | null;
    one_collection?: string | null;
    one_allowed_collections?: string[] | null;
    many_collection?: string;
    many_field?: string;
    junction_field?: string | null;
    sort_field?: string | null;
    one_deselect_action?: string;
    [key: string]: unknown;
}

interface Relation {
    collection?: string;
    field?: string;
    related_collection?: string | null;
    meta?: RelationMeta;
    schema?: {
        table?: string;
        column?: string;
        foreign_key_table?: string;
        foreign_key_column?: string;
        constraint_name?: string | null;
        on_update?: string;
        on_delete?: string;
    };
}

/**
 * M2A Relation Info - Many-to-Any relationship metadata
 * 
 * M2A is like M2M but can link to MULTIPLE different collections.
 * 
 * Structure:
 * Parent Collection      Junction Table                    Related Collections (Any)
 * ┌─────────────┐        ┌──────────────────────────┐      ┌───────────────┐
 * │id           ├──┐     │id: junctionPKField       │  ┌───┤ Collection A  │
 * │m2a_field    │  └────►│parent_id: reverseJunction│  │   └───────────────┘
 * └─────────────┘        │collection: collectionField├──┤   ┌───────────────┐
 *                        │item: junctionField        │  ├───┤ Collection B  │
 *                        │sort: sortField            │  │   └───────────────┘
 *                        └──────────────────────────┘  │   ┌───────────────┐
 *                                                      └───┤ Collection C  │
 *                                                          └───────────────┘
 */
export interface M2ARelationInfo {
    /** Junction collection info */
    junctionCollection: {
        collection: string;
        meta?: CollectionMeta;
    };
    /** All allowed related collections */
    allowedCollections: CollectionInfo[];
    /** Field in junction table that stores the collection name */
    collectionField: {
        field: string;
        type: string;
    };
    /** Field in junction table that stores the related item ID/key */
    junctionField: {
        field: string;
        type: string;
    };
    /** Field in junction table that points to parent collection */
    reverseJunctionField: {
        field: string;
        type: string;
    };
    /** Primary key field of junction collection */
    junctionPrimaryKeyField: {
        field: string;
        type: string;
    };
    /** Primary key fields of each allowed collection */
    relationPrimaryKeyFields: Record<string, {
        field: string;
        type: string;
    }>;
    /** Sort field for ordering (optional) */
    sortField?: string;
    /** The relation metadata from junction to parent */
    relation: {
        field: string;
        collection: string;
        meta?: RelationMeta;
    };
}

/**
 * Custom hook for managing M2A (Many-to-Any) relationship information
 * 
 * Follows Directus useRelationM2A composable pattern.
 * 
 * M2A allows linking to multiple different collections through a junction table
 * that stores both the collection name and item ID.
 */
export function useRelationM2A(collection: string, field: string) {
    const [relationInfo, setRelationInfo] = useState<M2ARelationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRelationInfo = async () => {
            if (!collection || !field) {
                setRelationInfo(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Get field info to verify it's a list-m2a interface
                const fieldResponse = await apiRequest<{ data: FieldInfo[] }>(`/api/fields/${collection}`);
                const fieldInfo = fieldResponse.data || [];
                const currentField = fieldInfo.find((f) => f.field === field);

                if (!currentField?.meta?.interface || currentField.meta.interface !== 'list-m2a') {
                    setError(`Field "${field}" is not configured as a list-m2a interface`);
                    setRelationInfo(null);
                    setLoading(false);
                    return;
                }

                // Get all relations from API
                const relationsResponse = await apiRequest<{ data: Relation[] }>('/api/relations');
                const relations = relationsResponse.data || [];

                // Get all collections for metadata
                const collectionsResponse = await apiRequest<{ data: CollectionInfo[] }>('/api/collections');
                const collections = collectionsResponse.data || [];

                // Find the junction relation (relation where one_field === our field)
                let junction = relations.find((rel) =>
                    rel.related_collection === collection &&
                    rel.meta?.one_field === field &&
                    rel.meta?.one_allowed_collections
                );

                // Alternative: look for relation by meta.one_collection
                if (!junction) {
                    junction = relations.find((rel) =>
                        rel.meta?.one_collection === collection &&
                        rel.meta?.one_field === field &&
                        rel.meta?.one_allowed_collections
                    );
                }

                // FALLBACK: Try to build from field options
                if (!junction) {
                    const options = currentField.meta?.options as Record<string, unknown> | undefined;

                    if (options?.junction_collection && options?.allowed_collections) {
                        console.log('M2A: Using field options fallback for', collection, field, options);

                        const junctionCollection = options.junction_collection as string;
                        const allowedCollectionNames = options.allowed_collections as string[];
                        const collectionFieldName = (options.collection_field as string) || 'collection';
                        const junctionFieldName = (options.junction_field as string) || 'item';
                        const reverseJunctionFieldName = (options.reverse_junction_field as string) || `${collection}_id`;
                        const sortFieldName = (options.sort_field as string) || undefined;

                        // Build allowed collections info
                        const allowedCollections: CollectionInfo[] = allowedCollectionNames
                            .map(name => {
                                const collInfo = collections.find(c => c.collection === name);
                                return {
                                    collection: name,
                                    meta: collInfo?.meta || {},
                                    name: collInfo?.meta?.display_template || name,
                                    icon: collInfo?.meta?.icon || 'box',
                                };
                            })
                            .filter(c => c.meta?.singleton !== true); // Exclude singletons

                        // Build primary key fields map
                        const relationPrimaryKeyFields: Record<string, { field: string; type: string }> = {};
                        for (const coll of allowedCollectionNames) {
                            relationPrimaryKeyFields[coll] = { field: 'id', type: 'uuid' };
                        }

                        const info: M2ARelationInfo = {
                            junctionCollection: {
                                collection: junctionCollection,
                                meta: {},
                            },
                            allowedCollections,
                            collectionField: {
                                field: collectionFieldName,
                                type: 'string',
                            },
                            junctionField: {
                                field: junctionFieldName,
                                type: 'uuid',
                            },
                            reverseJunctionField: {
                                field: reverseJunctionFieldName,
                                type: 'uuid',
                            },
                            junctionPrimaryKeyField: {
                                field: 'id',
                                type: 'integer',
                            },
                            relationPrimaryKeyFields,
                            sortField: sortFieldName,
                            relation: {
                                field: reverseJunctionFieldName,
                                collection: junctionCollection,
                                meta: {},
                            },
                        };

                        console.log('M2A RelationInfo from options:', info);
                        setRelationInfo(info);
                        setLoading(false);
                        return;
                    }

                    console.error('M2A junction relation not found for', collection, field);
                    console.error('Field options:', currentField.meta?.options);
                    setError(`M2A relationship not configured. No junction relation found for field "${field}".`);
                    setRelationInfo(null);
                    setLoading(false);
                    return;
                }

                const junctionCollection = junction.collection;
                const allowedCollectionNames = junction.meta?.one_allowed_collections || [];

                if (!junctionCollection || allowedCollectionNames.length === 0) {
                    setError('Invalid M2A relation: missing junction collection or allowed collections');
                    setRelationInfo(null);
                    setLoading(false);
                    return;
                }

                // Get junction collection fields to determine field names
                const junctionFieldsResponse = await apiRequest<{ data: FieldInfo[] }>(`/api/fields/${junctionCollection}`);
                const junctionFields = junctionFieldsResponse.data || [];

                // Find the collection field (stores collection name)
                const collectionFieldInfo = junctionFields.find(f => 
                    f.field === 'collection' || 
                    f.type === 'string' && f.meta?.options?.['collection_field']
                ) || { field: 'collection', type: 'string' };

                // Find the item field (stores the related item ID)
                const itemFieldInfo = junctionFields.find(f =>
                    f.field === 'item' ||
                    f.meta?.interface === 'select-dropdown-m2o'
                ) || { field: 'item', type: 'uuid' };

                // Build allowed collections info
                const allowedCollections: CollectionInfo[] = allowedCollectionNames
                    .map((name: string) => {
                        const collInfo = collections.find(c => c.collection === name);
                        return {
                            collection: name,
                            meta: collInfo?.meta || {},
                            name: collInfo?.meta?.display_template || name,
                            icon: collInfo?.meta?.icon || 'box',
                        };
                    })
                    .filter(c => c.meta?.singleton !== true);

                // Build primary key fields map
                const relationPrimaryKeyFields: Record<string, { field: string; type: string }> = {};
                for (const name of allowedCollectionNames) {
                    // Could fetch actual PK from each collection, but default to 'id'
                    relationPrimaryKeyFields[name] = { field: 'id', type: 'uuid' };
                }

                const info: M2ARelationInfo = {
                    junctionCollection: {
                        collection: junctionCollection,
                        meta: {},
                    },
                    allowedCollections,
                    collectionField: {
                        field: collectionFieldInfo.field,
                        type: collectionFieldInfo.type || 'string',
                    },
                    junctionField: {
                        field: itemFieldInfo.field,
                        type: itemFieldInfo.type || 'uuid',
                    },
                    reverseJunctionField: {
                        field: junction.field || `${collection}_id`,
                        type: 'uuid',
                    },
                    junctionPrimaryKeyField: {
                        field: 'id',
                        type: 'integer',
                    },
                    relationPrimaryKeyFields,
                    sortField: junction.meta?.sort_field || undefined,
                    relation: {
                        field: junction.field || `${collection}_id`,
                        collection: junctionCollection,
                        meta: junction.meta || {},
                    },
                };

                console.log('M2A RelationInfo loaded:', info);
                setRelationInfo(info);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load relationship configuration';
                console.error('Error loading M2A relation:', err);
                setError(errorMessage);
                setRelationInfo(null);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load M2A relationship configuration',
                    color: 'red',
                });
            } finally {
                setLoading(false);
            }
        };

        loadRelationInfo();
    }, [collection, field]);

    return {
        relationInfo,
        loading,
        error,
    };
}

/**
 * M2A Item - a junction item in a Many-to-Any relationship
 */
export interface M2AItem {
    /** Primary key of the junction item */
    id: string | number;
    /** The collection name of the related item */
    collection?: string;
    /** The related item (nested data) or ID */
    item?: Record<string, unknown> | string | number;
    /** Sort order */
    sort?: number;
    /** Index for local items (not yet saved) */
    $index?: number;
    /** Item type: created, updated, deleted, staged */
    $type?: 'created' | 'updated' | 'deleted' | 'staged';
    /** Local edits */
    $edits?: Record<string, unknown>;
    /** Any other fields */
    [key: string]: unknown;
}

/**
 * Query parameters for loading M2A items
 */
export interface M2AQueryParams {
    limit?: number;
    page?: number;
    search?: string;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    fields?: string[];
    filter?: Record<string, unknown>;
}

/**
 * Custom hook for managing M2A relationship items (CRUD operations)
 * Similar to Directus useRelationMultiple composable
 */
export function useRelationM2AItems(
    relationInfo: M2ARelationInfo | null,
    parentPrimaryKey: string | number | null
) {
    const [items, setItems] = useState<M2AItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load items from the junction collection
    const loadItems = useCallback(async (params?: M2AQueryParams) => {
        if (!relationInfo || !parentPrimaryKey || parentPrimaryKey === '+') {
            setItems([]);
            setTotalCount(0);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Build query with filter for parent relationship
            const filter = {
                [relationInfo.reverseJunctionField.field]: {
                    _eq: parentPrimaryKey,
                },
            };

            // Build fields to request - include nested item data for each allowed collection
            let fieldsToFetch = ['*'];
            if (params?.fields) {
                fieldsToFetch = params.fields;
            } else {
                // Request nested data for all allowed collections
                // Format: item:collection_name.*
                const nestedFields = relationInfo.allowedCollections.map(
                    coll => `${relationInfo.junctionField.field}:${coll.collection}.*`
                );
                fieldsToFetch = ['*', ...nestedFields];
            }

            const queryParams = new URLSearchParams({
                filter: JSON.stringify(filter),
                fields: fieldsToFetch.join(','),
                limit: String(params?.limit || 15),
                page: String(params?.page || 1),
                meta: 'total_count,filter_count',
            });

            // Add sort
            if (params?.sortField) {
                queryParams.set('sort', params.sortDirection === 'desc' 
                    ? `-${params.sortField}` 
                    : params.sortField);
            } else if (relationInfo.sortField) {
                queryParams.set('sort', relationInfo.sortField);
            }

            // Add search
            if (params?.search) {
                queryParams.set('search', params.search);
            }

            const response = await fetch(
                `/api/items/${relationInfo.junctionCollection.collection}?${queryParams}`
            );

            if (!response.ok) {
                throw new Error(`Failed to load items: ${response.status}`);
            }

            const data = await response.json();
            setItems(data.data || []);
            setTotalCount(data.meta?.total_count || data.meta?.filter_count || data.data?.length || 0);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load related items';
            setError(errorMessage);
            setItems([]);
            setTotalCount(0);
            console.error('Error loading M2A items:', err);
        } finally {
            setLoading(false);
        }
    }, [relationInfo, parentPrimaryKey]);

    // Create a junction item linking to a specific collection's item
    const createItem = useCallback(async (
        targetCollection: string,
        itemId: string | number,
        additionalData?: Record<string, unknown>
    ): Promise<M2AItem | null> => {
        if (!relationInfo || !parentPrimaryKey) return null;

        try {
            const junctionData = {
                [relationInfo.reverseJunctionField.field]: parentPrimaryKey,
                [relationInfo.collectionField.field]: targetCollection,
                [relationInfo.junctionField.field]: itemId,
                ...additionalData,
            };

            // If sort field exists, get next sort value
            if (relationInfo.sortField) {
                const currentMaxSort = items.reduce((max, item) => {
                    const sortVal = item[relationInfo.sortField!];
                    return typeof sortVal === 'number' && sortVal > max ? sortVal : max;
                }, 0);
                junctionData[relationInfo.sortField] = currentMaxSort + 1;
            }

            const response = await fetch(`/api/items/${relationInfo.junctionCollection.collection}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(junctionData),
            });

            if (!response.ok) {
                throw new Error(`Failed to create junction item: ${response.status}`);
            }

            const result = await response.json();
            return result.data as M2AItem;
        } catch (err) {
            console.error('Error creating M2A junction item:', err);
            throw err;
        }
    }, [relationInfo, parentPrimaryKey, items]);

    // Remove a junction item (unlink)
    const removeItem = useCallback(async (item: M2AItem): Promise<void> => {
        if (!relationInfo) return;

        try {
            const response = await fetch(
                `/api/items/${relationInfo.junctionCollection.collection}/${item.id}`,
                { method: 'DELETE' }
            );

            if (!response.ok) {
                throw new Error(`Failed to remove junction item: ${response.status}`);
            }

            // Update local state
            setItems(prev => prev.filter(i => i.id !== item.id));
            setTotalCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error removing M2A junction item:', err);
            throw err;
        }
    }, [relationInfo]);

    // Select existing items from a specific collection
    const selectItems = useCallback(async (
        targetCollection: string,
        itemIds: (string | number)[]
    ): Promise<void> => {
        if (!relationInfo || !parentPrimaryKey) return;

        try {
            // Create junction items for each selected item
            await Promise.all(
                itemIds.map(itemId => createItem(targetCollection, itemId))
            );
        } catch (err) {
            console.error('Error selecting M2A items:', err);
            throw err;
        }
    }, [relationInfo, parentPrimaryKey, createItem]);

    // Reorder items (if sort field is configured)
    const reorderItems = useCallback(async (reorderedItems: M2AItem[]): Promise<void> => {
        if (!relationInfo?.sortField) return;

        try {
            // Update sort order for each item
            await Promise.all(
                reorderedItems.map((item, index) =>
                    fetch(`/api/items/${relationInfo.junctionCollection.collection}/${item.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ [relationInfo.sortField!]: index + 1 }),
                    })
                )
            );

            // Update local state
            setItems(reorderedItems);
        } catch (err) {
            console.error('Error reordering M2A items:', err);
            throw err;
        }
    }, [relationInfo]);

    // Move item up in order
    const moveItemUp = useCallback(async (index: number): Promise<void> => {
        if (index <= 0 || !relationInfo?.sortField) return;

        const newItems = [...items];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        await reorderItems(newItems);
    }, [items, relationInfo, reorderItems]);

    // Move item down in order
    const moveItemDown = useCallback(async (index: number): Promise<void> => {
        if (index >= items.length - 1 || !relationInfo?.sortField) return;

        const newItems = [...items];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        await reorderItems(newItems);
    }, [items, relationInfo, reorderItems]);

    // Get selected item IDs grouped by collection
    const getSelectedPrimaryKeysByCollection = useCallback((): Record<string, (string | number)[]> => {
        if (!relationInfo) return {};

        const result: Record<string, (string | number)[]> = {};
        
        for (const item of items) {
            const collectionName = item[relationInfo.collectionField.field] as string;
            if (!collectionName) continue;

            if (!result[collectionName]) {
                result[collectionName] = [];
            }

            const itemData = item[relationInfo.junctionField.field];
            if (typeof itemData === 'object' && itemData !== null) {
                const pkField = relationInfo.relationPrimaryKeyFields[collectionName]?.field || 'id';
                const pk = (itemData as Record<string, unknown>)[pkField];
                if (pk !== undefined) {
                    result[collectionName].push(pk as string | number);
                }
            } else if (itemData !== undefined) {
                result[collectionName].push(itemData as string | number);
            }
        }

        return result;
    }, [items, relationInfo]);

    return {
        items,
        totalCount,
        loading,
        error,
        loadItems,
        createItem,
        removeItem,
        selectItems,
        reorderItems,
        moveItemUp,
        moveItemDown,
        getSelectedPrimaryKeysByCollection,
        setItems,
    };
}
