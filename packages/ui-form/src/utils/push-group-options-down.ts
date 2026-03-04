/**
 * Push Group Options Down
 * Ported from DaaS app/src/utils/push-group-options-down.ts
 *
 * Propagates `readonly` and `required` from parent group fields
 * down to all their children. After propagation, those flags on the
 * group itself are reset to false so they don't interfere with
 * group-level rendering.
 */

import type { Field } from '@buildpad/types';

interface FieldNode {
  field: Field;
  children: FieldNode[];
}

/**
 * Build a tree structure from fields based on meta.group relationships.
 * Root nodes are fields where meta.group is null/undefined.
 */
function getFieldsTree(fields: Field[]): FieldNode[] {
  const lookup = new Map<string, FieldNode>();

  // Create nodes for all fields
  for (const field of fields) {
    lookup.set(field.field, { field, children: [] });
  }

  const roots: FieldNode[] = [];

  // Build parent-child relationships
  for (const field of fields) {
    const node = lookup.get(field.field)!;
    const parentGroup = field.meta?.group;

    if (parentGroup && lookup.has(parentGroup)) {
      lookup.get(parentGroup)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Recursively propagate readonly and required down the tree
 */
function processNode(node: FieldNode, parentReadonly: boolean, parentRequired: boolean): void {
  const meta = node.field.meta;
  if (!meta) return;

  const isGroup = meta.special?.includes('group') === true;

  // Inherit parent overrides
  if (parentReadonly && !meta.readonly) {
    meta.readonly = true;
  }
  if (parentRequired && !meta.required) {
    meta.required = true;
  }

  if (isGroup) {
    // Propagate this group's flags down to children
    const groupReadonly = meta.readonly === true;
    const groupRequired = meta.required === true;

    for (const child of node.children) {
      processNode(child, groupReadonly, groupRequired);
    }

    // Reset group's own flags — they've been pushed to children
    meta.readonly = false;
    meta.required = false;
  }
}

/**
 * Push readonly and required from group fields down to their children.
 * Returns a new array of fields with updated meta (cloned to avoid mutation).
 *
 * @param fields Array of all fields in the collection
 * @returns      New array with group options propagated to children
 */
export function pushGroupOptionsDown(fields: Field[]): Field[] {
  if (fields.length < 2) return fields;

  // Deep clone fields to avoid mutating the original array
  const cloned = fields.map((f) => ({
    ...f,
    meta: f.meta ? { ...f.meta } : f.meta,
  }));

  const tree = getFieldsTree(cloned);

  for (const root of tree) {
    processNode(root, false, false);
  }

  return cloned;
}
