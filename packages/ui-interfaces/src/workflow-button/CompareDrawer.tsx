import React from 'react';
import {
  Drawer,
  Group,
  Text,
  ActionIcon,
  ScrollArea,
  Alert,
  Stack,
} from '@mantine/core';
import { IconGitCompare, IconX } from '@tabler/icons-react';
import { RevisionsDrawerUpdates } from './RevisionsDrawerUpdates';
import type { Revision, WorkflowInstance } from './types';

export interface CompareDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback to change open state */
  onOpenChange: (open: boolean) => void;
  /** Current revision data */
  currentRevision: Revision | null;
  /** Previous revision data for comparison */
  previousRevision: Revision | null;
  /** Current workflow instance */
  workflowInstance: WorkflowInstance | null;
  /** Error message if any */
  errorMessage?: string;
}

/**
 * CompareDrawer Component
 *
 * A drawer that displays revision comparison between current and published state.
 * Shows field-by-field differences with visual diff formatting.
 */
export function CompareDrawer({
  open,
  onOpenChange,
  currentRevision,
  previousRevision,
  workflowInstance,
  errorMessage,
}: CompareDrawerProps) {
  // Get the compare state name from workflow
  const compareStateName = React.useMemo(() => {
    if (!workflowInstance?.workflow?.workflow_json) return 'Published';
    try {
      const workflowJson = JSON.parse(workflowInstance.workflow.workflow_json);
      return workflowJson.compare_rollback_state || 'Published';
    } catch {
      return 'Published';
    }
  }, [workflowInstance]);

  return (
    <Drawer
      opened={open}
      onClose={() => onOpenChange(false)}
      title={
        <Group gap="xs">
          <IconGitCompare size={20} />
          <Text fw={500}>Item Revision</Text>
        </Group>
      }
      position="right"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.5, blur: 2 }}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Last <Text span fw={600}>{compareStateName}</Text> State vs Current
          </Text>
          <ActionIcon
            variant="subtle"
            onClick={() => onOpenChange(false)}
            aria-label="Close drawer"
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>

        <ScrollArea h="calc(100vh - 180px)" offsetScrollbars>
          <Stack gap="md">
            {errorMessage ? (
              <Alert color="red" title="Error">
                {errorMessage}
              </Alert>
            ) : currentRevision && previousRevision ? (
              <RevisionsDrawerUpdates
                revision={currentRevision}
                revisions={[currentRevision, previousRevision]}
              />
            ) : (
              <Alert color="gray">
                No changes detected between published and current state.
              </Alert>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Drawer>
  );
}

export default CompareDrawer;
