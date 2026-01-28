/**
 * VForm Component
 * Dynamic form that renders fields based on collection schema
 * Based on Directus v-form component
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './VForm.css';
import { Stack, Box, Alert, Text, Skeleton } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { Field } from '@microbuild/types';
import { FieldsService } from '@microbuild/services';
import type { ValidationError, FieldValues } from './types';
import { FormField } from './components/FormField';
import {
  getFormFields,
  getDefaultValuesFromFields,
  isFieldVisible,
  updateFieldWidths,
} from './utils';

export interface VFormProps {
  /** Collection name to load fields from */
  collection?: string;
  /** Explicit field definitions (overrides collection) */
  fields?: Field[];
  /** Current form values (edited fields only) */
  modelValue?: FieldValues;
  /** Initial/default values */
  initialValues?: FieldValues;
  /** Update handler for form values */
  onUpdate?: (values: FieldValues) => void;
  /** Primary key value for edit mode ('+' for create) */
  primaryKey?: string | number;
  /** Disable all fields */
  disabled?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Validation errors */
  validationErrors?: ValidationError[];
  /** Auto-focus first editable field */
  autofocus?: boolean;
  /** Show only fields in this group */
  group?: string | null;
  /** Show divider between system and user fields */
  showDivider?: boolean;
  /** Show message when no visible fields */
  showNoVisibleFields?: boolean;
  /** Fields to exclude from rendering */
  excludeFields?: string[];
  /** CSS class name */
  className?: string;
}

/**
 * VForm - Dynamic form component
 */
export const VForm: React.FC<VFormProps> = ({
  collection,
  fields: fieldsProp,
  modelValue = {},
  initialValues = {},
  onUpdate,
  primaryKey,
  disabled = false,
  loading: loadingProp = false,
  validationErrors = [],
  autofocus = false,
  group = null,
  showDivider: _showDivider = false, // prefixed with _ to indicate it's intentionally unused for now
  showNoVisibleFields = true,
  excludeFields = [],
  className,
}) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load fields from API if collection is provided
  useEffect(() => {
    if (fieldsProp) {
      setFields(fieldsProp);
      return;
    }

    if (!collection) {
      setError('Either collection or fields prop must be provided');
      return;
    }

    const loadFields = async () => {
      try {
        setLoadingFields(true);
        setError(null);
        
        const fieldsService = new FieldsService();
        const loadedFields = await fieldsService.readAll(collection);
        setFields(loadedFields);
      } catch (err) {
        console.error('Error loading fields:', err);
        setError(err instanceof Error ? err.message : 'Failed to load fields');
      } finally {
        setLoadingFields(false);
      }
    };

    loadFields();
  }, [collection, fieldsProp]);

  // Get default values from field schemas
  const defaultValues = useMemo(() => {
    return getDefaultValuesFromFields(fields);
  }, [fields]);

  // Process fields for display
  const formFields = useMemo(() => {
    let processed = getFormFields(fields);

    // Filter by group if specified
    if (group !== null) {
      processed = processed.filter((f) => {
        const fieldGroup = f.meta?.group ?? null;
        return fieldGroup === group;
      });
    }

    // Exclude specified fields
    if (excludeFields.length > 0) {
      processed = processed.filter((f) => !excludeFields.includes(f.field));
    }

    // Update field widths for proper layout
    processed = updateFieldWidths(processed);

    return processed;
  }, [fields, group, excludeFields]);

  // Get visible fields
  const visibleFields = useMemo(() => {
    return formFields.filter(isFieldVisible);
  }, [formFields]);

  // Merge initial values with current values
  const allValues = useMemo(() => {
    return {
      ...defaultValues,
      ...initialValues,
      ...modelValue,
    };
  }, [defaultValues, initialValues, modelValue]);

  // Handle field value change
  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      const field = fields.find((f) => f.field === fieldName);
      if (!field) return;

      // Check if value is same as initial/default
      const initialValue = initialValues[fieldName] ?? defaultValues[fieldName];
      if (value === initialValue) {
        // Remove from edits
        const newValues = { ...modelValue };
        delete newValues[fieldName];
        onUpdate?.(newValues);
      } else {
        // Add to edits
        onUpdate?.({
          ...modelValue,
          [fieldName]: value,
        });
      }
    },
    [fields, initialValues, defaultValues, modelValue, onUpdate]
  );

  // Handle field unset
  const handleFieldUnset = useCallback(
    (fieldName: string) => {
      const newValues = { ...modelValue };
      delete newValues[fieldName];
      onUpdate?.(newValues);
    },
    [modelValue, onUpdate]
  );

  // Get validation error for a field
  const getFieldError = useCallback(
    (fieldName: string): ValidationError | undefined => {
      return validationErrors.find(
        (err) =>
          err.field === fieldName ||
          err.field.endsWith(`(${fieldName})`) ||
          (err.collection === collection && err.field === fieldName)
      );
    },
    [validationErrors, collection]
  );

  // Show loading skeleton
  if (loadingFields || loadingProp) {
    return (
      <Box className={className}>
        <Stack gap="md">
          <Skeleton height={60} />
          <Skeleton height={60} />
          <Skeleton height={60} />
        </Stack>
      </Box>
    );
  }

  // Show error
  if (error) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} color="red" className={className}>
        {error}
      </Alert>
    );
  }

  // Show no fields message
  if (visibleFields.length === 0) {
    if (!showNoVisibleFields) return null;

    return (
      <Alert icon={<IconInfoCircle size={16} />} color="blue" className={className}>
        <Text size="sm" fw={600}>No visible fields</Text>
        <Text size="sm" c="dimmed" mt="xs">
          {collection ? `Collection "${collection}" has no visible fields` : 'No fields to display'}
        </Text>
      </Alert>
    );
  }

  return (
    <Box className={`v-form ${className || ''}`}>
      <div className="form-grid">
        {visibleFields.map((field, index) => {
          // Check if this is the first editable field (for autofocus)
          const isFirstEditable =
            autofocus &&
            index === visibleFields.findIndex((f) => !f.meta?.readonly);

          return (
            <FormField
              key={field.field}
              field={field}
              value={allValues[field.field]}
              initialValue={initialValues[field.field]}
              onChange={(value) => handleFieldChange(field.field, value)}
              onUnset={() => handleFieldUnset(field.field)}
              disabled={disabled}
              loading={loadingProp}
              validationError={getFieldError(field.field)}
              primaryKey={primaryKey}
              autofocus={isFirstEditable}
              className={field.meta?.width || 'full'}
            />
          );
        })}
      </div>
    </Box>
  );
};

export default VForm;
