/**
 * FormFieldInterface Component
 * Dynamically renders the appropriate interface component for a field
 * Based on Directus form-field-interface component
 */

import React, { useMemo } from 'react';
import { Alert, Skeleton, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { FormField } from '../types';
import { getFieldInterface } from '../utils';

// Import interface components
import * as Interfaces from '@microbuild/ui-interfaces';

export interface FormFieldInterfaceProps {
  /** Field definition */
  field: FormField;
  /** Current value */
  value?: any;
  /** Change handler */
  onChange?: (value: any) => void;
  /** Field is disabled */
  disabled?: boolean;
  /** Field is readonly */
  readonly?: boolean;
  /** Field is required */
  required?: boolean;
  /** Field is loading */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Auto-focus */
  autofocus?: boolean;
  /** Primary key (for edit mode) */
  primaryKey?: string | number;
}

/**
 * FormFieldInterface - Dynamic interface component loader
 */
export const FormFieldInterface: React.FC<FormFieldInterfaceProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  readonly = false,
  required = false,
  loading = false,
  error,
  autofocus = false,
  primaryKey,
}) => {
  // Get interface component name
  const interfaceId = useMemo(() => {
    return getFieldInterface(field);
  }, [field]);

  // Get interface component
  const InterfaceComponent = useMemo(() => {
    // Map interface ID to component
    // Convert kebab-case to PascalCase (e.g., 'input-code' -> 'InputCode')
    const componentName = interfaceId
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    // Get component from interfaces package
    const component = (Interfaces as any)[componentName];
    
    return component;
  }, [interfaceId]);

  // Show loading skeleton
  if (loading && !field.hideLoader) {
    return <Skeleton height={36} />;
  }

  // Show error if component not found
  if (!InterfaceComponent) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="yellow">
        <Text size="sm">
          Interface component not found: <Text component="span" fw={600}>{interfaceId}</Text>
        </Text>
        <Text size="xs" c="dimmed" mt="xs">
          Field: {field.field} (Type: {field.type})
        </Text>
      </Alert>
    );
  }

  // Get interface options from field meta
  const interfaceOptions = field.meta?.options || {};

  // Build props for interface component
  const interfaceProps: any = {
    value,
    onChange,
    disabled: disabled || readonly,
    readonly,
    required,
    error,
    autofocus,
    // Note: label is NOT passed here because FormField already renders FormFieldLabel
    placeholder: interfaceOptions.placeholder,
    
    // Field metadata
    collection: field.collection,
    field: field.field,
    type: field.type,
    primaryKey,
    
    // Schema properties
    maxLength: field.schema?.max_length,
    nullable: field.schema?.is_nullable,
    defaultValue: field.schema?.default_value,
    
    // Spread interface-specific options
    ...interfaceOptions,
  };

  // Render interface component
  return (
    <InterfaceComponent {...interfaceProps} />
  );
};

export default FormFieldInterface;
