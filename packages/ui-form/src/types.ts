/**
 * Type definitions for VForm component
 * Based on Directus v-form types
 */

import type { Field } from '@microbuild/types';

/**
 * Extended field type with display properties
 */
export interface FormField extends Field {
  /** Field name */
  field: string;
  /** Display name for the field */
  name?: string;
  /** Hide the field label */
  hideLabel?: boolean;
  /** Hide the loading skeleton */
  hideLoader?: boolean;
  /** Indicator style for comparison/diff mode */
  indicatorStyle?: 'active' | 'muted' | 'hidden';
}

/**
 * Validation error structure
 */
export interface ValidationError {
  /** Collection name */
  collection?: string;
  /** Field name */
  field: string;
  /** Error type/code */
  type: string;
  /** Error code (e.g., 'RECORD_NOT_UNIQUE', 'FAILED_VALIDATION') */
  code?: string;
  /** Custom error message */
  message?: string;
  /** Additional error context */
  [key: string]: any;
}

/**
 * Field values object
 */
export type FieldValues = Record<string, any>;

/**
 * Field width options
 */
export type FieldWidth = 'full' | 'half' | 'half-left' | 'half-right' | 'fill';

/**
 * Field group options
 */
export interface FieldGroup {
  /** Group identifier */
  field: string;
  /** Group label */
  label?: string;
  /** Group icon */
  icon?: string;
  /** Group metadata */
  meta?: {
    field?: string;
    group?: string | null;
    width?: FieldWidth;
    options?: Record<string, any>;
    [key: string]: any;
  };
}

/**
 * Interface component props
 */
export interface InterfaceProps<T = any> {
  /** Field value */
  value?: T;
  /** Change handler */
  onChange?: (value: T) => void;
  /** Field is disabled */
  disabled?: boolean;
  /** Field is readonly */
  readonly?: boolean;
  /** Field is required */
  required?: boolean;
  /** Field is loading */
  loading?: boolean;
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Field description */
  description?: string;
  /** Interface-specific options */
  [key: string]: any;
}

/**
 * Form event handlers
 */
export interface FormHandlers {
  /** Update field value */
  setValue: (field: string, value: any) => void;
  /** Unset field value (remove from edits) */
  unsetValue: (field: string) => void;
  /** Apply multiple field updates */
  applyValues: (values: FieldValues) => void;
  /** Get field value */
  getValue: (field: string) => any;
}

/**
 * Form state
 */
export interface FormState {
  /** Current form values (edited fields) */
  values: FieldValues;
  /** Initial/default values */
  initialValues: FieldValues;
  /** All available fields */
  fields: FormField[];
  /** Validation errors */
  errors: ValidationError[];
  /** Form is loading */
  loading: boolean;
  /** Form is saving */
  saving: boolean;
}
