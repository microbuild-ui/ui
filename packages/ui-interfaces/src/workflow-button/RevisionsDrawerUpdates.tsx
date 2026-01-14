import React from 'react';
import { Alert, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { RevisionChangeLine } from './RevisionChangeLine';
import type { Revision, FieldChange, Change } from './types';

// Simple diff utilities (can be replaced with 'diff' package if available)
function diffValues(
  previousValue: unknown,
  currentValue: unknown
): Change[] {
  // For primitive values, show before/after
  if (
    typeof previousValue !== 'object' ||
    typeof currentValue !== 'object' ||
    previousValue === null ||
    currentValue === null
  ) {
    return [
      { removed: true, value: previousValue },
      { added: true, value: currentValue },
    ];
  }

  // For arrays
  if (Array.isArray(previousValue) && Array.isArray(currentValue)) {
    const changes: Change[] = [];
    const prevSet = new Set(previousValue.map((v) => JSON.stringify(v)));
    const currSet = new Set(currentValue.map((v) => JSON.stringify(v)));

    previousValue.forEach((v) => {
      const key = JSON.stringify(v);
      if (!currSet.has(key)) {
        changes.push({ removed: true, value: v });
      }
    });

    currentValue.forEach((v) => {
      const key = JSON.stringify(v);
      if (!prevSet.has(key)) {
        changes.push({ added: true, value: v });
      }
    });

    if (changes.length === 0) {
      return [{ value: currentValue }];
    }

    return changes;
  }

  // For objects, show as JSON
  return [
    { removed: true, value: previousValue },
    { added: true, value: currentValue },
  ];
}

function isEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export interface RevisionsDrawerUpdatesProps {
  /** Current revision to compare */
  revision: Revision;
  /** Array of revisions (current and previous) */
  revisions: Revision[];
  /** Optional field metadata map */
  fields?: Map<string, { name: string; meta?: { special?: string[] } }>;
}

/**
 * RevisionsDrawerUpdates Component
 *
 * Displays the differences between two revisions.
 * Shows field-by-field changes with visual diff formatting.
 */
export function RevisionsDrawerUpdates({
  revision,
  revisions,
  fields = new Map(),
}: RevisionsDrawerUpdatesProps) {
  // Get the previous revision (assuming revisions are in chronological order from newest to oldest)
  const previousRevision = React.useMemo(() => {
    const currentIndex = revisions.findIndex((r) => r.id === revision.id);
    return revisions[currentIndex + 1];
  }, [revision, revisions]);

  // Calculate changes between revisions
  const changes = React.useMemo(() => {
    if (!previousRevision) return [] as FieldChange[];

    const changedFields = Object.keys(revision.delta || {});

    const result = changedFields
      .map((fieldKey): FieldChange | null => {
        // Get field info from fields map or use field key as name
        const field = fields.get(fieldKey);
        const name = field?.name || fieldKey;

        const currentValue = revision.delta?.[fieldKey];
        const previousValue = previousRevision?.data?.[fieldKey];

        let changeItems: Change[];
        let updated = false;

        if (isEqual(currentValue, previousValue)) {
          // Check for concealed fields
          if (field?.meta?.special && field.meta.special.includes('conceal')) {
            updated = true;
            changeItems = [{ updated: true, value: currentValue }];
          } else {
            return null;
          }
        } else {
          changeItems = diffValues(previousValue, currentValue);
        }

        return { name, updated, changes: changeItems };
      })
      .filter((change): change is FieldChange => change !== null);

    return result;
  }, [revision, previousRevision, fields]);

  return (
    <Stack gap="md">
      <Alert icon={<IconInfoCircle size={16} />} color="blue">
        <Text size="sm">Changes made between published state and current state.</Text>
        <Text size="xs" c="dimmed" mt={4}>
          Note: Relational data changes are not shown.
        </Text>
      </Alert>

      {changes.length === 0 ? (
        <Alert color="gray">
          <Text size="sm">No changes detected.</Text>
        </Alert>
      ) : (
        <Stack gap="lg">
          {changes.map((change) => (
            <div key={change.name}>
              <Text size="sm" fw={500} c="dimmed" mb={4}>
                {change.name}
              </Text>
              {change.updated ? (
                <RevisionChangeLine type="updated" changes={change.changes} />
              ) : (
                <>
                  <RevisionChangeLine type="deleted" changes={change.changes} />
                  <RevisionChangeLine type="added" changes={change.changes} />
                </>
              )}
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default RevisionsDrawerUpdates;
