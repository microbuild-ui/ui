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
} from '@tabler/icons-react';
import { useWorkflow } from './use-workflow';
import type { WorkflowButtonProps, CommandOption } from './types';

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
 * - Support for versioned content
 *
 * @example
 * ```tsx
 * <WorkflowButton
 *   itemId="article-123"
 *   collection="articles"
 *   onChange={(value) => console.log('New state:', value)}
 *   onTransition={() => console.log('Transition complete')}
 * />
 * ```
 */
export function WorkflowButton({
  disabled = false,
  placeholder = 'Initial State',
  choices = [],
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
  const [menuOpened, setMenuOpened] = useState(false);
  const [terminated, setTerminated] = useState(false);

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
    </div>
  );
}

export default WorkflowButton;
