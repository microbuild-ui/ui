import React from 'react';
import { Text, Stack, Box } from '@mantine/core';
import {
  IconPlus,
  IconMinus,
  IconAlertTriangle,
} from '@tabler/icons-react';
import type { Change } from './types';

export interface RevisionChangeLineProps {
  /** Array of changes to display */
  changes: Change[];
  /** Type of change */
  type: 'added' | 'deleted' | 'updated';
}

/**
 * RevisionChangeLine Component
 *
 * Displays a single line of revision changes with appropriate styling.
 * Shows additions in green, deletions in red, and updates in amber.
 */
export function RevisionChangeLine({ changes, type }: RevisionChangeLineProps) {
  // Filter changes based on type
  const filteredChanges = React.useMemo(() => {
    return changes.filter((change) => {
      if (type === 'updated') return true;
      if (type === 'added') return change.removed !== true;
      return change.added !== true;
    });
  }, [changes, type]);

  // Check if the whole value changed (before/after pattern)
  const isWholeThing = changes.length === 2;

  const Icon = type === 'added' ? IconPlus : type === 'deleted' ? IconMinus : IconAlertTriangle;

  const getBackgroundColor = () => {
    switch (type) {
      case 'added':
        return 'var(--mantine-color-green-0)';
      case 'deleted':
        return 'var(--mantine-color-red-0)';
      case 'updated':
        return 'var(--mantine-color-yellow-0)';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'added':
        return 'var(--mantine-color-green-7)';
      case 'deleted':
        return 'var(--mantine-color-red-7)';
      case 'updated':
        return 'var(--mantine-color-yellow-7)';
    }
  };

  const getHighlightColor = () => {
    switch (type) {
      case 'added':
        return 'var(--mantine-color-green-2)';
      case 'deleted':
        return 'var(--mantine-color-red-2)';
      default:
        return 'transparent';
    }
  };

  const getBorderRadius = () => {
    switch (type) {
      case 'added':
        return '0 0 var(--mantine-radius-sm) var(--mantine-radius-sm)';
      case 'deleted':
        return 'var(--mantine-radius-sm) var(--mantine-radius-sm) 0 0';
      default:
        return 'var(--mantine-radius-sm)';
    }
  };

  return (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        padding: '8px 12px 8px 40px',
        borderRadius: getBorderRadius(),
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
      }}
    >
      <Icon
        size={16}
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
        }}
      />
      <Text size="sm" style={{ wordBreak: 'break-word' }}>
        {filteredChanges.map((part, index) => (
          <span
            key={index}
            style={{
              ...((!isWholeThing && (part.added || part.removed)) && {
                margin: '0 2px',
                padding: '0 2px',
                borderRadius: 2,
                backgroundColor: getHighlightColor(),
              }),
            }}
          >
            {part.updated ? (
              <span>Field value was updated (concealed)</span>
            ) : part.value !== undefined && part.value !== null ? (
              <span>
                {typeof part.value === 'object'
                  ? JSON.stringify(part.value, null, 2)
                  : String(part.value)}
              </span>
            ) : (
              <span style={{ fontStyle: 'italic', opacity: 0.7 }}>(no value)</span>
            )}
          </span>
        ))}
      </Text>
    </Box>
  );
}

export default RevisionChangeLine;
