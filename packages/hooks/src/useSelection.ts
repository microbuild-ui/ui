'use client';

import { useState, useCallback, useMemo } from 'react';

export interface UseSelectionOptions<T> {
  /** Initial selection */
  initialSelection?: T[];
  /** Maximum number of items that can be selected */
  maxSelection?: number;
  /** Callback when selection changes */
  onSelectionChange?: (selection: T[]) => void;
}

export interface UseSelectionReturn<T> {
  /** Current selection */
  selection: T[];
  /** Set selection directly */
  setSelection: (items: T[]) => void;
  /** Toggle a single item in selection */
  toggleSelection: (item: T) => void;
  /** Select all provided items */
  selectAll: (items: T[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if an item is selected */
  isSelected: (item: T) => boolean;
  /** Number of selected items */
  selectionCount: number;
  /** Whether any items are selected */
  hasSelection: boolean;
}

/**
 * Hook to manage item selection in collections
 * 
 * @example
 * ```tsx
 * const { selection, toggleSelection, isSelected } = useSelection<string>();
 * 
 * return (
 *   <ul>
 *     {items.map(item => (
 *       <li 
 *         key={item.id}
 *         onClick={() => toggleSelection(item.id)}
 *         style={{ fontWeight: isSelected(item.id) ? 'bold' : 'normal' }}
 *       >
 *         {item.name}
 *       </li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useSelection<T = string>(options: UseSelectionOptions<T> = {}): UseSelectionReturn<T> {
  const { initialSelection = [], maxSelection, onSelectionChange } = options;
  const [selection, setSelectionState] = useState<T[]>(initialSelection);

  const setSelection = useCallback((items: T[]) => {
    const newSelection = maxSelection ? items.slice(0, maxSelection) : items;
    setSelectionState(newSelection);
    onSelectionChange?.(newSelection);
  }, [maxSelection, onSelectionChange]);

  const toggleSelection = useCallback((item: T) => {
    setSelectionState((prev) => {
      const isCurrentlySelected = prev.includes(item);
      let newSelection: T[];
      
      if (isCurrentlySelected) {
        newSelection = prev.filter((i) => i !== item);
      } else {
        if (maxSelection && prev.length >= maxSelection) {
          // At max capacity, don't add more
          return prev;
        }
        newSelection = [...prev, item];
      }
      
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [maxSelection, onSelectionChange]);

  const selectAll = useCallback((items: T[]) => {
    const newSelection = maxSelection ? items.slice(0, maxSelection) : items;
    setSelectionState(newSelection);
    onSelectionChange?.(newSelection);
  }, [maxSelection, onSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelectionState([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const isSelected = useCallback((item: T) => {
    return selection.includes(item);
  }, [selection]);

  const selectionCount = useMemo(() => selection.length, [selection]);
  const hasSelection = useMemo(() => selection.length > 0, [selection]);

  return {
    selection,
    setSelection,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    selectionCount,
    hasSelection,
  };
}
