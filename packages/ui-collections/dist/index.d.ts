import React from 'react';
import { AnyItem } from '@microbuild/types';

/**
 * CollectionForm Component
 *
 * A dynamic form that fetches field definitions and renders appropriate inputs.
 * Used by ListO2M and ListM2M for creating/editing related items.
 *
 * @package @microbuild/ui-collections
 */

interface CollectionFormProps {
    /** Collection name */
    collection: string;
    /** Item ID for edit mode */
    id?: string | number;
    /** Mode: create or edit */
    mode?: 'create' | 'edit';
    /** Default values for new items */
    defaultValues?: Record<string, unknown>;
    /** Callback on successful save */
    onSuccess?: (data?: Record<string, unknown>) => void;
    /** Callback on cancel */
    onCancel?: () => void;
    /** Fields to exclude from form */
    excludeFields?: string[];
    /** Fields to show (if set, only these fields are shown) */
    includeFields?: string[];
}
/**
 * CollectionForm - Dynamic form for creating/editing collection items
 */
declare const CollectionForm: React.FC<CollectionFormProps>;

/**
 * CollectionList Component
 *
 * A dynamic list/table that fetches items from a collection.
 * Used by ListO2M and ListM2M for selecting existing items.
 *
 * @package @microbuild/ui-collections
 */

interface BulkAction {
    label: string;
    icon?: React.ReactNode;
    color?: string;
    action: (selectedIds: (string | number)[]) => void | Promise<void>;
}
interface CollectionListProps {
    /** Collection name to display */
    collection: string;
    /** Enable row selection */
    enableSelection?: boolean;
    /** Filter to apply */
    filter?: Record<string, unknown>;
    /** Bulk actions for selected items */
    bulkActions?: BulkAction[];
    /** Fields to display (defaults to first 4 fields) */
    fields?: string[];
    /** Items per page */
    limit?: number;
    /** Enable search */
    enableSearch?: boolean;
    /** Primary key field name */
    primaryKeyField?: string;
    /** Callback when item is clicked */
    onItemClick?: (item: AnyItem) => void;
}
/**
 * CollectionList - Dynamic list for displaying collection items
 */
declare const CollectionList: React.FC<CollectionListProps>;

export { type BulkAction, CollectionForm, type CollectionFormProps, CollectionList, type CollectionListProps };
