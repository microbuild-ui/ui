/**
 * Get default values from field definitions
 * Uses @buildpad/utils getFieldDefault for proper handling of
 * database-generated defaults (now(), gen_random_uuid, etc.)
 */

import type { Field } from '@buildpad/types';
import { getFieldDefault } from '@buildpad/utils';
import type { FieldValues } from '../types';

/**
 * Extract default values from field schema
 * Filters out database-generated defaults that shouldn't be used as form values
 */
export function getDefaultValuesFromFields(fields: Field[]): FieldValues {
  const defaults: FieldValues = {};

  for (const field of fields) {
    const defaultValue = getFieldDefault(field);
    if (defaultValue !== undefined) {
      defaults[field.field] = defaultValue;
    }
  }

  return defaults;
}
