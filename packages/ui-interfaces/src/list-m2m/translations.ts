/**
 * ListM2M Translation System
 *
 * Provides i18n support for all user-facing strings in the ListM2M component.
 * Ships with English defaults; consumers can supply partial or full overrides
 * via the `translations` prop.
 *
 * Translation keys match Directus 11.14.0 conventions where applicable.
 *
 * @module @buildpad/ui-interfaces/list-m2m/translations
 */

export interface M2MTranslations {
    // ── Header Actions ──
    /** "Create New" button label */
    create_new: string;
    /** "Add Existing" button label */
    add_existing: string;
    /** Batch edit tooltip */
    batch_edit: string;
    /** Tooltip when action is not allowed */
    not_allowed: string;

    // ── States ──
    /** Empty state when no items linked */
    no_items: string;
    /** Relationship not configured warning title */
    relationship_not_setup: string;
    /** Relationship not configured warning body */
    relationship_not_setup_detail: string;
    /** Singleton collection warning */
    no_singleton_relations: string;
    /** Configuration error alert title */
    configuration_error: string;
    /** Storybook/testing hint */
    storybook_hint: string;
    /** Loading text */
    loading: string;

    // ── Pagination ──
    /** Per-page label */
    per_page: string;
    /** "Showing {start} to {end} of {total}" — use {start}, {end}, {total} */
    showing_range: string;
    /** Item count — singular */
    item_count_one: string;
    /** Item count — plural; use {count} placeholder */
    item_count_other: string;
    /** Unsaved changes indicator */
    unsaved_changes: string;

    // ── Actions ──
    /** Edit item tooltip */
    edit: string;
    /** Remove / unlink item tooltip */
    remove: string;
    /** Navigate to item tooltip */
    navigate_to_item: string;
    /** Search placeholder */
    search_placeholder: string;
    /** Select items modal title */
    select_items: string;
    /** "Add Selected" bulk action label */
    add_selected: string;
    /** "Select All" checkbox label */
    select_all: string;
    /** "Deselect All" checkbox label */
    deselect_all: string;

    // ── Drawer ──
    /** Create new item drawer title */
    create_item: string;
    /** Edit item drawer title */
    edit_item: string;
    /** Junction fields section label */
    junction_fields: string;

    // ── Batch Edit ──
    /** Batch edit drawer title; use {count} placeholder */
    batch_edit_title: string;
    /** Batch edit confirm button */
    batch_edit_apply: string;

    // ── Sorting ──
    /** Move up tooltip */
    move_up: string;
    /** Move down tooltip */
    move_down: string;
    /** Drag to reorder tooltip */
    drag_to_reorder: string;
    /** Sort order column header */
    order: string;
    /** Actions column header */
    actions: string;

    // ── Versioning ──
    /** Content version indicator */
    version: string;
    /** Viewing version hint; use {name} placeholder */
    viewing_version: string;

    // ── Status badges ──
    /** NEW badge for created items */
    badge_new: string;
    /** EDITED badge for updated items */
    badge_edited: string;

    // ── Validation ──
    /** Required field missing error */
    field_required: string;
    /** Generic invalid value error */
    invalid_value: string;
}

/**
 * Default English translations.
 */
export const defaultTranslations: M2MTranslations = {
    // Header Actions
    create_new: 'Create New',
    add_existing: 'Add Existing',
    batch_edit: 'Edit Selected',
    not_allowed: 'Not allowed',

    // States
    no_items: 'No related items',
    relationship_not_setup: 'Relationship not configured',
    relationship_not_setup_detail: 'The many-to-many relationship is not properly configured for this field.',
    no_singleton_relations: 'The related collection is a singleton and cannot be used in an M2M relationship.',
    configuration_error: 'Configuration Error',
    storybook_hint: 'In Storybook, relational interfaces require API proxy routes. This component works fully in a Next.js app with DaaS integration.',
    loading: 'Loading...',

    // Pagination
    per_page: 'Items per page:',
    showing_range: 'Showing {start} to {end} of {total}',
    item_count_one: '1 item',
    item_count_other: '{count} items',
    unsaved_changes: '(unsaved changes)',

    // Actions
    edit: 'Edit',
    remove: 'Remove',
    navigate_to_item: 'Open item',
    search_placeholder: 'Search...',
    select_items: 'Select Items',
    add_selected: 'Add Selected',
    select_all: 'Select All',
    deselect_all: 'Deselect All',

    // Drawer
    create_item: 'Create New Item',
    edit_item: 'Edit Item',
    junction_fields: 'Junction Fields',

    // Batch Edit
    batch_edit_title: 'Editing {count} items',
    batch_edit_apply: 'Apply Changes',

    // Sorting
    move_up: 'Move up',
    move_down: 'Move down',
    drag_to_reorder: 'Drag to reorder',
    order: 'Order',
    actions: 'Actions',

    // Versioning
    version: 'Version',
    viewing_version: 'Viewing version: {name}',

    // Status badges
    badge_new: 'NEW',
    badge_edited: 'EDITED',

    // Validation
    field_required: 'This field is required',
    invalid_value: 'Invalid value',
};

/**
 * Merge user-provided partial translations with defaults.
 */
export function mergeTranslations(
    overrides?: Partial<M2MTranslations>,
): M2MTranslations {
    if (!overrides) return defaultTranslations;
    return { ...defaultTranslations, ...overrides };
}

/**
 * Interpolate placeholders in a translation string.
 *
 * @example
 * interpolate('Showing {start} to {end} of {total}', { start: 1, end: 10, total: 42 })
 * // → 'Showing 1 to 10 of 42'
 */
export function interpolate(
    template: string,
    values: Record<string, string | number>,
): string {
    return template.replace(/{(\w+)}/g, (_, key) => {
        return key in values ? String(values[key]) : `{${key}}`;
    });
}

/**
 * Format item count with correct plural form.
 */
export function formatItemCount(
    count: number,
    t: M2MTranslations,
): string {
    if (count === 1) return t.item_count_one;
    return interpolate(t.item_count_other, { count });
}
