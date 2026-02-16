import React from 'react';
import { Sort } from '@microbuild/ui-table';
import { AnyItem, Field, Collection, Bookmark } from '@microbuild/types';

/**
 * CollectionForm Component
 *
 * A CRUD wrapper around VForm that handles data fetching and persistence.
 * Uses VForm for the actual form rendering with all @microbuild/ui-interfaces components.
 *
 * Architecture:
 * - CollectionForm = Data layer (fetch fields, load/save items, CRUD operations)
 * - VForm = Presentation layer (renders fields with proper interfaces from @microbuild/ui-interfaces)
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
 * Composes VTable for presentation (sorting, resize, reorder, selection)
 * with data fetching from FieldsService/ItemsService.
 *
 * Used by ListO2M and ListM2M for selecting existing items,
 * and by content module pages for collection list views.
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
    /** Filter to apply (Directus-style filter object) */
    filter?: Record<string, unknown>;
    /** Bulk actions for selected items */
    bulkActions?: BulkAction[];
    /** Fields to display (defaults to first 5 visible fields) */
    fields?: string[];
    /** Items per page */
    limit?: number;
    /** Enable search */
    enableSearch?: boolean;
    /** Enable column sorting */
    enableSort?: boolean;
    /** Enable column resize */
    enableResize?: boolean;
    /** Enable column reorder (drag headers) */
    enableReorder?: boolean;
    /** Enable header context menu (right-click for sort, align, hide) */
    enableHeaderMenu?: boolean;
    /** Enable inline "add field" button in header */
    enableAddField?: boolean;
    /** Primary key field name */
    primaryKeyField?: string;
    /** Row height in pixels */
    rowHeight?: number;
    /** Table spacing preset */
    tableSpacing?: 'compact' | 'cozy' | 'comfortable';
    /** Callback when item row is clicked */
    onItemClick?: (item: AnyItem) => void;
    /** Callback when visible fields change */
    onFieldsChange?: (fields: string[]) => void;
    /** Callback when sort changes */
    onSortChange?: (sort: Sort | null) => void;
}
/**
 * CollectionList - Dynamic list for displaying collection items.
 * Composes VTable for sorting, resize, reorder, selection, and context menu.
 */
declare const CollectionList: React.FC<CollectionListProps>;

/**
 * FilterPanel Component
 *
 * A field-type-aware filter builder for collection queries.
 * Inspired by Directus's system-filter interface.
 *
 * Produces Directus-compatible filter objects ({ _and: [...] })
 * that can be passed to CollectionList's `filter` prop or
 * used directly with ItemsService.readByQuery().
 *
 * @package @microbuild/ui-collections
 */

/** A single filter rule */
interface FilterRule {
    id: string;
    field: string;
    operator: string;
    value: unknown;
}
/** A filter group (AND / OR) */
interface FilterGroup {
    id: string;
    logical: '_and' | '_or';
    rules: (FilterRule | FilterGroup)[];
}
interface FilterPanelProps {
    /** Available fields to filter on */
    fields: Field[];
    /** Current filter value (Directus-style JSON) */
    value?: Record<string, unknown> | null;
    /** Called when filter changes */
    onChange?: (filter: Record<string, unknown> | null) => void;
    /** Display mode: 'panel' shows bordered container, 'inline' is flat */
    mode?: 'panel' | 'inline';
    /** Show as collapsed bar with chip summary */
    collapsible?: boolean;
    /** Initially collapsed */
    defaultCollapsed?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Maximum nesting depth for groups (default: 3) */
    maxDepth?: number;
}
declare const FilterPanel: React.FC<FilterPanelProps>;

/**
 * ContentNavigation Component
 *
 * Hierarchical sidebar navigation for the content module.
 * Displays all collections in a tree structure with search, grouping,
 * bookmarks, context menus, and show/hide hidden collections.
 *
 * Ported from Directus content module's navigation.vue + navigation-item.vue.
 *
 * @package @microbuild/ui-collections
 */

