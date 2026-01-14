import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  UseWorkflowOptions,
  UseWorkflowReturn,
  WorkflowInstance,
  WorkflowState,
  WorkflowCommand,
  CommandOption,
} from './types';

// Default API client using fetch
const defaultApiClient = {
  get: async (url: string, config?: { params?: Record<string, unknown> }) => {
    const params = new URLSearchParams();
    if (config?.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
    }
    const queryString = params.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    const response = await fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return { data: await response.json() };
  },
  post: async (url: string, data?: unknown) => {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return { data: await response.json() };
  },
};

/**
 * useWorkflow Hook
 *
 * A React hook for managing workflow state transitions.
 * Fetches workflow instance, commands, and handles transitions.
 *
 * Features:
 * - Automatic workflow instance fetching
 * - Policy-based command filtering
 * - Transition execution with automatic state refresh
 * - Support for versioned content and translations
 *
 * @param options - Hook configuration options
 * @returns Workflow state and actions
 *
 * @example
 * ```tsx
 * const {
 *   workflowInstance,
 *   commands,
 *   loading,
 *   executeTransition,
 * } = useWorkflow({
 *   itemId: 'article-123',
 *   collection: 'articles',
 * });
 *
 * // Execute a transition
 * await executeTransition('Submit');
 * ```
 */
export function useWorkflow(options: UseWorkflowOptions): UseWorkflowReturn {
  const {
    itemId,
    collection,
    versionKey: initialVersionKey,
    translationId: initialTranslationId,
    apiClient = defaultApiClient,
  } = options;

  const [workflowInstance, setWorkflowInstance] = useState<WorkflowInstance | null>(null);
  const [workflowInstanceId, setWorkflowInstanceId] = useState<number | null>(null);
  const [commands, setCommands] = useState<CommandOption[]>([]);
  const [transitionCount, setTransitionCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user policies
  const fetchUserPolicies = useCallback(async (): Promise<{ policy: string }[]> => {
    try {
      const response = await apiClient.get('/api/users/me');
      const data = response.data.data as { policies?: string[] };
      const policyIds = data.policies || [];

      if (policyIds.length === 0) {
        return [];
      }

      const policiesResponse = await apiClient.get('/api/access', {
        params: {
          filter: {
            id: { _in: policyIds },
          },
        },
      });

      return policiesResponse.data.data as { policy: string }[];
    } catch (error) {
      console.error('Error fetching user policies:', error);
      return [];
    }
  }, [apiClient]);

  // Fetch workflow instance
  const fetchWorkflowInstance = useCallback(
    async (versionKey?: string, translationId?: string) => {
      if (!itemId || !collection) {
        setWorkflowInstance(null);
        setWorkflowInstanceId(null);
        setCommands([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        // Determine which ID to use for the query
        const queryItemId = translationId || initialTranslationId || itemId;

        // Use passed versionKey, or fall back to initial version
        const requestedVersion = versionKey ?? initialVersionKey;

        // Build filter object
        const filter: Record<string, unknown> = {
          item_id: queryItemId,
        };
        if (requestedVersion) {
          filter.version_key = requestedVersion;
        }

        const response = await apiClient.get('/api/items/xtr_wf_instance', {
          params: {
            filter: JSON.stringify(filter),
            fields:
              'id,archived,collection,current_state,date_created,date_updated,item_id,revision_id,team,terminated,unpublished,user_created,user_updated,version_key,workflow.*',
          },
        });

        const instances = response.data.data as WorkflowInstance[];
        const instance = instances?.[0];

        if (instance) {
          // Check if workflow_json exists and is valid
          if (!instance.workflow?.workflow_json) {
            setErrorMessage('Workflow configuration is missing');
            setWorkflowInstance(null);
            setWorkflowInstanceId(null);
            setCommands([]);
            setLoading(false);
            return;
          }

          const workflowJson =
            typeof instance.workflow.workflow_json === 'string'
              ? JSON.parse(instance.workflow.workflow_json)
              : instance.workflow.workflow_json;

          // Fetch user policies
          const policies = await fetchUserPolicies();
          const policyIds = policies.map((policy) => policy.policy);

          // Store workflow instance
          setWorkflowInstanceId(instance.id);
          setWorkflowInstance(instance);

          // Get commands for the current state
          const workflowCommands: WorkflowCommand[] =
            workflowJson.states.find(
              (state: WorkflowState) => state.name === instance.current_state
            )?.commands || [];

          // Filter commands based on user policies
          const filteredCommands = workflowCommands.filter((command) => {
            if (command.policies.length === 0) return true;
            return command.policies?.some((policyId) => policyIds.includes(policyId));
          });

          // Populate the command options
          setCommands(
            filteredCommands.map((command) => ({
              text: `${command.name} -> ${command.next_state || 'Unknown'}`,
              value: command.name,
              command: command.name || 'Unknown Command',
              nextState: command.next_state || 'Unknown State',
            }))
          );
        } else {
          setErrorMessage('');
          setWorkflowInstance(null);
          setWorkflowInstanceId(null);
          setCommands([]);
        }
      } catch (error) {
        console.error('Failed to fetch workflow instance:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Fetch error');
        setWorkflowInstance(null);
        setWorkflowInstanceId(null);
        setCommands([]);
      } finally {
        setLoading(false);
      }
    },
    [itemId, collection, fetchUserPolicies, initialVersionKey, initialTranslationId, apiClient]
  );

  // Execute a workflow transition
  const executeTransition = useCallback(
    async (commandName: string | number, workflowField: string = 'status') => {
      if (!workflowInstanceId) {
        throw new Error('No workflow instance available');
      }

      await apiClient.post('/api/workflow/transition', {
        workflowInstanceId: workflowInstanceId,
        commandName: commandName,
        workflowField: workflowField,
      });

      // Refetch the workflow instance
      await fetchWorkflowInstance();

      // Increment transition count to notify parent components
      setTransitionCount((prev) => prev + 1);
    },
    [workflowInstanceId, apiClient, fetchWorkflowInstance]
  );

  const clearError = useCallback(() => {
    setErrorMessage('');
  }, []);

  const notifyTransitionComplete = useCallback(() => {
    setTransitionCount((prev) => prev + 1);
  }, []);

  // Auto-fetch workflow instance when dependencies change
  useEffect(() => {
    if (itemId && collection) {
      fetchWorkflowInstance();
    }
  }, [itemId, collection, initialVersionKey, fetchWorkflowInstance]);

  return useMemo(
    () => ({
      workflowInstance,
      workflowInstanceId,
      commands,
      errorMessage,
      loading,
      transitionCount,
      fetchWorkflowInstance,
      fetchUserPolicies,
      clearError,
      notifyTransitionComplete,
      executeTransition,
    }),
    [
      workflowInstance,
      workflowInstanceId,
      commands,
      errorMessage,
      loading,
      transitionCount,
      fetchWorkflowInstance,
      fetchUserPolicies,
      clearError,
      notifyTransitionComplete,
      executeTransition,
    ]
  );
}
