import React from 'react';
import { Box } from '@mantine/core';

/**
 * GroupRaw - Transparent group wrapper that renders child fields inline
 * without any visual container or collapsible behavior.
 *
 * Directus equivalent: group-raw (no options, just a pass-through wrapper)
 */
export interface GroupRawProps {
  /** Field configuration object */
  field?: {
    name?: string;
    meta?: {
      field?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };

  /** Array of field configurations */
  fields?: Array<{
    field: string;
    name?: string;
    type?: string;
    meta?: any;
    schema?: any;
  }>;

  /** Current form values */
  values?: Record<string, any>;

  /** Initial form values */
  initialValues?: Record<string, any>;

  /** Whether the form is disabled */
  disabled?: boolean;

  /** Whether in batch mode */
  batchMode?: boolean;

  /** Active fields in batch mode */
  batchActiveFields?: string[];

  /** Primary key of the record */
  primaryKey?: string | number;

  /** Whether the form is loading */
  loading?: boolean;

  /** Validation errors */
  validationErrors?: Array<{
    field: string;
    code: string;
    type: string;
    [key: string]: any;
  }>;

  /** Badge text */
  badge?: string;

  /** Whether raw editor is enabled */
  rawEditorEnabled?: boolean;

  /** Text direction */
  direction?: 'ltr' | 'rtl';

  /** Form content to render inside */
  children?: React.ReactNode;

  /** Callback when form values change */
  onChange?: (values: Record<string, any>) => void;
}

export function GroupRaw({
  children,
  direction: _direction,
}: GroupRawProps) {
  return (
    <Box className="group-raw">
      {children}
    </Box>
  );
}

export default GroupRaw;
