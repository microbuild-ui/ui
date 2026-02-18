'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Collection } from '@microbuild/types';

export interface CollectionTreeNode extends Collection {
  /** Display name (formatted from collection identifier) */
  name?: string;
  /** Child collections nested under this group */
  children: CollectionTreeNode[];
}

export interface UseCollectionsOptions {
  /** Include hidden collections (admin view) */
  showHidden?: boolean;
  /** Auto-expand groups containing this collection */
  currentCollection?: string;
  /** Fetch collections on mount (default: true) */
  autoFetch?: boolean;
}

export interface UseCollectionsReturn {
  /** All collections */
  collections: Collection[];
  /** Visible (non-hidden) collections */
  visibleCollections: Collection[];
  /** Root-level collections organized as tree */
  rootCollections: CollectionTreeNode[];
  /** Currently expanded group IDs */
  activeGroups: string[];
  /** Toggle a group open/closed */
  toggleGroup: (collectionId: string) => void;
  /** Set active groups directly */
  setActiveGroups: (groups: string[]) => void;
  /** Whether to show hidden collections */
  showHidden: boolean;
  /** Toggle showing hidden collections */
  setShowHidden: (show: boolean) => void;
  /** Whether there are hidden collections */
  hasHiddenCollections: boolean;
  /** Get a single collection by name */
  getCollection: (name: string) => Collection | undefined;
  /** Whether collections are loading */
  loading: boolean;
  /** Error if fetch failed */
  error: string | null;
  /** Re-fetch collections */
  refresh: () => Promise<void>;
  /** Whether search should be shown (>20 collections) */
  showSearch: boolean;
  /** Whether dense mode should be used (>5 collections) */
  dense: boolean;
}

/**
 * Hook to manage collections hierarchy for content navigation.
 * Ported from DaaS content module's useNavigation + collectionsStore.
 *
 * Fetches all collections from the API, organizes them into a tree structure,
 * and manages the expand/collapse state of collection groups.
 *
 * @example
 * ```tsx
 * const {
 *   rootCollections,
 *   activeGroups,
 *   toggleGroup,
 *   showHidden,
 *   setShowHidden,
 *   loading,
 * } = useCollections({ currentCollection: 'articles' });
 * ```
 */
export function useCollections(options: UseCollectionsOptions = {}): UseCollectionsReturn {
  const {
    showHidden: initialShowHidden = false,
    currentCollection,
    autoFetch = true,
  } = options;

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGroups, setActiveGroups] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(initialShowHidden);

  /**
   * Fetch all collections from the API
   */
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/collections');
      if (!response.ok) {
        throw new Error(`Failed to fetch collections: ${response.status}`);
      }
      const json = await response.json();
      const data: Collection[] = json.data || json || [];
      setCollections(data);

      // Auto-expand groups with collapse='open' or 'locked'
      const autoExpand = data
        .filter(
          (c) =>
            c.meta?.collapse === 'open' || c.meta?.collapse === 'locked'
        )
        .map((c) => c.collection);
      setActiveGroups((prev) => {
        const next = new Set([...prev, ...autoExpand]);
        return Array.from(next);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch collections';
      setError(message);
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Auto-expand parent groups when currentCollection changes
   */
  useEffect(() => {
    if (!currentCollection || collections.length === 0) return;

    const collectionMap = new Map(collections.map((c) => [c.collection, c]));
    const groupsToOpen: string[] = [];

    let current = collectionMap.get(currentCollection);
    while (current?.meta?.group) {
      const groupId = current.meta.group;
      if (!activeGroups.includes(groupId)) {
        groupsToOpen.push(groupId);
      }
      current = collectionMap.get(groupId);
    }

    if (groupsToOpen.length > 0) {
      setActiveGroups((prev) => [...prev, ...groupsToOpen]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCollection, collections]);

  useEffect(() => {
    if (autoFetch) {
      fetchCollections();
    }
  }, [autoFetch, fetchCollections]);

  /** Visible (non-hidden) collections */
  const visibleCollections = useMemo(
    () => collections.filter((c) => !c.meta?.hidden),
    [collections]
  );

  /** Build tree structure */
  const rootCollections = useMemo(() => {
    const source = showHidden ? collections : visibleCollections;

    /** Format a collection identifier into a display name */
    function formatName(collection: string): string {
      return collection
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Sort by meta.sort then collection name
    const sorted = [...source].sort((a, b) => {
      const sortA = a.meta?.sort ?? 999;
      const sortB = b.meta?.sort ?? 999;
      if (sortA !== sortB) return sortA - sortB;
      return a.collection.localeCompare(b.collection);
    });

    const childrenMap = new Map<string, CollectionTreeNode[]>();

    // Group children by parent
    for (const col of sorted) {
      const group = col.meta?.group ?? null;
      if (group) {
        const siblings = childrenMap.get(group) || [];
        siblings.push({ ...col, name: formatName(col.collection), children: [] });
        childrenMap.set(group, siblings);
      }
    }

    // Recursive build
    function buildTree(node: CollectionTreeNode): CollectionTreeNode {
      const children = childrenMap.get(node.collection) || [];
      return {
        ...node,
        children: children.map(buildTree),
      };
    }

    // Root = no group parent
    const roots = sorted
      .filter((c) => !c.meta?.group)
      .map((c) => buildTree({ ...c, name: formatName(c.collection), children: [] }));

    return roots;
  }, [collections, visibleCollections, showHidden]);

  /** Toggle group expand/collapse */
  const toggleGroup = useCallback(
    (collectionId: string) => {
      // Check if group is locked open
      const col = collections.find((c) => c.collection === collectionId);
      if (col?.meta?.collapse === 'locked') return;

      setActiveGroups((prev) =>
        prev.includes(collectionId)
          ? prev.filter((id) => id !== collectionId)
          : [...prev, collectionId]
      );
    },
    [collections]
  );

  /** Get a collection by name */
  const getCollection = useCallback(
    (name: string) => collections.find((c) => c.collection === name),
    [collections]
  );

  const hasHiddenCollections = useMemo(
    () => collections.length > visibleCollections.length,
    [collections, visibleCollections]
  );

  const showSearch = visibleCollections.length > 20;
  const dense = visibleCollections.length > 5;

  return {
    collections,
    visibleCollections,
    rootCollections,
    activeGroups,
    toggleGroup,
    setActiveGroups,
    showHidden,
    setShowHidden,
    hasHiddenCollections,
    getCollection,
    loading,
    error,
    refresh: fetchCollections,
    showSearch,
    dense,
  };
}
