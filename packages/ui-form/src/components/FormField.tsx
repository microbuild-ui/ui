/**
 * FormField Component
 * Renders a single field with label, interface component, and validation
 * Based on Directus form-field component
 * 
 * Uses @microbuild/utils for field readonly detection.
 */

import React, { useMemo } from 'react';
import { Stack, Text, Box } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { FormField as TFormField, ValidationError } from '../types';
import { FormFieldInterface } from './FormFieldInterface';
import { FormFieldLabel } from './FormFieldLabel';
import { isFieldReadOnly } from '@microbuild/utils';

export interface FormFieldProps {
  /** Field definition */
  field: TFormField;
  /** Current field value */
  value?: any;
  /** Initial/default value */
  initialValue?: any;
  /** Change handler */
  onChange?: (value: any) => void;
  /** Unset field value (remove from edits) */
  onUnset?: () => void;
  /** Field is disabled */
  disabled?: boolean;
  /** Field is readonly (view only) */
  readonly?: boolean;
  /** Field is loading */
  loading?: boolean;
  /** Validation error for this field */
  validationError?: ValidationError;
  /** Primary key value (for edit mode) */
  primaryKey?: string | number;
  /** Auto-focus this field */
  autofocus?: boolean;
  /** Hide the field label */
  hideLabel?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * FormField - Individual field wrapper with label and interface
 */
export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  initialValue,
  onChange,
  onUnset: _onUnset, // prefixed with _ to indicate it's intentionally unused for now
  disabled = false,
  readonly = false,
  loading = false,
  validationError,
  primaryKey,
  autofocus = false,
  hideLabel = false,
  className,
}) => {
  // Determine form context (create vs edit)
  const context = useMemo(() => {
    return primaryKey === '+' || !primaryKey ? 'create' : 'edit';
  }, [primaryKey]);

  // Determine if field is disabled using @microbuild/utils isFieldReadOnly
  const isDisabled = useMemo(() => {
    if (disabled) return true;
    
    // Use the comprehensive isFieldReadOnly from @microbuild/utils
    // This handles: auto-increment, UUID PKs, meta.readonly, generated defaults, etc.
    return isFieldReadOnly(field, { context, primaryKey });
  }, [disabled, field, context, primaryKey]);

  // Determine if field is required
  const isRequired = useMemo(() => {
    if (field.meta?.required) return true;
    if (field.schema?.is_nullable === false && !field.schema?.default_value) return true;
    return false;
  }, [field]);

  // Get effective value (use value or default)
  const effectiveValue = useMemo(() => {
    if (value !== undefined) return value;
    if (field.schema?.default_value !== undefined) return field.schema.default_value;
    return null;
  }, [value, field]);

  // Check if field has been edited
  const isEdited = useMemo(() => {
    return value !== undefined && value !== initialValue;
  }, [value, initialValue]);

  // Get validation error message
  const errorMessage = useMemo(() => {
    if (!validationError) return undefined;

    // Use custom validation message if available
    if (field.meta?.validation_message) {
      return field.meta.validation_message;
    }

    // Use error message from validation
    if (validationError.message) {
      return validationError.message;
    }

    // Generate default message based on type
    switch (validationError.type) {
      case 'required':
        return 'This field is required';
      case 'unique':
        return 'This value must be unique';
      case 'email':
        return 'Must be a valid email address';
      case 'url':
        return 'Must be a valid URL';
      case 'number':
        return 'Must be a valid number';
      default:
        return 'Validation failed';
    }
  }, [validationError, field]);

  // Get field width class
  const widthClass = useMemo(() => {
    const width = field.meta?.width || 'full';
    return `field-width-${width}`;
  }, [field.meta?.width]);

  return (
    <Box
      className={`form-field ${widthClass} ${className || ''}`}
      data-field={field.field}
      data-edited={isEdited}
    >
      <Stack gap="xs">
        {/* Field Label */}
        {!hideLabel && !field.hideLabel && (
          <FormFieldLabel
            label={field.name || field.field}
            required={isRequired}
            description={field.meta?.note ?? undefined}
          />
        )}

        {/* Field Interface */}
        <FormFieldInterface
          field={field}
          value={effectiveValue}
          onChange={onChange}
          disabled={isDisabled}
          readonly={readonly}
          loading={loading}
          required={isRequired}
          error={errorMessage}
          autofocus={autofocus}
          primaryKey={primaryKey}
        />

        {/* Validation Error */}
        {validationError && errorMessage && (
          <Text size="sm" c="red" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconAlertCircle size={14} />
            {errorMessage}
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default FormField;
