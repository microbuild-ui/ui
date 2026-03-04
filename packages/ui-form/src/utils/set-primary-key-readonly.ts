/**
 * Set Primary Key Readonly
 * Ported from DaaS app/src/components/v-form/v-form.vue :: setPrimaryKeyReadonly
 *
 * When editing an existing item (primaryKey !== '+'), auto-increment and UUID
 * primary key fields are forced readonly at the data level (meta.readonly = true).
 *
 * This ensures downstream pipeline steps (applyConditions, pushGroupOptionsDown,
 * group interfaces) see the field as readonly — not just the UI layer.
 */

import type { Field } from '@buildpad/types';

/**
 * If the field is an auto-increment or UUID primary key and we are editing
 * (not creating), clone the field and set `meta.readonly = true`.
 *
 * @param field      The field to check
 * @param primaryKey The current primary key value ('+' = create)
 * @returns          The original field, or a readonly clone
 */
export function setPrimaryKeyReadonly(field: Field, primaryKey?: string | number): Field {
  if (
    field.schema?.is_primary_key === true &&
    primaryKey !== '+' &&
    primaryKey !== undefined &&
    (field.schema?.has_auto_increment === true || field.meta?.special?.includes('uuid'))
  ) {
    // Clone field so we don't mutate the source
    const cloned: Field = {
      ...field,
      meta: field.meta
        ? { ...field.meta, readonly: true }
        : undefined,
    };
    return cloned;
  }

  return field;
}
