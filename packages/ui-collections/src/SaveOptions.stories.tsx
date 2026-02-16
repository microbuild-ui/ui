import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Group, Text, Paper, Stack } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { SaveOptions } from './SaveOptions';
import type { SaveAction } from './SaveOptions';

// ============================================================================
// Helper — save button group (SaveOptions is always used alongside a button)
// ============================================================================

function SaveButtonGroup({
  saving = false,
  hasEdits = true,
  isNew = false,
  disabledOptions,
  platform,
  disabled,
}: {
  saving?: boolean;
  hasEdits?: boolean;
  isNew?: boolean;
  disabledOptions?: SaveAction[];
  platform?: 'mac' | 'win';
  disabled?: boolean;
}) {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <Stack gap="md" align="flex-start">
      <Group gap={0}>
        <Button
          leftSection={<IconCheck size={16} />}
          size="sm"
          loading={saving}
          disabled={!hasEdits || disabled}
          onClick={() => setLastAction('save (primary)')}
          style={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          Save
        </Button>
        <SaveOptions
          onSaveAndStay={() => setLastAction('save-and-stay')}
          onSaveAndAddNew={() => setLastAction('save-and-add-new')}
          onSaveAsCopy={() => setLastAction('save-as-copy')}
          onDiscardAndStay={() => setLastAction('discard-and-stay')}
          disabledOptions={disabledOptions ?? (isNew ? ['save-as-copy'] : [])}
          disabled={disabled}
          platform={platform}
        />
      </Group>
      {lastAction && (
        <Paper p="xs" withBorder>
          <Text size="sm" c="dimmed">
            Last action: <Text span fw={600}>{lastAction}</Text>
          </Text>
        </Paper>
      )}
    </Stack>
  );
}

// ============================================================================
// Meta
// ============================================================================

const meta = {
  title: 'Collections/SaveOptions',
  component: SaveOptions,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dropdown menu for additional save actions — save & stay, save & create new, ' +
          'save as copy, discard changes. Designed to be placed next to a primary save button. ' +
          'Shows keyboard shortcuts (platform-aware ⌘/Ctrl).',
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    platform: {
      control: 'select',
      options: ['mac', 'win'],
      description: 'Force keyboard shortcut style',
    },
  },
} satisfies Meta<typeof SaveOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Stories
// ============================================================================

/**
 * Default save options — all actions available (edit mode).
 * Click the dropdown arrow to see the menu.
 */
export const Default: Story = {
  render: (args) => (
    <SaveButtonGroup
      platform={args.platform}
      disabled={args.disabled}
    />
  ),
  args: {
    disabled: false,
  },
};

/**
 * Create mode — "Save as Copy" is disabled since there's no existing item.
 */
export const CreateMode: Story = {
  render: () => <SaveButtonGroup isNew />,
};

/**
 * Disabled state — no unsaved changes, entire menu trigger is disabled.
 */
export const Disabled: Story = {
  render: () => <SaveButtonGroup hasEdits={false} disabled />,
};

/**
 * Windows shortcuts — shows Ctrl instead of ⌘.
 */
export const WindowsShortcuts: Story = {
  render: () => <SaveButtonGroup platform="win" />,
};

/**
 * Mac shortcuts — shows ⌘ (explicit).
 */
export const MacShortcuts: Story = {
  render: () => <SaveButtonGroup platform="mac" />,
};

/**
 * All options disabled — e.g. when the user doesn't have write permission.
 */
export const AllDisabled: Story = {
  render: () => (
    <SaveButtonGroup
      disabledOptions={['save-and-stay', 'save-and-add-new', 'save-as-copy', 'discard-and-stay']}
    />
  ),
};

/**
 * Saving state — primary button shows spinner.
 */
export const Saving: Story = {
  render: () => <SaveButtonGroup saving />,
};
