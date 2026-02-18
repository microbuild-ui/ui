/**
 * Type definitions for VTable component
 * Based on DaaS v-table types
 */

/**
 * Column alignment options
 */
export type Alignment = 'left' | 'center' | 'right';

/**
 * Selection mode for table rows
 */
export type ShowSelect = 'none' | 'one' | 'multiple';

/**
 * Raw header configuration (user-provided)
 */
export interface HeaderRaw {
  /** Column header text */
  text: string;
  /** Field key to display from item data */
  value: string;
  /** Optional description shown as tooltip */
  description?: string | null;
  /** Text alignment */
  align?: Alignment;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Fixed column width in pixels */
  width?: number | null;
  /** Any additional properties */
  [key: string]: unknown;
}

/**
 * Header with defaults applied
 */
export interface Header extends Required<Omit<HeaderRaw, keyof Record<string, unknown>>> {
  text: string;
  value: string;
  description: string | null;
  align: Alignment;
  sortable: boolean;
  width: number | null;
}

/**
 * Table row item
 */
export interface Item {
  [key: string]: unknown;
}

/**
 * Event emitted when an item is selected/deselected
 */
export interface ItemSelectEvent {
  /** Whether item is being selected (true) or deselected (false) */
  value: boolean;
  /** The item being selected/deselected */
  item: Item;
}

/**
 * Sort configuration
 */
export interface Sort {
  /** Field to sort by (null for no sorting) */
  by: string | null;
  /** Sort direction (true = descending) */
  desc: boolean;
}

/**
 * Manual sort (drag-and-drop) event
 */
export interface ManualSortEvent {
  /** Primary key of the item being moved */
  item: unknown;
  /** Primary key of the item to move before/after */
  to: unknown;
}

/**
 * Row click event
 */
export interface RowClickEvent {
  /** The clicked item */
  item: Item;
  /** The mouse event */
  event: React.MouseEvent;
}

/**
 * Default header values
 */
export const HeaderDefaults: Omit<Header, 'text' | 'value'> = {
  align: 'left',
  sortable: true,
  width: null,
  description: null,
};

/**
 * Apply defaults to raw headers
 */
export function applyHeaderDefaults(headers: HeaderRaw[]): Header[] {
  return headers.map((header) => ({
    ...HeaderDefaults,
    ...header,
    // Ensure minimum width
    width: header.width && header.width < 24 ? 24 : (header.width ?? null),
  })) as Header[];
}
