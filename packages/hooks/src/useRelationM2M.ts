import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import type { Field, Relation as BaseRelation, RelationMeta as BaseRelationMeta } from '@microbuild/types';
import { apiRequest } from './utils';

interface CollectionMeta {
  display_template?: string;
  [key: string]: unknown;
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

interface RelationMeta extends BaseRelationMeta {
  id?: number;
  one_field?: string | null;
  one_collection?: string | null;
  many_collection?: string;
  many_field?: string;
  junction_field?: string | null;
  sort_field?: string | null;
  one_deselect_action?: string;
}

interface Relation extends BaseRelation {
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

export interface M2MRelationInfo {
  junctionCollection: {
    collection: string;
    meta: CollectionMeta;
  };
  relatedCollection: {
    collection: string;
    meta: CollectionMeta;
  };
  junctionField: {
    field: string;
    type: string;
  };
  reverseJunctionField: {
    field: string;
    type: string;
  };
  relatedPrimaryKeyField: {
    field: string;
    type: string;
  };
  junctionPrimaryKeyField: {
    field: string;
    type: string;
  };
  sortField?: string;
  relation: {
    field: string;
    collection: string;
    related_collection: string;
    meta: RelationMeta;
  };
  junction: Relation;
}

/**
 * Custom hook for managing M2M (Many-to-Many) relationship information
 * 
 * Follows Directus useRelationM2M composable pattern:
 * 
 * One1 (current)      Junction Table                  One2 (related)
 * ┌─────────┐         ┌─────────────────────────┐     ┌─────────────────┐
 * │id       ├───┐     │id: junctionPKField      │ ┌───┤id: relatedPKField
 * │many     │   └────►│one1_id: reverseJunction │ │   │                 │
 * └─────────┘         │one2_id: junctionField   ├─┘   └─────────────────┘
 *                     │sort: sortField          │
 *                     └─────────────────────────┘
 */
export function useRelationM2M(collection: string, field: string) {
  const [relationInfo, setRelationInfo] = useState<M2MRelationInfo | null>(null);
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
        
        // Get field info to verify it's a list-m2m interface
        const fieldResponse = await apiRequest<{ data: FieldInfo[] }>(`/api/fields/${collection}`);
        const fieldInfo = fieldResponse.data || [];
        const currentField = fieldInfo.find((f) => f.field === field);
        
        if (!currentField?.meta?.interface || currentField.meta.interface !== 'list-m2m') {
          setError(`Field "${field}" is not configured as a list-m2m interface`);
          setRelationInfo(null);
          setLoading(false);
          return;
        }

        // Get all relations from API
        const relationsResponse = await apiRequest<{ data: Relation[] }>('/api/relations');
        const relations = relationsResponse.data || [];
        
        // Step 1: Find the "junction" relation 
        let junction = relations.find((rel) =>
          rel.related_collection === collection &&
          rel.meta?.one_field === field &&
          rel.meta?.junction_field
        );

        // Alternative: look for relation by meta.one_collection
        if (!junction) {
          junction = relations.find((rel) =>
            rel.meta?.one_collection === collection &&
            rel.meta?.one_field === field &&
            rel.meta?.junction_field
          );
        }
        
        // FALLBACK: Build from field options if no relation entry exists
        if (!junction) {
          const options = currentField.meta?.options as Record<string, unknown> | undefined;
          
          if (options?.junction_collection && options?.related_collection) {
            const junctionCollection = options.junction_collection as string;
            const relatedCollection = options.related_collection as string;
            const junctionFieldCurrent = (options.junction_field_current as string) || `${collection}_id`;
            const junctionFieldRelated = (options.junction_field_related as string) || `${relatedCollection}_id`;
            
            const info: M2MRelationInfo = {
              junctionCollection: {
                collection: junctionCollection,
                meta: {}
              },
              relatedCollection: {
                collection: relatedCollection,
                meta: {}
              },
              junctionField: {
                field: junctionFieldRelated,
                type: 'uuid'
              },
              reverseJunctionField: {
                field: junctionFieldCurrent,
                type: 'uuid'
              },
              relatedPrimaryKeyField: {
                field: 'id',
                type: 'uuid'
              },
              junctionPrimaryKeyField: {
                field: 'id',
                type: 'integer'
              },
              sortField: (options.sort_field as string) || undefined,
              relation: {
                field: junctionFieldRelated,
                collection: junctionCollection,
                related_collection: relatedCollection,
                meta: {} as RelationMeta
              },
              junction: {
                collection: junctionCollection,
                field: junctionFieldCurrent,
                related_collection: collection,
                meta: {
                  one_field: field,
                  one_collection: collection,
                  many_collection: junctionCollection,
                  many_field: junctionFieldCurrent,
                  junction_field: junctionFieldRelated,
                }
              }
            };
            
            setRelationInfo(info);
            setLoading(false);
            return;
          }
          
          setError(`M2M relationship not configured. No junction relation found for field "${field}".`);
          setRelationInfo(null);
          setLoading(false);
          return;
        }

        const junctionCollection = junction.collection;
        const junctionField = junction.meta?.junction_field;
        
        if (!junctionCollection || !junctionField) {
          setError('Invalid junction relation: missing collection or junction_field');
          setRelationInfo(null);
          setLoading(false);
          return;
        }

        // Step 2: Find the "relation" from junction to related collection
        const relation = relations.find((rel) =>
          rel.collection === junctionCollection &&
          rel.field === junctionField
        );

        if (!relation || !relation.related_collection) {
          setError(`M2M relationship not configured. Related collection not found for junction field "${junctionField}".`);
          setRelationInfo(null);
          setLoading(false);
          return;
        }

        // Build the M2MRelationInfo
        const info: M2MRelationInfo = {
          junctionCollection: {
            collection: junctionCollection,
            meta: {}
          },
          relatedCollection: {
            collection: relation.related_collection,
            meta: {}
          },
          junctionField: {
            field: junctionField,
            type: 'uuid'
          },
          reverseJunctionField: {
            field: junction.field || `${collection}_id`,
            type: 'uuid'
          },
          relatedPrimaryKeyField: {
            field: 'id',
            type: 'uuid'
          },
          junctionPrimaryKeyField: {
            field: 'id',
            type: 'integer'
          },
          sortField: junction.meta?.sort_field || undefined,
          relation: {
            field: junctionField,
            collection: junctionCollection,
            related_collection: relation.related_collection,
            meta: (relation.meta || {}) as RelationMeta
          },
          junction: junction
        };
        
        setRelationInfo(info);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load relationship configuration';
        setError(errorMessage);
        setRelationInfo(null);
        notifications.show({
          title: 'Error',
          message: 'Failed to load relationship configuration',
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
    error
  };
}