/** Node in the collection tree */
interface CollectionTreeNode extends Collection {
    /** Display name (formatted from collection identifier) */
    name?: string;
    /** Icon identifier (flattened from meta) */
    icon?: string;
    /** Color value (flattened from meta) */
    color?: string;
    children: CollectionTreeNode[];
}
interface ContentNavigationProps {
    /** Current active collection */
    currentCollection?: string;
    /** Tree of root collections (use useCollections hook) */
    rootCollections: CollectionTreeNode[];
    /** Currently expanded group IDs */
    activeGroups: string[];
    /** Toggle group expand/collapse */
    onToggleGroup: (collectionId: string) => void;
    /** Show hidden collections */
    showHidden?: boolean;
    /** Callback to toggle hidden collections */
    onToggleHidden?: () => void;
    /** Whether hidden collections exist */
    hasHiddenCollections?: boolean;
    /** Whether to show search (many collections) */
    showSearch?: boolean;
    /** Whether to use dense mode */
    dense?: boolean;
    /** Bookmarks grouped by collection */
    bookmarks?: Bookmark[];
    /** Navigate to a collection */
    onNavigate: (collection: string) => void;
    /** Navigate to a bookmark */
    onBookmarkClick?: (bookmark: Bookmark) => void;
    /** Navigate to collection settings (admin only) */
    onEditCollection?: (collection: string) => void;
    /** Whether user is admin */
    isAdmin?: boolean;
    /** Whether collections are loading */
    loading?: boolean;
    /** Called when search value changes */
    onSearchChange?: (search: string) => void;
}
/**
 * ContentNavigation — Sidebar navigation for the content module.
 *
 * Renders a hierarchical tree of collections with:
 * - Searchable collection list
 * - Expandable/collapsible groups
 * - Bookmark items under each collection
 * - Context menu for admin actions
 * - Show/hide hidden collections
 *
 * @example
 * ```tsx
 * import { ContentNavigation } from '@microbuild/ui-collections';
 * import { useCollections } from '@microbuild/hooks';
 *
 * function Sidebar() {
 *   const {
 *     rootCollections, activeGroups, toggleGroup,
 *     showHidden, setShowHidden, hasHiddenCollections,
 *     showSearch, dense, loading,
 *   } = useCollections({ currentCollection: 'articles' });
 *
 *   return (
 *     <ContentNavigation
 *       rootCollections={rootCollections}
 *       activeGroups={activeGroups}
 *       onToggleGroup={toggleGroup}
 *       currentCollection="articles"
 *       onNavigate={(col) => router.push(`/content/${col}`)}
 *       showHidden={showHidden}
 *       onToggleHidden={() => setShowHidden(!showHidden)}
 *       hasHiddenCollections={hasHiddenCollections}
 *       showSearch={showSearch}
 *       dense={dense}
 *       loading={loading}
 *     />
 *   );
 * }
 * ```
 */
declare const ContentNavigation: React.FC<ContentNavigationProps>;

/**
 * ContentLayout Component
 *
 * Shell layout for the content module providing:
 * - Sidebar with ContentNavigation
 * - Main content area with header (title, breadcrumbs, actions)
 * - Responsive: sidebar collapses on mobile
 *
 * Ported from Directus PrivateView + content module shell.
 *
 * @package @microbuild/ui-collections
 */

