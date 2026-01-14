import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Menu,
  Group,
  Text,
  Loader,
  Alert,
  Badge,
  Tooltip,
} from '@mantine/core';
import {
  IconChevronDown,
  IconArrowRight,
  IconAlertCircle,
  IconGitCompare,
} from '@tabler/icons-react';
import { useWorkflow } from './useWorkflow';
import { CompareDrawer } from './CompareDrawer';
import type { WorkflowButtonProps, CommandOption, Revision } from './types';

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
 * WorkflowButton Interface Component
 *
 * A comprehensive workflow state button with transition capabilities.
 * Displays current state and provides a dropdown menu for available transitions.
 *
 * Features:
 * - Automatic workflow instance fetching
 * - Policy-based command filtering
 * - Transition execution with state refresh
 * - Revision comparison (optional)
 * - Support for versioned content
 *
 * @example
 * ```tsx
 * <WorkflowButton
 *   itemId="article-123"
 *   collection="articles"
 *   canCompare={true}
 *   onChange={(value) => console.log('New state:', value)}
 *   onTransition={() => console.log('Transition complete')}
 * />
 * ```
 */
export function WorkflowButton({
  disabled = false,
  placeholder = 'Initial State',
  choices = [],
  canCompare = false,
  alwaysVisible = true,
  workflowField = 'status',
  itemId,
  collection,
  versionKey,
  translationId,
  onChange,
  onTransition,
}: WorkflowButtonProps) {
  // Use workflow hook
  const {
    workflowInstance,
    workflowInstanceId,
    commands: contextCommands,
    errorMessage,
    loading,
    fetchWorkflowInstance,
    executeTransition,
  } = useWorkflow({
    itemId,
    collection,
    versionKey,
    translationId,
    apiClient: defaultApiClient,
  });

  const [currentState, setCurrentState] = useState<CommandOption | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [compareActive, setCompareActive] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const [terminated, setTerminated] = useState(false);

  // Revision comparison state
  const [syntheticCurrentRevision, setSyntheticCurrentRevision] = useState<Revision | null>(null);
  const [syntheticPreviousRevision, setSyntheticPreviousRevision] = useState<Revision | null>(null);
  const [compareError, setCompareError] = useState('');

  // Combined commands from workflow context + additional choices
  const commands = useMemo(() => {
    if (!choices?.length) {
      return [...contextCommands];
    }
    return [...contextCommands, ...choices];
  }, [contextCommands, choices]);

  // Update current state when workflow instance changes
  useEffect(() => {
    if (workflowInstance) {
      setCurrentState({
        text: workflowInstance.current_state || 'Unknown',
        value: workflowInstance.current_state || '',
        command: '',
        nextState: '',
      });
      setTerminated(workflowInstance.terminated || false);
    } else {
      setCurrentState(null);
      setTerminated(false);
    }
  }, [workflowInstance]);

  // Handle transition selection
  const handleSelection = useCallback(
    async (selectedCommand: string | number) => {
      setTransitioning(true);
      setMenuOpened(false);

      try {
        await executeTransition(selectedCommand, workflowField);

        // Call callbacks
        onChange?.(String(selectedCommand));
        onTransition?.();
      } catch (error) {
        console.error('Failed to perform action:', error);
      } finally {
        setTransitioning(false);
      }
    },
    [executeTransition, workflowField, onChange, onTransition]
  );

  // Apply delta to data object
  const applyDelta = useCallback(
    (baseData: Record<string, unknown>, delta: Record<string, unknown>): Record<string, unknown> => {
      const result = { ...baseData };
      for (const key in delta) {
        result[key] = delta[key];
      }
      return result;
    },
    []
  );

  // Compute differences between two data objects
  const computeDifferences = useCallback(
    (
      baseData: Record<string, unknown>,
      finalData: Record<string, unknown>
    ): Record<string, { oldValue: unknown; newValue: unknown }> => {
      const diff: Record<string, { oldValue: unknown; newValue: unknown }> = {};
      const allKeys = new Set([...Object.keys(baseData), ...Object.keys(finalData)]);

      for (const key of allKeys) {
        const oldValue = baseData[key];
        const newValue = finalData[key];

        if (oldValue !== newValue) {
          diff[key] = { oldValue, newValue };
        }
      }

      return diff;
    },
    []
  );

  // Handle compare button click
  const handleCompare = useCallback(async () => {
    setCompareError('');
    setSyntheticCurrentRevision(null);
    setSyntheticPreviousRevision(null);

    try {
      if (!itemId || !collection) {
        throw new Error('Invalid item ID or collection');
      }

      const latestRevisionId = workflowInstance?.revision_id;

      if (!latestRevisionId) {
        throw new Error('Missing latest revision ID');
      }

      // Fetch the published revision
      const publishedResponse = await defaultApiClient.get('/api/revisions', {
        params: {
          filter: {
            collection: { _eq: collection },
            item: { _eq: itemId },
            id: { _eq: latestRevisionId },
          },
          limit: 1,
          fields: ['*'],
        },
      });

      const publishedData = publishedResponse.data.data as Revision[];
      const publishedRevision = publishedData[0];

      if (!publishedRevision) {
        throw new Error('No published revision found');
      }

      // Fetch subsequent revisions
      const subsequentResponse = await defaultApiClient.get('/api/revisions', {
        params: {
          filter: {
            _and: [
              { collection: { _eq: collection } },
              { item: { _eq: itemId } },
              { id: { _gt: latestRevisionId } },
            ],
          },
          sort: 'id',
          fields: ['*'],
        },
      });

      const subsequentRevisions = subsequentResponse.data.data as Revision[];

      // Apply all deltas to get accumulated data
      let accumulatedData = { ...publishedRevision.data };

      subsequentRevisions.forEach((rev) => {
        if (rev.delta) {
          accumulatedData = applyDelta(accumulatedData as Record<string, unknown>, rev.delta);
        }
      });

      // Compute differences
      const differences = computeDifferences(
        publishedRevision.data as Record<string, unknown>,
        accumulatedData as Record<string, unknown>
      );

      if (Object.keys(differences).length === 0) {
        // No changes detected
        setSyntheticCurrentRevision(null);
        setSyntheticPreviousRevision(null);
      } else {
        // Construct synthetic delta
        const differencesAsDelta: Record<string, unknown> = {};
        Object.entries(differences).forEach(([field, { newValue }]) => {
          differencesAsDelta[field] = newValue;
        });

        // Create synthetic revisions
        const syntheticFinalId = Date.now();

        setSyntheticCurrentRevision({
          id: syntheticFinalId,
          collection,
          item: itemId,
          data: accumulatedData as Record<string, unknown>,
          delta: differencesAsDelta,
          activity: {} as Revision['activity'],
        });

        setSyntheticPreviousRevision(publishedRevision);
      }

      setCompareActive(true);
    } catch (error) {
      console.error('Error in handleCompare:', error);
      setCompareError(error instanceof Error ? error.message : 'Unexpected error');
      setCompareActive(true);
    }
  }, [itemId, collection, workflowInstance, applyDelta, computeDifferences]);

  if (loading) {
    return (
      <Group gap="xs">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Loading workflow...
        </Text>
      </Group>
    );
  }

  // Hide if not always visible and no workflow instance exists
  if (!alwaysVisible && !workflowInstance) {
    return null;
  }

  // Hide if not always visible and terminated
  if (!alwaysVisible && currentState && terminated) {
    return null;
  }

  return (
    <div>
      <Group gap="sm" mb={errorMessage ? 'sm' : 0}>
        {workflowInstance ? (
          <Tooltip
            label="You have unsaved edits"
            disabled={!disabled}
            withArrow
          >
            <div>
              <Menu
                opened={menuOpened}
                onChange={setMenuOpened}
                shadow="md"
                width={320}
              >
                <Menu.Target>
                  <Button
                    disabled={disabled || transitioning || commands.length === 0}
                    rightSection={
                      commands.length > 0 && !transitioning ? (
                        <IconChevronDown size={16} />
                      ) : null
                    }
                    loading={transitioning}
                    style={{ minWidth: 180 }}
                  >
                    {transitioning ? 'Processing...' : currentState?.text || placeholder}
                  </Button>
                </Menu.Target>

                {commands.length > 0 && (
                  <Menu.Dropdown>
                    {commands.map((command) => (
                      <Menu.Item
                        key={String(command.value)}
                        onClick={() => handleSelection(command.value)}
                        rightSection={
                          <Group gap="xs">
                            <IconArrowRight size={14} />
                            <Badge size="sm" variant="light">
                              {command.nextState}
                            </Badge>
                          </Group>
                        }
                      >
                        <Text fw={500}>{command.command}</Text>
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                )}
              </Menu>
            </div>
          </Tooltip>
        ) : (
          <Text size="sm" c="dimmed">
            {placeholder}
          </Text>
        )}

        {/* Compare button */}
        {canCompare && workflowInstance && (
          <Button
            variant="outline"
            onClick={handleCompare}
            leftSection={<IconGitCompare size={16} />}
          >
            Compare
          </Button>
        )}
      </Group>

      {errorMessage && (
        <Alert
          color="red"
          icon={<IconAlertCircle size={16} />}
          mt="sm"
        >
          {errorMessage}
        </Alert>
      )}

      {/* Compare Drawer */}
      <CompareDrawer
        open={compareActive}
        onOpenChange={setCompareActive}
        currentRevision={syntheticCurrentRevision}
        previousRevision={syntheticPreviousRevision}
        workflowInstance={workflowInstance}
        errorMessage={compareError}
      />
    </div>
  );
}

export default WorkflowButton;
