import { FieldsService } from "@microbuild/services";
import type { Field } from "@microbuild/types";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./utils";

/**
 * Information about a Many-to-One relationship
 */
export interface M2ORelationInfo {
  /** The related collection (foreign table) */
  relatedCollection: {
    collection: string;
    meta?: Record<string, unknown>;
  };
  /** The field containing the foreign key */
  foreignKeyField: {
    field: string;
    type: string;
  };
  /** Primary key field of the related collection */
  relatedPrimaryKeyField: {
    field: string;
    type: string;
  };
  /** Display template for the related item */
  displayTemplate?: string;
  /** Relation metadata */
  relation: {
    field: string;
    collection: string;
    related_collection: string;
    meta?: Record<string, unknown> | null;
  };
}

/**
 * Custom hook for managing Many-to-One (M2O) relationship information
 *
 * In M2O relationships:
 * - The current collection has a foreign key pointing to another collection
 * - Only ONE related item can be selected
 * - Example: A "posts" item belongs to ONE "category"
 */
export function useRelationM2O(collection: string, field: string) {
  const [relationInfo, setRelationInfo] = useState<M2ORelationInfo | null>(
    null,
  );
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

        // Get field info
        const fieldsService = new FieldsService();
        const fieldsData = await fieldsService.readAll(collection);
        const currentField = fieldsData.find((f: Field) => f.field === field);

        if (!currentField) {
          setError(`Field "${field}" not found in collection "${collection}"`);
          setRelationInfo(null);
          setLoading(false);
          return;
        }

        // Check if this is a M2O interface
        const interfaceType = currentField.meta?.interface;
        if (
          interfaceType !== "list-m2o" &&
          interfaceType !== "select-dropdown-m2o"
        ) {
          setError(
            `Field "${field}" is not configured as a list-m2o or select-dropdown-m2o interface`,
          );
          setRelationInfo(null);
          setLoading(false);
          return;
        }

        // Get the related collection from multiple sources
        const fieldOptions = currentField.meta?.options as
          | Record<string, unknown>
          | undefined;
        let relatedCollectionName: string | null =
          (currentField.schema?.foreign_key_table as string | undefined) ||
          (fieldOptions?.related_collection as string | undefined) ||
          (fieldOptions?.relatedCollection as string | undefined) ||
          null;

        // If still not found, try fetching from daas_relations
        if (!relatedCollectionName) {
          try {
            const relationsData = await apiRequest<{
              data: {
                many_collection: string;
                many_field: string;
                one_collection?: string;
              }[];
            }>(`/api/relations?collection=${collection}&field=${field}`);
            const relation = relationsData.data?.find(
              (r) => r.many_collection === collection && r.many_field === field,
            );
            if (relation?.one_collection) {
              relatedCollectionName = relation.one_collection;
            }
          } catch {
            // Ignore relation fetch errors
          }
        }

        if (!relatedCollectionName) {
          setError(`No related collection configured for field "${field}".`);
          setRelationInfo(null);
          setLoading(false);
          return;
        }

        // Build relation info
        const info: M2ORelationInfo = {
          relatedCollection: {
            collection: relatedCollectionName,
            meta: {},
          },
          foreignKeyField: {
            field: field,
            type: currentField.schema?.data_type || "uuid",
          },
          relatedPrimaryKeyField: {
            field: currentField.schema?.foreign_key_column || "id",
            type: "uuid",
          },
          displayTemplate: fieldOptions?.template as string | undefined,
          relation: {
            field,
            collection,
            related_collection: relatedCollectionName,
            meta: currentField.meta as Record<string, unknown> | undefined,
          },
        };

        setRelationInfo(info);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load relationship configuration";
        setError(errorMessage);
        setRelationInfo(null);
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
 * M2O Item - a related item in a Many-to-One relationship
 */
export interface M2OItem {
  id: string | number;
  [key: string]: unknown;
}

/**
 * Query parameters for loading M2O item
 */
export interface M2OQueryParams {
  fields?: string[];
}

/**
 * Custom hook for managing M2O relationship item (CRUD operations)
 */
export function useRelationM2OItem(
  relationInfo: M2ORelationInfo | null,
  value: string | number | null,
) {
  const [item, setItem] = useState<M2OItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the related item
  const loadItem = useCallback(
    async (params?: M2OQueryParams) => {
      if (!relationInfo || !value) {
        setItem(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const collection = relationInfo.relatedCollection.collection;
        const queryParams = new URLSearchParams();
        if (params?.fields && params.fields.length > 0) {
          queryParams.set("fields", params.fields.join(","));
        }
        const qs = queryParams.toString();
        const path = `/api/items/${collection}/${value}${qs ? `?${qs}` : ""}`;

        const response = await apiRequest<{ data: M2OItem }>(path);
        setItem(response.data as M2OItem);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load related item";
        setError(errorMessage);
        setItem(null);
      } finally {
        setLoading(false);
      }
    },
    [relationInfo, value],
  );

  // Clear the selected item
  const clearItem = useCallback(() => {
    setItem(null);
  }, []);

  return {
    item,
    loading,
    error,
    loadItem,
    clearItem,
    setItem,
  };
}
