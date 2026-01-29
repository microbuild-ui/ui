/**
 * FormFieldInterface Component
 * Dynamically renders the appropriate interface component for a field
 * Based on Directus form-field-interface component
 * 
 * Uses @microbuild/utils for field interface mapping and
 * @microbuild/ui-interfaces for interface components.
 */

import React, { useMemo } from 'react';
import { Alert, Skeleton, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { FormField } from '../types';
import { getFieldInterface, type InterfaceConfig } from '@microbuild/utils';

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
  // Get interface configuration from @microbuild/utils
  // Returns InterfaceConfig with type and props
  const interfaceConfig: InterfaceConfig = useMemo(() => {
    return getFieldInterface(field);
  }, [field]);

  // Get interface component by type
  const InterfaceComponent = useMemo(() => {
    const interfaceType = interfaceConfig.type;
    
    // Map interface types to component names
    // This handles special cases like relational interfaces and acronyms
    const interfaceComponentMap: Record<string, string> = {
      // Text inputs
      'input': 'Input',
      'input-code': 'InputCode',
      'input-multiline': 'Textarea',
      'input-autocomplete-api': 'AutocompleteAPI',
      'input-block-editor': 'InputBlockEditor',
      'input-rich-text-html': 'RichTextHTML',
      'input-rich-text-md': 'RichTextMarkdown',
      'textarea': 'Textarea',
      
      // Boolean
      'boolean': 'Boolean',
      'toggle': 'Toggle',
      
      // Date / Time
      'datetime': 'DateTime',
      
      // Selection
      'select-dropdown': 'SelectDropdown',
      'select-radio': 'SelectRadio',
      'select-icon': 'SelectIcon',
      'select-color': 'Color',
      
      // Multiple selection
      'select-multiple-checkbox': 'SelectMultipleCheckbox',
      'select-multiple-dropdown': 'SelectMultipleDropdown',
      'select-multiple-checkbox-tree': 'SelectMultipleCheckboxTree',
      
      // Other inputs
      'slider': 'Slider',
      'tags': 'Tags',
      'number': 'Input', // Use Input with type="number"
      'uuid': 'Input',
      
      // Presentation / Layout
      'presentation-divider': 'Divider',
      'presentation-notice': 'Notice',
      'group-detail': 'GroupDetail',
      
      // Note: Relational interfaces (list-m2o, list-o2m, list-m2m, list-m2a)
      // are mapped separately in relationalFullComponentMap below
      // to use full implementations with hooks integration
      
      // File interfaces - use the real DaaS-integrated components
      'file': 'File',
      'file-image': 'FileImage',
      'files': 'Files',
      
      // Collection
      'collection-item-dropdown': 'CollectionItemDropdown',
      
      // Map / Geometry
      'map': 'Map',
      
      // Workflow
      'workflow-button': 'WorkflowButton',
    };
    
    // For relational interfaces, prefer the full implementation (ListM2M, ListM2O, ListO2M)
    // over the placeholder *Interface components that require render props.
    // The full implementations use @microbuild/hooks and @microbuild/ui-collections internally.
    const relationalFullComponentMap: Record<string, string> = {
      'list-m2o': 'ListM2O',
      'select-dropdown-m2o': 'ListM2O',
      'list-o2m': 'ListO2M',
      'list-m2m': 'ListM2M',
      'list-m2a': 'ListM2A',
    };
    
    // Check if this is a relational interface - use full component
    let componentName = relationalFullComponentMap[interfaceType] || interfaceComponentMap[interfaceType];
    
    if (!componentName) {
      // Fallback: Convert kebab-case to PascalCase
      componentName = interfaceType
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    }

    // Get component from interfaces package
    const component = (Interfaces as any)[componentName];
    
    return component;
  }, [interfaceConfig.type]);

  // Show loading skeleton
  if (loading && !field.hideLoader) {
    return <Skeleton height={36} />;
  }

  // Show error if component not found
  if (!InterfaceComponent) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="yellow">
        <Text size="sm">
          Interface component not found: <Text component="span" fw={600}>{interfaceConfig.type}</Text>
        </Text>
        <Text size="xs" c="dimmed" mt="xs">
          Field: {field.field} (Type: {field.type})
        </Text>
      </Alert>
    );
  }

  // Build props for interface component
  // Merge interfaceConfig.props (from @microbuild/utils) with runtime props
  const interfaceProps: any = {
    value,
    onChange,
    disabled: disabled || readonly,
    readonly,
    required,
    error,
    autofocus,
    // Note: label is NOT passed here because FormField already renders FormFieldLabel
    
    // Field metadata
    collection: field.collection,
    field: field.field,
    type: field.type,
    primaryKey,
    
    // Schema properties
    maxLength: field.schema?.max_length,
    nullable: field.schema?.is_nullable,
    defaultValue: field.schema?.default_value,
    
    // Spread interface-specific props from InterfaceConfig (includes meta.options)
    ...interfaceConfig.props,
  };

  // Note: File interfaces (File, FileImage, Files) now use @microbuild/hooks useFiles
  // directly and don't need an external upload handler passed in

  // Render interface component
  return (
    <InterfaceComponent {...interfaceProps} />
  );
};

export default FormFieldInterface;
