/**
 * FormGroupField Component
 * Renders group interface fields (group-detail, group-accordion, group-raw)
 * as wrappers around their child fields.
 *
 * Group fields in DaaS have type="alias" and special=["alias","group","no-data"].
 * Their children are fields where meta.group === this field's name.
 */

import React, { useMemo } from 'react';
import { Box, Stack } from '@mantine/core';
import type { Field } from '@buildpad/types';
import { GroupDetail, GroupAccordion, GroupRaw } from '@buildpad/ui-interfaces';
import { getFieldInterface } from '@buildpad/utils';
import type { FormField as TFormField, ValidationError } from '../types';
import { FormField } from './FormField';
import { isFieldVisible } from '../utils/get-form-fields';

export interface FormGroupFieldProps {
  /** The group field definition */
  field: TFormField;
  /** All fields in the collection (needed to find children) */
  allFields: Field[];
  /** Current form values */
  values: Record<string, any>;
  /** Initial form values */
  initialValues: Record<string, any>;
  /** Validation errors */
  validationErrors: ValidationError[];
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Whether the form is loading */
  loading?: boolean;
  /** Primary key */
  primaryKey?: string | number;
  /** Field change handler */
  onFieldChange: (fieldName: string, value: any) => void;
  /** Field unset handler */
  onFieldUnset: (fieldName: string) => void;
  /** Get validation error for a field */
  getFieldError: (fieldName: string) => ValidationError | undefined;
  /** CSS class */
  className?: string;
}

/**
 * Get child fields that belong to a group
 */
function getChildFields(allFields: Field[], groupName: string): TFormField[] {
  return allFields
    .filter((f) => f.meta?.group === groupName && isFieldVisible(f))
    .sort((a, b) => (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0))
    .map((f) => ({
      ...f,
      name: f.meta?.name ?? f.name ?? f.field,
    })) as TFormField[];
}

/**
 * Renders child fields as a stack of FormField components
 */
function ChildFieldsRenderer({
  childFields,
  values,
  initialValues,
  disabled,
  loading,
  primaryKey,
  onFieldChange,
  onFieldUnset,
  getFieldError,
  allFields,
  validationErrors,
}: {
  childFields: TFormField[];
  values: Record<string, any>;
  initialValues: Record<string, any>;
  disabled: boolean;
  loading: boolean;
  primaryKey?: string | number;
  onFieldChange: (fieldName: string, value: any) => void;
  onFieldUnset: (fieldName: string) => void;
  getFieldError: (fieldName: string) => ValidationError | undefined;
  allFields: Field[];
  validationErrors: ValidationError[];
}) {
  return (
    <Stack gap="md">
      {childFields.map((child) => {
        // Check if this child is itself a group (nested groups)
        const isChildGroup = child.meta?.special?.includes?.('group');
        if (isChildGroup) {
          return (
            <FormGroupField
              key={child.field}
              field={child}
              allFields={allFields}
              values={values}
              initialValues={initialValues}
              validationErrors={validationErrors}
              disabled={disabled}
              loading={loading}
              primaryKey={primaryKey}
              onFieldChange={onFieldChange}
              onFieldUnset={onFieldUnset}
              getFieldError={getFieldError}
            />
          );
        }

        return (
          <FormField
            key={child.field}
            field={child}
            value={values[child.field]}
            initialValue={initialValues[child.field]}
            onChange={(value) => onFieldChange(child.field, value)}
            onUnset={() => onFieldUnset(child.field)}
            disabled={disabled}
            loading={loading}
            validationError={getFieldError(child.field)}
            primaryKey={primaryKey}
          />
        );
      })}
    </Stack>
  );
}

/**
 * FormGroupField - Renders a group interface wrapping its child fields
 */
