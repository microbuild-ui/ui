"use client";

/**
 * useVersions - Hook for managing content versions
 *
 * Provides CRUD operations for content versions including:
 * - Fetching versions for an item
 * - Creating new versions (triggers workflow via DaaS hooks)
 * - Saving version changes
 * - Deleting versions
 * 
 * Framework-agnostic: Accepts router and searchParams as options for navigation.
 */

import * as React from "react";
import { apiRequest } from "./utils";

export interface ContentVersion {
  id: string;
  key: string;
  name: string | null;
  collection: string;
  item: string;
  hash: string | null;
  delta: Record<string, unknown> | null;
  date_created: string;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
}

export interface UseVersionsOptions {
  /** Router for navigation (framework-specific) */
  router?: {
    push: (url: string) => void;
  };
  /** Search params for URL query (framework-specific) */
  searchParams?: URLSearchParams | { get: (key: string) => string | null; toString: () => string };
}

export interface UseVersionsReturn {
  versions: ContentVersion[] | null;
  currentVersion: ContentVersion | null;
  loading: boolean;
  createVersion: (name?: string) => Promise<ContentVersion>;
  updateVersion: (id: string, data: Partial<ContentVersion>) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  saveVersion: (edits: Record<string, unknown>) => Promise<void>;
  saveVersionLoading: boolean;
  refetchVersions: () => Promise<void>;
}

/**
 * Normalize payload - convert empty strings to null to prevent UUID validation errors
 */
function normalizePayload(
  data: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === "") {
      result[key] = null;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = normalizePayload(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Hook for managing content versions
 * 
 * @param collection - The collection name
 * @param itemId - The item ID to fetch versions for
 * @param options - Options including router and searchParams for navigation
 * 
 * @example
 * ```tsx
 * // Next.js usage
 * import { useRouter, useSearchParams } from 'next/navigation';
 * 
 * const router = useRouter();
 * const searchParams = useSearchParams();
 * const { versions, createVersion } = useVersions('articles', itemId, { router, searchParams });
 * ```
 */
export function useVersions(
  collection: string,
  itemId: string | null,
  options?: UseVersionsOptions
): UseVersionsReturn {
  const { router, searchParams } = options || {};
  const [versions, setVersions] = React.useState<ContentVersion[] | null>(null);
  const [currentVersion, setCurrentVersion] =
    React.useState<ContentVersion | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saveVersionLoading, setSaveVersionLoading] = React.useState(false);

  // Get version key from URL
  const versionKey = searchParams?.get?.("version") ?? null;

  // Fetch all versions for this item
  const fetchVersions = React.useCallback(async () => {
    if (!itemId) {
      setVersions(null);
      setCurrentVersion(null);
      return;
    }

    setLoading(true);
    try {
      const filter = JSON.stringify({
        collection: { _eq: collection },
        item: { _eq: itemId },
      });

      const response = await apiRequest<{ data: ContentVersion[] }>(
        `/api/versions?filter=${encodeURIComponent(
          filter
        )}&sort=date_created&fields=*`
      );

      const fetchedVersions = response.data || [];
      setVersions(fetchedVersions);

      // Set current version based on URL param
      if (versionKey) {
        const version = fetchedVersions.find((v) => v.key === versionKey);
        setCurrentVersion(version || null);
      } else {
        setCurrentVersion(null);
      }
    } catch (error) {
      console.error("Failed to fetch versions:", error);
      setVersions(null);
      setCurrentVersion(null);
    } finally {
      setLoading(false);
    }
  }, [collection, itemId, versionKey]);

  // Create a new version
  // This triggers the versions.create hook in DaaS which creates workflow instance
  const createVersion = React.useCallback(
    async (name?: string): Promise<ContentVersion> => {
      if (!itemId) {
        throw new Error("Item ID is required to create a version");
      }

      try {
        // Calculate new version number
        const newVersionNumber = versions ? String(versions.length + 1) : "1";

        // POST to /api/versions - DaaS will trigger versions.create hook
        // which automatically creates workflow instance
        const response = await apiRequest<{ data: ContentVersion }>(
          "/api/versions",
          {
            method: "POST",
            body: JSON.stringify({
              key: newVersionNumber,
              name: name || newVersionNumber,
              collection,
              item: String(itemId),
            }),
          }
        );

        const newVersion = response.data;

        // Update versions list
        await fetchVersions();

        // Navigate to new version (if router is provided)
        if (router && searchParams) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("version", newVersion.key);
          router.push(`?${params.toString()}`);
        }

        return newVersion;
      } catch (error) {
        console.error("Failed to create version:", error);
        throw error;
      }
    },
    [collection, itemId, versions, fetchVersions, router, searchParams]
  );

  // Update a version
  const updateVersion = React.useCallback(
    async (id: string, data: Partial<ContentVersion>) => {
      try {
        const normalizedData = normalizePayload(
          data as Record<string, unknown>
        );
        await apiRequest(`/api/versions/${id}`, {
          method: "PATCH",
          body: JSON.stringify(normalizedData),
        });
        await fetchVersions();
      } catch (error) {
        console.error("Failed to update version:", error);
        throw error;
      }
    },
    [fetchVersions]
  );

  // Delete a version
  const deleteVersion = React.useCallback(
    async (id: string) => {
      try {
        await apiRequest(`/api/versions/${id}`, {
          method: "DELETE",
        });
        await fetchVersions();

        // If deleted version was current, navigate to main (if router is provided)
        if (currentVersion?.id === id && router && searchParams) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("version");
          router.push(`?${params.toString()}`);
        }
      } catch (error) {
        console.error("Failed to delete version:", error);
        throw error;
      }
    },
    [fetchVersions, currentVersion, router, searchParams]
  );

  // Save current version with edits payload
  // This saves the version delta, does NOT update the main item
  const saveVersion = React.useCallback(
    async (edits: Record<string, unknown>) => {
      if (!currentVersion || !itemId) return;

      setSaveVersionLoading(true);
      try {
        const normalizedEdits = normalizePayload(edits);
        await apiRequest(`/api/versions/${currentVersion.id}/save`, {
          method: "POST",
          body: JSON.stringify(normalizedEdits),
        });
        await fetchVersions();
      } catch (error) {
        console.error("Failed to save version:", error);
        throw error;
      } finally {
        setSaveVersionLoading(false);
      }
    },
    [currentVersion, itemId, fetchVersions]
  );

  // Fetch versions on mount and when dependencies change
  React.useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return {
    versions,
    currentVersion,
    loading,
    createVersion,
    updateVersion,
    deleteVersion,
    saveVersion,
    saveVersionLoading,
    refetchVersions: fetchVersions,
  };
}
