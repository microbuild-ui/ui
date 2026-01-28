/**
 * Get default values from field definitions
 */

import type { Field } from '@microbuild/types';
import type { FieldValues } from '../types';

/**
 * Extract default values from field schema
 */
export function getDefaultValuesFromFields(fields: Field[]): FieldValues {
  const defaults: FieldValues = {};

  for (const field of fields) {
    if (field.schema?.default_value !== undefined && field.schema?.default_value !== null) {
      defaults[field.field] = field.schema.default_value;
    }
  }

  return defaults;
}
