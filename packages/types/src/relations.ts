/**
 * Relation Types
 * 
 * TypeScript type definitions for relationship handling,
 * following the Directus v11.12.0 specification.
 */

/**
 * Collection metadata for relation targets
 */
export interface RelationCollectionMeta {
  collection: string;
  meta?: Record<string, unknown>;
}

/**
 * Field info for relation fields
 */
export interface RelationFieldInfo {
  field: string;
  type: string;
}

/**
 * Base relation metadata
 */
export interface RelationMeta {
  id?: number;
  one_field?: string | null;
  one_collection?: string | null;
  many_collection?: string;
  many_field?: string;
  junction_field?: string | null;
  sort_field?: string | null;
  one_deselect_action?: string;
  [key: string]: unknown;
}

/**
 * Relation schema info
 */
export interface RelationSchema {
  table?: string;
  column?: string;
  foreign_key_table?: string;
  foreign_key_column?: string;
  constraint_name?: string | null;
  on_update?: string;
  on_delete?: string;
}

/**
 * Full relation definition
 */
export interface Relation {
  collection?: string;
  field?: string;
  related_collection?: string | null;
  meta?: RelationMeta;
  schema?: RelationSchema;
}

/**
 * Many-to-Many (M2M) relationship info
 * 
 * In M2M relationships:
 * - Items from collection A can relate to many items in collection B
 * - Items from collection B can relate to many items in collection A
 * - A junction table connects the two collections
 * 
 * Example: Articles <-> Tags (through article_tags junction)
 */
export interface M2MRelationInfo {
  /** The junction/pivot collection */
  junctionCollection: RelationCollectionMeta;
  /** The related collection */
  relatedCollection: RelationCollectionMeta;
  /** Field in junction pointing to current collection */
  junctionField: RelationFieldInfo;
  /** Field in junction pointing to related collection */
  reverseJunctionField: RelationFieldInfo;
  /** Primary key field of related collection */
  relatedPrimaryKeyField: RelationFieldInfo;
  /** Primary key field of junction collection */
  junctionPrimaryKeyField: RelationFieldInfo;
  /** Optional sort field in junction */
  sortField?: string;
  /** Display template for related items */
  displayTemplate?: string;
  /** Relation configuration */
  relation: {
    field: string;
    collection: string;
    related_collection: string;
    meta?: RelationMeta;
  };
}

/**
 * M2M item representation
 */
export interface M2MItem {
  /** Item ID (could be junction ID or related item ID) */
  id: string | number;
  /** The related item data */
  item?: Record<string, unknown>;
  /** Junction record data */
  junction?: Record<string, unknown>;
  /** Original junction ID if applicable */
  junctionId?: string | number;
  /** Sort order if configured */
  sort?: number;
}

/**
 * Query params for M2M item fetching
 */
export interface M2MQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string | string[];
  filter?: Record<string, unknown>;
}

/**
 * Many-to-One (M2O) relationship info
 * 
 * In M2O relationships:
 * - The current collection has a foreign key pointing to another collection
 * - Only ONE related item can be selected
 * 
 * Example: Posts -> Category (posts.category_id -> categories.id)
 */
export interface M2ORelationInfo {
  /** The related collection (foreign table) */
  relatedCollection: RelationCollectionMeta;
  /** The field containing the foreign key */
  foreignKeyField: RelationFieldInfo;
  /** Primary key field of the related collection */
  relatedPrimaryKeyField: RelationFieldInfo;
  /** Display template for the related item */
  displayTemplate?: string;
  /** Relation metadata */
  relation: {
    field: string;
    collection: string;
    related_collection: string;
    meta?: Record<string, unknown>;
  };
}

/**
 * M2O item representation
 */
export interface M2OItem {
  /** Item ID */
  id: string | number;
  /** Item data */
  data?: Record<string, unknown>;
}

/**
 * One-to-Many (O2M) relationship info
 * 
 * In O2M relationships:
 * - The RELATED collection has a foreign key pointing to the CURRENT collection
 * - MULTIPLE related items can exist for a single parent item
 * 
 * Example: Category -> Posts (posts.category_id points to categories.id)
 * This is the INVERSE of M2O - viewing the "many" side from the "one" perspective
 */
export interface O2MRelationInfo {
  /** The related collection (the "many" side) */
  relatedCollection: RelationCollectionMeta;
  /** The field in the related collection that points back to this collection */
  reverseJunctionField: RelationFieldInfo;
  /** Primary key field of the related collection */
  relatedPrimaryKeyField: RelationFieldInfo;
  /** Primary key field of the current (parent) collection */
  parentPrimaryKeyField: RelationFieldInfo;
  /** Sort field for ordering items (if configured) */
  sortField?: string;
  /** Display template for the related item */
  displayTemplate?: string;
  /** Relation metadata */
  relation: {
    field: string;
    collection: string;
    related_collection: string;
    meta?: Record<string, unknown>;
  };
}

/**
 * O2M item representation
 */
export interface O2MItem {
  /** Item ID */
  id: string | number;
  /** Item data */
  data?: Record<string, unknown>;
  /** Sort order if configured */
  sort?: number;
}

/**
 * Query params for O2M item fetching
 */
export interface O2MQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string | string[];
  filter?: Record<string, unknown>;
}

/**
 * Many-to-Any (M2A) relationship info
 * 
 * In M2A relationships:
 * - Items can relate to items from MULTIPLE different collections
 * - A junction table stores both the ID and the collection name
 * 
 * Example: Page Blocks -> [Hero, Text, Image, Video] blocks
 */
export interface M2ARelationInfo {
  /** The junction/pivot collection */
  junctionCollection: RelationCollectionMeta;
  /** Available target collections */
  allowedCollections: string[];
  /** Field in junction pointing to current collection */
  junctionField: RelationFieldInfo;
  /** Field in junction storing the collection name */
  collectionField: RelationFieldInfo;
  /** Field in junction storing the item ID */
  itemField: RelationFieldInfo;
  /** Primary key field of junction collection */
  junctionPrimaryKeyField: RelationFieldInfo;
  /** Optional sort field in junction */
  sortField?: string;
  /** Relation configuration */
  relation: {
    field: string;
    collection: string;
    meta?: RelationMeta;
  };
}

/**
 * M2A item representation
 */
export interface M2AItem {
  /** Junction record ID */
  id: string | number;
  /** The collection this item belongs to */
  collection: string;
  /** The item ID in the related collection */
  item: string | number;
  /** The actual item data */
  data?: Record<string, unknown>;
  /** Sort order if configured */
  sort?: number;
}

/**
 * Query params for M2A item fetching
 */
export interface M2AQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string | string[];
  filter?: Record<string, unknown>;
  collections?: string[];
}
