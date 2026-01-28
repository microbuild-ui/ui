/**
 * Utility to get appropriate interface for a field type
 * Maps database types to default interface components
 */

import type { Field } from '@microbuild/types';

/**
 * Get default interface component ID for a field type
 * Based on Directus type-to-interface mapping
 */
export function getDefaultInterfaceForType(type: string | undefined): string {
  if (!type) return 'input';

  switch (type.toLowerCase()) {
    // Text types
    case 'string':
    case 'varchar':
    case 'char':
      return 'input';

    case 'text':
      return 'textarea';

    case 'uuid':
      return 'input'; // Could be 'input-hash' with readonly

    // Numeric types
    case 'integer':
    case 'biginteger':
    case 'bigint':
    case 'smallint':
      return 'input'; // NumberInput

    case 'float':
    case 'double':
    case 'decimal':
    case 'numeric':
      return 'input'; // NumberInput with decimals

    // Boolean
    case 'boolean':
    case 'bool':
      return 'toggle'; // or 'boolean'

    // Date/Time
    case 'timestamp':
    case 'datetime':
    case 'timestamptz':
      return 'datetime';

    case 'date':
      return 'datetime'; // with dateOnly option

    case 'time':
      return 'datetime'; // with timeOnly option

    // JSON
    case 'json':
    case 'jsonb':
      return 'input-code'; // or 'input-multiline'

    // Array
    case 'csv':
      return 'tags';

    // Alias types (relations)
    case 'alias':
      return 'input'; // Placeholder, should be overridden by meta.interface

    default:
      return 'input';
  }
}

/**
 * Check if a field has an explicit interface defined
 */
export function hasExplicitInterface(field: Field): boolean {
  return !!(field.meta?.interface);
}

/**
 * Get the interface to use for a field
 * Priority: meta.interface > type-based default
 */
export function getFieldInterface(field: Field): string {
  if (hasExplicitInterface(field)) {
    return field.meta!.interface!;
  }
  
  return getDefaultInterfaceForType(field.type);
}
