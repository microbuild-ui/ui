/**
 * VForm Component
 * Dynamic form that renders fields based on collection schema
 * Based on Directus v-form component
 * 
 * Integrates with:
 * - @microbuild/types for Field types
 * - @microbuild/services for FieldsService API calls and DaaS context
 * - @microbuild/utils for field interface mapping and utilities
 * - @microbuild/ui-interfaces (via FormFieldInterface) for interface components
 * 
 * Security Features (following DaaS architecture):
 * - Field-level permissions filtering (show only accessible fields)
 * - Action-based permissions (create, read, update mode)
 * - Integration with DaaSProvider for authenticated requests
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './VForm.css';
import { Stack, Box, Alert, Text, Skeleton } from '@mantine/core';
import { IconInfoCircle, IconLock } from '@tabler/icons-react';
import type { Field } from '@microbuild/types';
import { FieldsService, useDaaSContext } from '@microbuild/services';
// isPresentationField is available from @microbuild/utils if needed for filtering
import type { ValidationError, FieldValues } from './types';
import { FormField } from './components/FormField';
import {
  getFormFields,
  getDefaultValuesFromFields,
  isFieldVisible,
  updateFieldWidths,
} from './utils';

/**
 * Permission action for the form
 */
export type FormAction = 'create' | 'read' | 'update';

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
  /** 
   * Form action for permission filtering.
   * - 'create': Filter by create permissions (default for primaryKey === '+')
   * - 'update': Filter by update permissions (default for existing primaryKey)
   * - 'read': Filter by read permissions (for read-only forms)
   */
  action?: FormAction;
  /** 
   * Enable permission-based field filtering.
   * When true, only fields the user has permission to access will be shown.
   * Requires DaaSProvider context for authentication.
   */
  enforcePermissions?: boolean;
  /**
   * Callback when permissions are loaded
   */
  onPermissionsLoaded?: (accessibleFields: string[]) => void;
}

// Stable empty references to prevent re-renders
const EMPTY_OBJECT: FieldValues = {};
const EMPTY_ARRAY: string[] = [];
const EMPTY_VALIDATION_ERRORS: ValidationError[] = [];

/**
 * VForm - Dynamic form component
 */
export const VForm: React.FC<VFormProps> = ({
  collection,
  fields: fieldsProp,
  modelValue,
  initialValues,
  onUpdate,
  primaryKey,
  disabled = false,
  loading: loadingProp = false,
  validationErrors,
  autofocus = false,
  group = null,
  showDivider: _showDivider = false, // prefixed with _ to indicate it's intentionally unused for now
  showNoVisibleFields = true,
  excludeFields,
  className,
  action,
  enforcePermissions = false,
  onPermissionsLoaded,
}) => {
  // Use stable references for optional props
  const stableModelValue = useMemo(
    () => modelValue || EMPTY_OBJECT,
    [modelValue]
  );
  const stableInitialValues = useMemo(
    () => initialValues || EMPTY_OBJECT,
    [initialValues]
  );
  const stableValidationErrors = useMemo(
    () => validationErrors || EMPTY_VALIDATION_ERRORS,
    [validationErrors]
  );
  const stableExcludeFields = useMemo(
    () => excludeFields || EMPTY_ARRAY,
    [excludeFields]
  );
  
  const [fields, setFields] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessibleFields, setAccessibleFields] = useState<string[] | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  
  // Get DaaS context for authenticated requests
  const daasContext = useDaaSContext();
  
  // Determine the action based on primaryKey if not explicitly provided
  const effectiveAction: FormAction = useMemo(() => {
    if (action) return action;
    if (primaryKey === '+') return 'create';
    if (primaryKey) return 'update';
    return 'read';
  }, [action, primaryKey]);

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

  // Load permissions if enforcePermissions is enabled
  useEffect(() => {
    if (!enforcePermissions || !collection) {
      setAccessibleFields(null);
      return;
    }

    const loadPermissions = async () => {
      try {
        setPermissionsLoading(true);
        
        // Check if we're in direct mode (has auth context)
        const url = daasContext.isDirectMode 
          ? daasContext.buildUrl(`/api/permissions/${collection}?action=${effectiveAction}`)
          : `/api/permissions/${collection}?action=${effectiveAction}`;
        
        const response = await fetch(url, {
          headers: daasContext.getHeaders(),
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            // No permissions - show no fields
            setAccessibleFields([]);
            return;
          }
          throw new Error(`Failed to fetch permissions: ${response.status}`);
        }
        
        const data = await response.json();
        const permissionFields = data.data?.fields || [];
        
        setAccessibleFields(permissionFields);
        onPermissionsLoaded?.(permissionFields);
      } catch (err) {
        console.error('Error loading permissions:', err);
        // On error, default to showing all fields (fail open for better UX)
        setAccessibleFields(null);
      } finally {
        setPermissionsLoading(false);
      }
    };

    loadPermissions();
  }, [collection, effectiveAction, enforcePermissions, daasContext, onPermissionsLoaded]);

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
    if (stableExcludeFields.length > 0) {
      processed = processed.filter((f) => !stableExcludeFields.includes(f.field));
    }

    // Filter by permissions if enforced
    if (enforcePermissions && accessibleFields !== null) {
      // Wildcard means all fields are accessible
      if (!accessibleFields.includes('*')) {
        const accessibleSet = new Set(accessibleFields);
        processed = processed.filter((f) => accessibleSet.has(f.field));
      }
    }

    // Update field widths for proper layout
    processed = updateFieldWidths(processed);

    return processed;
  }, [fields, group, stableExcludeFields, enforcePermissions, accessibleFields]);

  // Get visible fields (excluding hidden and presentation-only fields)
  const visibleFields = useMemo(() => {
    return formFields.filter((f) => {
      // Filter out hidden fields
      if (!isFieldVisible(f)) return false;
      // Presentation fields (dividers, notices) are kept for layout
      // They will be rendered but won't store data
      return true;
    });
  }, [formFields]);

  // Merge initial values with current values
  const allValues = useMemo(() => {
    return {
      ...defaultValues,
      ...stableInitialValues,
      ...stableModelValue,
    };
  }, [defaultValues, stableInitialValues, stableModelValue]);

  // Handle field value change
  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      const field = fields.find((f) => f.field === fieldName);
      if (!field) return;

      // Check if value is same as initial/default
      const initialValue = stableInitialValues[fieldName] ?? defaultValues[fieldName];
      if (value === initialValue) {
        // Remove from edits
        const newValues = { ...stableModelValue };
        delete newValues[fieldName];
        onUpdate?.(newValues);
      } else {
        // Add to edits
        onUpdate?.({
          ...stableModelValue,
          [fieldName]: value,
        });
      }
    },
    [fields, stableInitialValues, defaultValues, stableModelValue, onUpdate]
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
      return stableValidationErrors.find(
        (err) =>
          err.field === fieldName ||
          err.field.endsWith(`(${fieldName})`) ||
          (err.collection === collection && err.field === fieldName)
      );
    },
    [stableValidationErrors, collection]
  );

  // Show loading skeleton
  if (loadingFields || loadingProp || permissionsLoading) {
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

  // Show no permissions message
  if (enforcePermissions && accessibleFields !== null && accessibleFields.length === 0) {
    return (
      <Alert icon={<IconLock size={16} />} color="yellow" className={className}>
        <Text size="sm" fw={600}>No field access</Text>
        <Text size="sm" c="dimmed" mt="xs">
          You don&apos;t have permission to {effectiveAction} fields in this collection.
        </Text>
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
              initialValue={stableInitialValues[field.field]}
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