export const FormGroupField: React.FC<FormGroupFieldProps> = ({
  field,
  allFields,
  values,
  initialValues,
  validationErrors,
  disabled = false,
  loading = false,
  primaryKey,
  onFieldChange,
  onFieldUnset,
  getFieldError,
  className,
}) => {
  const interfaceConfig = useMemo(() => getFieldInterface(field), [field]);
  const interfaceType = interfaceConfig.type;

  // Get direct child fields of this group
  const childFields = useMemo(
    () => getChildFields(allFields, field.field),
    [allFields, field.field],
  );

  // Get validation errors relevant to children of this group
  const childValidationErrors = useMemo(() => {
    const childFieldNames = new Set(childFields.map((f) => f.field));
    return validationErrors.filter((e) => childFieldNames.has(e.field));
  }, [validationErrors, childFields]);

  // Common child renderer props
  const childProps = {
    childFields,
    values,
    initialValues,
    disabled,
    loading,
    primaryKey,
    onFieldChange,
    onFieldUnset,
    getFieldError,
    allFields,
    validationErrors,
  };

  // Render based on group interface type
  if (interfaceType === 'group-detail') {
    return (
      <Box
        className={`form-field field-width-${className || 'full'}`}
        data-field={field.field}
      >
        <GroupDetail
          field={field}
          fields={allFields as any}
          values={values}
          initialValues={initialValues}
          disabled={disabled}
          loading={loading}
          validationErrors={childValidationErrors}
          start={interfaceConfig.props?.start as 'open' | 'closed'}
          headerIcon={interfaceConfig.props?.headerIcon as string}
          headerColor={interfaceConfig.props?.headerColor as string}
          badge={interfaceConfig.props?.badge as string}
        >
          <ChildFieldsRenderer {...childProps} />
        </GroupDetail>
      </Box>
    );
  }

  if (interfaceType === 'group-accordion') {
    return (
      <Box
        className={`form-field field-width-${className || 'full'}`}
        data-field={field.field}
      >
        <GroupAccordion
          field={field}
          fields={allFields as any}
          values={values}
          initialValues={initialValues}
          disabled={disabled}
          loading={loading}
          validationErrors={childValidationErrors}
          accordionMode={interfaceConfig.props?.accordionMode as boolean}
          start={interfaceConfig.props?.start as 'opened' | 'closed' | 'first'}
          renderSection={(section) => {
            // Matches Directus accordion-section.vue fieldsInSection logic:
            // 1. Always include the section field itself (with hideLabel)
            // 2. If the section is a group, also include its nested children
            const isGroup = section.meta?.special?.includes?.('group');

            if (isGroup) {
              // Section is a group field — render its children as form fields
              const sectionChildren = getChildFields(allFields, section.field);
              if (sectionChildren.length === 0) return null;
              return (
                <ChildFieldsRenderer
                  {...childProps}
                  childFields={sectionChildren}
                />
              );
            }

            // Section is a regular field — render the field itself (hideLabel)
            // This matches Directus: [merge({}, field, { hideLabel: true })]
            // Look up the full Field object from allFields to guarantee all
            // properties (type, schema, collection, meta) are present, since
            // the renderSection callback type only declares a subset.
            const fullField = allFields.find((f) => f.field === section.field) || section;
            const sectionFormField = {
              ...fullField,
              name: fullField.meta?.name ?? (fullField as any).name ?? fullField.field,
              hideLabel: true,
            } as TFormField;

            return (
              <FormField
                key={section.field}
                field={sectionFormField}
                value={values[section.field]}
                initialValue={initialValues[section.field]}
                onChange={(value) => onFieldChange(section.field, value)}
                onUnset={() => onFieldUnset(section.field)}
                disabled={disabled}
                loading={loading}
                validationError={getFieldError(section.field)}
                primaryKey={primaryKey}
              />
            );
          }}
        >
          <ChildFieldsRenderer {...childProps} />
        </GroupAccordion>
      </Box>
    );
  }

  if (interfaceType === 'group-raw') {
    return (
      <Box
        className={`form-field field-width-${className || 'full'}`}
        data-field={field.field}
      >
        <GroupRaw field={field} disabled={disabled}>
          <ChildFieldsRenderer {...childProps} />
        </GroupRaw>
      </Box>
    );
  }

  // Fallback: render children without wrapper (unknown group type)
  return (
    <Box
      className={`form-field field-width-${className || 'full'}`}
      data-field={field.field}
    >
      <ChildFieldsRenderer {...childProps} />
    </Box>
  );
};

export default FormGroupField;