interface BreadcrumbItem {
    /** Display label */
    label: string;
    /** Navigation path */
    href?: string;
}
interface ContentLayoutProps {
    /** Page title */
    title?: string;
    /** Page icon (Tabler icon name or React node) */
    icon?: React.ReactNode;
    /** Icon color */
    iconColor?: string;
    /** Breadcrumb trail */
    breadcrumbs?: BreadcrumbItem[];
    /** Show a back button */
    showBack?: boolean;
    /** Back button callback */
    onBack?: () => void;
    /** Show header shadow (e.g., when form is scrolled) */
    showHeaderShadow?: boolean;
    /** Sidebar content (typically ContentNavigation) */
    sidebar: React.ReactNode;
    /** Sidebar detail panels (right sidebar) */
    sidebarDetail?: React.ReactNode;
    /** Actions rendered in the header bar */
    actions?: React.ReactNode;
    /** Content between title and actions */
    titleAppend?: React.ReactNode;
    /** Headline area (above title, e.g. version menu) */
    headline?: React.ReactNode;
    /** Whether content is loading */
    loading?: boolean;
    /** Sidebar width in px (default: 260) */
    sidebarWidth?: number;
    /** Detail sidebar width in px (default: 284) */
    detailWidth?: number;
    /** Main content */
    children: React.ReactNode;
}
/**
 * ContentLayout — Content module shell with sidebar navigation.
 *
 * Provides a responsive layout with a collapsible sidebar on the left,
 * a header bar with breadcrumbs/title/actions, and a main content area.
 *
 * @example
 * ```tsx
 * import { ContentLayout, ContentNavigation } from '@microbuild/ui-collections';
 * import { useCollections } from '@microbuild/hooks';
 *
 * function ContentPage({ children }) {
 *   const collections = useCollections({ currentCollection: 'articles' });
 *
 *   return (
 *     <ContentLayout
 *       title="Articles"
 *       breadcrumbs={[{ label: 'Content', href: '/content' }]}
 *       sidebar={
 *         <ContentNavigation
 *           rootCollections={collections.rootCollections}
 *           activeGroups={collections.activeGroups}
 *           onToggleGroup={collections.toggleGroup}
 *           onNavigate={(col) => router.push(`/content/${col}`)}
 *         />
 *       }
 *       actions={<Button>Create Item</Button>}
 *     >
 *       <CollectionList collection="articles" />
 *     </ContentLayout>
 *   );
 * }
 * ```
 */
declare const ContentLayout: React.FC<ContentLayoutProps>;

/**
 * SaveOptions Component
 *
 * Dropdown menu attached to the primary save button providing
 * additional save actions: save & stay, save & add new, save as copy, discard.
 *
 * Ported from Directus save-options.vue.
 *
 * @package @microbuild/ui-collections
 */

type SaveAction = 'save-and-stay' | 'save-and-add-new' | 'save-as-copy' | 'discard-and-stay';
interface SaveOptionsProps {
    /** Disabled options */
    disabledOptions?: SaveAction[];
    /** Save and stay on current item */
    onSaveAndStay?: () => void;
    /** Save and navigate to create new */
    onSaveAndAddNew?: () => void;
    /** Save a copy of the current item */
    onSaveAsCopy?: () => void;
    /** Discard all changes */
    onDiscardAndStay?: () => void;
    /** Whether the menu trigger is disabled */
    disabled?: boolean;
    /** Platform for keyboard shortcut display (default: auto-detect) */
    platform?: 'mac' | 'win';
}
/**
 * SaveOptions — Dropdown for additional save actions
 *
 * Designed to be placed adjacent to the primary Save button.
 *
 * @example
 * ```tsx
 * <Group gap={0}>
 *   <Button onClick={handleSave} loading={saving} disabled={!hasEdits}>
 *     <IconCheck size={16} />
 *   </Button>
 *   <SaveOptions
 *     onSaveAndStay={handleSaveAndStay}
 *     onSaveAndAddNew={handleSaveAndAddNew}
 *     onSaveAsCopy={handleSaveAsCopy}
 *     onDiscardAndStay={handleDiscard}
 *     disabledOptions={isNew ? ['save-as-copy'] : []}
 *   />
 * </Group>
 * ```
 */
declare const SaveOptions: React.FC<SaveOptionsProps>;

export { type BreadcrumbItem, type BulkAction, CollectionForm, type CollectionFormProps, CollectionList, type CollectionListProps, type CollectionTreeNode, ContentLayout, type ContentLayoutProps, ContentNavigation, type ContentNavigationProps, type FilterGroup, FilterPanel, type FilterPanelProps, type FilterRule, type SaveAction, SaveOptions, type SaveOptionsProps };
