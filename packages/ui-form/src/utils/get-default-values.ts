/**
 * Get default values from field definitions
 * Uses @microbuild/utils getFieldDefault for proper handling of
 * database-generated defaults (now(), gen_random_uuid, etc.)
 */

import type { Field } from '@microbuild/types';
import { getFieldDefault } from '@microbuild/utils';
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
