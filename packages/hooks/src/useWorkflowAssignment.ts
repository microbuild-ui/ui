"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./utils";

export interface WorkflowAssignment {
  id: number | string;
  collection: string;
  workflow: string | number;
  status?: string;
}

export interface UseWorkflowAssignmentReturn {
  hasWorkflowAssignment: boolean;
  workflowAssignment: WorkflowAssignment | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check if a collection has a workflow assignment.
 * This determines whether version-based workflow is enabled for the collection.
 *
 * @param collection - The collection name to check
 * @returns Object containing workflow assignment status and data
 *
 * @example
 * ```tsx
 * const { hasWorkflowAssignment, loading } = useWorkflowAssignment('articles');
 *
 * if (hasWorkflowAssignment) {
 *   // Enable version-based editing
 * }
 * ```
 */
export function useWorkflowAssignment(
  collection: string
): UseWorkflowAssignmentReturn {
  const [workflowAssignment, setWorkflowAssignment] =
    useState<WorkflowAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflowAssignment = useCallback(async () => {
    if (!collection) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch workflow assignment for this collection
      const filter = JSON.stringify({
        collection: { _eq: collection },
      });

      const response = await apiRequest<{ data: WorkflowAssignment[] }>(
        `/api/items/xtr_wf_assignment?filter=${encodeURIComponent(filter)}&limit=1`
      );

      const assignments = response?.data || [];
      const assignment = assignments[0] as WorkflowAssignment | undefined;

      setWorkflowAssignment(assignment || null);
    } catch (err) {
      console.error("[useWorkflowAssignment] Failed to fetch:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to check workflow assignment"
      );
      setWorkflowAssignment(null);
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    fetchWorkflowAssignment();
  }, [fetchWorkflowAssignment]);

  return {
    hasWorkflowAssignment: !!workflowAssignment,
    workflowAssignment,
    loading,
    error,
    refetch: fetchWorkflowAssignment,
  };
}
