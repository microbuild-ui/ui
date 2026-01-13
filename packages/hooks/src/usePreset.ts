'use client';

import { useState, useCallback, useMemo } from 'react';

export interface Filter {
  [key: string]: unknown;
}

export interface Query {
  fields?: string[];
  filter?: Record<string, unknown>;
  search?: string;
  sort?: string | string[];
  limit?: number;
  offset?: number;
  page?: number;
  deep?: Record<string, Query>;
  alias?: Record<string, string>;
}

export interface UsePresetOptions {
  /** Collection name */
  collection: string;
  /** Bookmark ID if loading from saved preset */
  bookmarkId?: number | null;
  /** Initial layout (default: 'table') */
  initialLayout?: string;
  /** Persist to localStorage */
  persist?: boolean;
}

export interface UsePresetReturn {
  /** Current filter */
  filter: Filter | null;
  /** Set filter */
  setFilter: (filter: Filter | null) => void;
  /** Current search query */
  search: string | null;
  /** Set search query */
  setSearch: (search: string | null) => void;
  /** Current layout view */
  layout: string;
  /** Set layout view */
  setLayout: (layout: string) => void;
  /** Layout-specific options */
  layoutOptions: Record<string, unknown>;
  /** Set layout options */
  setLayoutOptions: (options: Record<string, unknown>) => void;
  /** Layout query parameters */
  layoutQuery: Query;
  /** Set layout query */
  setLayoutQuery: (query: Query) => void;
  /** Reset all preset values */
  resetPreset: () => void;
  /** Clear only filters and search */
  clearFilters: () => void;
  /** Whether preset has any active filters */
  hasFilters: boolean;
  /** Combined query object for API calls */
  query: Query;
}

/**
 * Hook to manage collection presets (filters, search, layout options)
 * Similar to Directus usePreset composable
 * 
 * @example
 * ```tsx
 * const { filter, setFilter, search, setSearch, layout, query } = usePreset({ 
 *   collection: 'articles' 
 * });
 * 
 * // Use query for API calls
 * const { data } = useItems({ collection: 'articles', query });
 * ```
 */
export function usePreset(options: UsePresetOptions): UsePresetReturn {
  const { collection, initialLayout = 'table', persist = false } = options;

  // Storage key for persistence
  const storageKey = persist ? `preset_${collection}` : null;

  // Load initial state from localStorage if persist is enabled
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (!persist || typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem(`${storageKey}_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [filter, setFilterState] = useState<Filter | null>(() => getInitialState('filter', null));
  const [search, setSearchState] = useState<string | null>(() => getInitialState('search', null));
  const [layout, setLayoutState] = useState<string>(() => getInitialState('layout', initialLayout));
  const [layoutOptions, setLayoutOptionsState] = useState<Record<string, unknown>>(() => 
    getInitialState('layoutOptions', {})
  );
  const [layoutQuery, setLayoutQueryState] = useState<Query>(() => 
    getInitialState('layoutQuery', {})
  );

  // Persist helper
  const persistValue = useCallback(<T,>(key: string, value: T) => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${storageKey}_${key}`, JSON.stringify(value));
      } catch {
        // Ignore storage errors
      }
    }
  }, [storageKey]);

  const setFilter = useCallback((newFilter: Filter | null) => {
    setFilterState(newFilter);
    persistValue('filter', newFilter);
  }, [persistValue]);

  const setSearch = useCallback((newSearch: string | null) => {
    setSearchState(newSearch);
    persistValue('search', newSearch);
  }, [persistValue]);

  const setLayout = useCallback((newLayout: string) => {
    setLayoutState(newLayout);
    persistValue('layout', newLayout);
  }, [persistValue]);

  const setLayoutOptions = useCallback((options: Record<string, unknown>) => {
    setLayoutOptionsState(options);
    persistValue('layoutOptions', options);
  }, [persistValue]);

  const setLayoutQuery = useCallback((query: Query) => {
    setLayoutQueryState(query);
    persistValue('layoutQuery', query);
  }, [persistValue]);

  const resetPreset = useCallback(() => {
    setFilterState(null);
    setSearchState(null);
    setLayoutOptionsState({});
    setLayoutQueryState({});
    
    if (storageKey && typeof window !== 'undefined') {
      ['filter', 'search', 'layoutOptions', 'layoutQuery'].forEach(key => {
        localStorage.removeItem(`${storageKey}_${key}`);
      });
    }
  }, [storageKey]);

  const clearFilters = useCallback(() => {
    setFilterState(null);
    setSearchState(null);
    persistValue('filter', null);
    persistValue('search', null);
  }, [persistValue]);

  const hasFilters = useMemo(() => {
    return filter !== null || (search !== null && search.length > 0);
  }, [filter, search]);

  // Build combined query object
  const query = useMemo((): Query => {
    return {
      ...layoutQuery,
      filter: filter ?? undefined,
      search: search ?? undefined,
    };
  }, [filter, search, layoutQuery]);

  return {
    filter,
    setFilter,
    search,
    setSearch,
    layout,
    setLayout,
    layoutOptions,
    setLayoutOptions,
    layoutQuery,
    setLayoutQuery,
    resetPreset,
    clearFilters,
    hasFilters,
    query,
  };
}
