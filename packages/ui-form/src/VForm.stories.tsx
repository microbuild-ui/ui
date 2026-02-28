import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VForm } from './VForm';
import type { Field, FieldMeta, FieldSchema } from '@buildpad/types';
import type { FieldValues } from './types';
import './VForm.stories.css';

/**
 * VForm - Dynamic Form Component
 * 
 * The VForm component dynamically renders form fields based on a collection schema,
 * similar to DaaS v-form. It supports various interface types, validation,
 * field permissions, and responsive layouts.
 * 
 * ## Features
 * - Dynamic field rendering based on schema
 * - Multiple interface types (input, textarea, boolean, datetime, select, etc.)
 * - Field-level validation with error display
 * - Responsive width system (full, half, half-left, half-right, fill)
 * - Edit mode with existing values
 * - Create mode with defaults
 * - Hidden and readonly field support
 */
const meta: Meta<typeof VForm> = {
  title: 'Forms/VForm',
  component: VForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Dynamic form component that renders fields based on collection schema.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    collection: {
      control: 'text',
      description: 'Collection name to load fields from API',
    },
    fields: {
      control: 'object',
      description: 'Explicit field definitions (overrides collection)',
    },
    primaryKey: {
      control: 'text',
      description: 'Primary key value (+ for create mode)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all form fields',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VForm>;

// ============================================================================
// Mock Field Data for Stories
// ============================================================================

// Type-safe field options for createField helper
interface CreateFieldOptions {
  meta?: Partial<FieldMeta>;
  schema?: Partial<FieldSchema>;
}

const createField = (
  field: string,
  type: string,
  interfaceType: string,
  options: CreateFieldOptions = {}
): Field => ({
  field,
  type,
  collection: 'test_collection',
  schema: {
    name: field,
    table: 'test_collection',
    data_type: type,
    is_nullable: true,
    is_unique: false,
    is_primary_key: false,
    has_auto_increment: false,
    ...options.schema,
  },
  meta: {
    id: Math.random(),
    collection: 'test_collection',
    field,
    interface: interfaceType,
    display: null,
    display_options: null,
    readonly: false,
    hidden: false,
    sort: null,
    width: 'full',
    group: null,
    note: null,
    required: false,
    options: null,
    special: null,
    validation: null,
    validation_message: null,
    ...options.meta,
  },
});

// Basic string fields
const basicFields: Field[] = [
  createField('title', 'string', 'input', {
    meta: {
      required: true,
      width: 'full',
      options: { placeholder: 'Enter title...' },
    },
    schema: { is_nullable: false, max_length: 255 },
  }),
  createField('slug', 'string', 'input', {
    meta: {
      width: 'half',
      options: { placeholder: 'url-friendly-slug' },
    },
  }),
  createField('status', 'string', 'select-dropdown', {
    meta: {
      width: 'half',
      options: {
        choices: [
          { text: 'Draft', value: 'draft' },
          { text: 'Published', value: 'published' },
          { text: 'Archived', value: 'archived' },
        ],
      },
    },
  }),
];

// Comprehensive field types
const allFieldTypes: Field[] = [
  // Text input
  createField('name', 'string', 'input', {
    meta: {
      required: true,
      width: 'full',
      note: 'Enter your full name',
      options: { placeholder: 'John Doe' },
    },
    schema: { is_nullable: false },
  }),
  
  // Email with validation
  createField('email', 'string', 'input', {
    meta: {
      width: 'half',
      options: { placeholder: 'email@example.com' },
      validation: { _regex: '^[^@]+@[^@]+\\.[^@]+$' },
      validation_message: 'Please enter a valid email address',
    },
  }),
  
  // URL field
  createField('website', 'string', 'input', {
    meta: {
      width: 'half',
      options: { placeholder: 'https://...' },
    },
  }),
  
  // Textarea
  createField('description', 'text', 'input-multiline', {
    meta: {
      width: 'full',
      note: 'Describe your project in detail',
      options: { placeholder: 'Enter description...', rows: 4 },
    },
  }),
  
  // Boolean toggle
  createField('is_active', 'boolean', 'boolean', {
    meta: {
      width: 'half',
      note: 'Is this item active?',
    },
  }),
  
  // DateTime
  createField('publish_date', 'timestamp', 'datetime', {
    meta: {
      width: 'half',
      note: 'When should this be published?',
    },
  }),
  
  // Select dropdown
  createField('category', 'string', 'select-dropdown', {
    meta: {
      width: 'half',
      options: {
        choices: [
          { text: 'Technology', value: 'tech' },
          { text: 'Design', value: 'design' },
          { text: 'Business', value: 'business' },
          { text: 'Other', value: 'other' },
        ],
        allowNone: true,
      },
    },
  }),
  
  // Priority slider
  createField('priority', 'integer', 'slider', {
    meta: {
      width: 'half',
      note: 'Set the priority level (1-5)',
      options: { min: 1, max: 5, step: 1 },
    },
  }),
  
  // Tags
  createField('tags', 'json', 'tags', {
    meta: {
      width: 'full',
      note: 'Add relevant tags',
      options: { placeholder: 'Add a tag...' },
    },
  }),
  
  // Code editor
  createField('metadata', 'json', 'input-code', {
    meta: {
      width: 'full',
      note: 'Additional metadata in JSON format',
      options: { language: 'json' },
    },
  }),
];

// ============================================================================
// Interactive Wrapper for Stories
// ============================================================================

interface VFormWrapperProps {
  fields: Field[];
  initialValues?: FieldValues;
  primaryKey?: string | number;
  disabled?: boolean;
  loading?: boolean;
  validationErrors?: Array<{ field: string; type: string; message?: string }>;
}

const VFormWrapper: React.FC<VFormWrapperProps> = ({
  fields,
  initialValues = {},
  primaryKey = '+',
  disabled = false,
  loading = false,
  validationErrors = [],
}) => {
  const [values, setValues] = useState<FieldValues>(initialValues);

  return (
    <div>
      <VForm
        fields={fields}
        modelValue={values}
        initialValues={initialValues}
        onUpdate={setValues}
        primaryKey={primaryKey}
        disabled={disabled}
        loading={loading}
        validationErrors={validationErrors}
        autofocus
      />
      
      {/* Debug panel showing current values */}
      <div className="vform-stories-debug-panel">
        <strong>Current Form Values:</strong>
        <pre className="vform-stories-debug-pre">
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// ============================================================================
// Stories
// ============================================================================

/**
 * Basic form with essential fields
 */
export const Basic: Story = {
  render: () => <VFormWrapper fields={basicFields} />,
  parameters: {
    docs: {
      description: {
        story: 'A basic form with title, slug, and status fields.',
      },
    },
  },
};

/**
 * Comprehensive form with all field types
 */
export const AllFieldTypes: Story = {
  render: () => <VFormWrapper fields={allFieldTypes} />,
  parameters: {
    docs: {
      description: {
        story: 'Showcases all supported interface types: input, textarea, boolean, datetime, select, slider, tags, and code editor.',
      },
    },
  },
};

/**
 * Form in edit mode with existing values
 */
export const EditMode: Story = {
  render: () => (
    <VFormWrapper
      fields={allFieldTypes}
      primaryKey="existing-item-id"
      initialValues={{
        name: 'John Doe',
        email: 'john@example.com',
        website: 'https://example.com',
        description: 'This is an existing item that we are editing.',
        is_active: true,
        publish_date: new Date().toISOString(),
        category: 'tech',
        priority: 3,
        // Note: tags and metadata not included to avoid interface-specific value format issues
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Form populated with existing values for editing.',
      },
    },
  },
};

/**
 * Form with validation errors
 */
export const WithValidationErrors: Story = {
  render: () => (
    <VFormWrapper
      fields={allFieldTypes}
      initialValues={{
        email: 'invalid-email',
        name: '',
      }}
      validationErrors={[
        { field: 'name', type: 'required', message: 'Name is required' },
        { field: 'email', type: 'regex', message: 'Please enter a valid email address' },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Form displaying validation errors for specific fields.',
      },
    },
  },
};

/**
 * Disabled form
 */
export const Disabled: Story = {
  render: () => (
    <VFormWrapper
      fields={allFieldTypes}
      disabled
      initialValues={{
        name: 'Cannot Edit',
        email: 'locked@example.com',
        is_active: false,
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Form with all fields disabled.',
      },
    },
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  render: () => <VFormWrapper fields={allFieldTypes} loading />,
  parameters: {
    docs: {
      description: {
        story: 'Form in loading state showing skeletons.',
      },
    },
  },
};

/**
 * Form with half-width layout
 */
export const HalfWidthLayout: Story = {
  render: () => {
    const halfWidthFields: Field[] = [
      createField('first_name', 'string', 'input', {
        meta: { width: 'half', required: true },
      }),
      createField('last_name', 'string', 'input', {
        meta: { width: 'half', required: true },
      }),
      createField('email', 'string', 'input', {
        meta: { width: 'half' },
      }),
      createField('phone', 'string', 'input', {
        meta: { width: 'half' },
      }),
      createField('address', 'string', 'input', {
        meta: { width: 'full' },
      }),
      createField('city', 'string', 'input', {
        meta: { width: 'half' },
      }),
      createField('country', 'string', 'select-dropdown', {
        meta: {
          width: 'half',
          options: {
            choices: [
              { text: 'United States', value: 'US' },
              { text: 'Canada', value: 'CA' },
              { text: 'United Kingdom', value: 'UK' },
              { text: 'Singapore', value: 'SG' },
            ],
          },
        },
      }),
    ];
    return <VFormWrapper fields={halfWidthFields} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Form demonstrating the half-width layout grid system.',
      },
    },
  },
};

/**
 * Form with readonly fields
 */
export const WithReadonlyFields: Story = {
  render: () => {
    const fieldsWithReadonly: Field[] = [
      createField('id', 'uuid', 'input', {
        meta: { readonly: true, width: 'full' },
      }),
      createField('title', 'string', 'input', {
        meta: { required: true, width: 'full' },
      }),
      createField('date_created', 'timestamp', 'datetime', {
        meta: { readonly: true, width: 'half' },
      }),
      createField('date_updated', 'timestamp', 'datetime', {
        meta: { readonly: true, width: 'half' },
      }),
    ];
    return (
      <VFormWrapper
        fields={fieldsWithReadonly}
        primaryKey="abc-123"
        initialValues={{
          id: 'abc-123-def-456',
          title: 'Existing Document',
          date_created: '2024-01-15T10:30:00Z',
          date_updated: '2024-01-20T14:45:00Z',
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with system fields marked as readonly (id, date_created, date_updated).',
      },
    },
  },
};

/**
 * Empty form (no fields)
 */
export const EmptyForm: Story = {
  render: () => <VFormWrapper fields={[]} />,
  parameters: {
    docs: {
      description: {
        story: 'Form with no visible fields shows a message.',
      },
    },
  },
};

/**
 * Required fields only
 */
export const RequiredFieldsOnly: Story = {
  render: () => {
    const requiredFields: Field[] = [
      createField('username', 'string', 'input', {
        meta: { required: true, width: 'full' },
        schema: { is_nullable: false },
      }),
      createField('password', 'string', 'input', {
        meta: {
          required: true,
          width: 'full',
          options: { masked: true },
        },
        schema: { is_nullable: false },
      }),
      createField('confirm_password', 'string', 'input', {
        meta: {
          required: true,
          width: 'full',
          options: { masked: true },
        },
        schema: { is_nullable: false },
      }),
    ];
    return <VFormWrapper fields={requiredFields} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with only required fields, showing required indicators.',
      },
    },
  },
};

// ============================================================================
// Group Interface Stories
// ============================================================================

// Helper to create a group field (type=alias, special includes 'group')
const createGroupField = (
  field: string,
  interfaceType: 'group-detail' | 'group-accordion' | 'group-raw',
  options: CreateFieldOptions = {}
): Field => ({
  field,
  type: 'alias',
  collection: 'test_collection',
  name: options.meta?.name ?? field,
  schema: undefined,
  meta: {
    id: Math.random(),
    collection: 'test_collection',
    field,
    interface: interfaceType,
    display: null,
    display_options: null,
    readonly: false,
    hidden: false,
    sort: null,
    width: 'full',
    group: null,
    note: null,
    required: false,
    options: options.meta?.options ?? null,
    special: ['alias', 'group', 'no-data'],
    validation: null,
    validation_message: null,
    ...options.meta,
    // Ensure special is always set for groups
    ...(options.meta?.special ? {} : {}),
  },
});

// Helper to create a child field that belongs to a group
const createChildField = (
  field: string,
  type: string,
  interfaceType: string,
  groupName: string,
  options: CreateFieldOptions = {}
): Field => createField(field, type, interfaceType, {
  ...options,
  meta: {
    group: groupName,
    ...options.meta,
  },
});

// Fields with group-detail wrapper
const groupDetailFields: Field[] = [
  // A standalone field outside any group
  createField('page_title', 'string', 'input', {
    meta: { width: 'full', required: true, sort: 1 },
  }),
  // Group-detail parent
  createGroupField('basic_info', 'group-detail', {
    meta: {
      sort: 2,
      name: 'Basic Information',
      options: { start: 'open', headerIcon: 'menu_open' },
    },
  }),
  // Children of basic_info group
  createChildField('first_name', 'string', 'input', 'basic_info', {
    meta: { width: 'half', sort: 1 },
  }),
  createChildField('last_name', 'string', 'input', 'basic_info', {
    meta: { width: 'half', sort: 2 },
  }),
  createChildField('bio', 'text', 'input-multiline', 'basic_info', {
    meta: { width: 'full', sort: 3 },
  }),
  // Another group-detail (starts closed)
  createGroupField('settings_group', 'group-detail', {
    meta: {
      sort: 3,
      name: 'Settings',
      options: { start: 'closed' },
    },
  }),
  createChildField('is_active', 'boolean', 'boolean', 'settings_group', {
    meta: { width: 'half', sort: 1 },
  }),
  createChildField('role', 'string', 'select-dropdown', 'settings_group', {
    meta: {
      width: 'half',
      sort: 2,
      options: {
        choices: [
          { text: 'Admin', value: 'admin' },
          { text: 'Editor', value: 'editor' },
          { text: 'Viewer', value: 'viewer' },
        ],
      },
    },
  }),
];

/**
 * Form with GroupDetail interface
 */
export const WithGroupDetail: Story = {
  render: () => <VFormWrapper fields={groupDetailFields} />,
  parameters: {
    docs: {
      description: {
        story: 'Form with group-detail interfaces. Fields are wrapped in collapsible sections. '
          + '"Basic Information" starts open, "Settings" starts closed.',
      },
    },
  },
};

// Fields with group-raw wrapper (transparent, no visual container)
const groupRawFields: Field[] = [
  createField('heading', 'string', 'input', {
    meta: { width: 'full', sort: 1 },
  }),
  createGroupField('inline_group', 'group-raw', {
    meta: { sort: 2, name: 'Inline Group' },
  }),
  createChildField('color', 'string', 'select-dropdown', 'inline_group', {
    meta: {
      width: 'half',
      sort: 1,
      options: {
        choices: [
          { text: 'Red', value: 'red' },
          { text: 'Blue', value: 'blue' },
          { text: 'Green', value: 'green' },
        ],
      },
    },
  }),
  createChildField('size', 'string', 'select-dropdown', 'inline_group', {
    meta: {
      width: 'half',
      sort: 2,
      options: {
        choices: [
          { text: 'Small', value: 'sm' },
          { text: 'Medium', value: 'md' },
          { text: 'Large', value: 'lg' },
        ],
      },
    },
  }),
  createField('notes', 'text', 'input-multiline', {
    meta: { width: 'full', sort: 3 },
  }),
];

/**
 * Form with GroupRaw interface
 */
export const WithGroupRaw: Story = {
  render: () => <VFormWrapper fields={groupRawFields} />,
  parameters: {
    docs: {
      description: {
        story: 'Form with group-raw interface. The group is a transparent wrapper — '
          + 'child fields render inline without any visual container.',
      },
    },
  },
};

// Mixed group types in one form
const mixedGroupFields: Field[] = [
  createField('document_title', 'string', 'input', {
    meta: { width: 'full', required: true, sort: 1 },
  }),
  // Group Detail
  createGroupField('metadata_group', 'group-detail', {
    meta: {
      sort: 2,
      name: 'Metadata',
      options: { start: 'open' },
    },
  }),
  createChildField('author', 'string', 'input', 'metadata_group', {
    meta: { width: 'half', sort: 1 },
  }),
  createChildField('publish_date', 'timestamp', 'datetime', 'metadata_group', {
    meta: { width: 'half', sort: 2 },
  }),
  // Group Raw
  createGroupField('flags_group', 'group-raw', {
    meta: { sort: 3, name: 'Flags' },
  }),
  createChildField('featured', 'boolean', 'boolean', 'flags_group', {
    meta: { width: 'half', sort: 1 },
  }),
  createChildField('pinned', 'boolean', 'boolean', 'flags_group', {
    meta: { width: 'half', sort: 2 },
  }),
  // Another Group Detail (closed)
  createGroupField('advanced_group', 'group-detail', {
    meta: {
      sort: 4,
      name: 'Advanced Settings',
      options: { start: 'closed' },
    },
  }),
  createChildField('slug', 'string', 'input', 'advanced_group', {
    meta: { width: 'full', sort: 1 },
  }),
  createChildField('seo_description', 'text', 'input-multiline', 'advanced_group', {
    meta: { width: 'full', sort: 2 },
  }),
];

// Fields with group-accordion wrapper (sections are sub-groups)
// Directus pattern: accordion children are group fields, each containing form fields
const groupAccordionFields: Field[] = [
  createField('page_title', 'string', 'input', {
    meta: { width: 'full', required: true, sort: 1 },
  }),
  // Accordion parent
  createGroupField('details_accordion', 'group-accordion', {
    meta: {
      sort: 2,
      name: 'Details',
      options: { accordionMode: true, start: 'first' },
    },
  }),
  // Section A (group field, child of accordion)
  createGroupField('personal_section', 'group-detail', {
    meta: {
      sort: 1,
      name: 'Personal Info',
      group: 'details_accordion',
    },
  }),
  // Fields inside Section A
  createChildField('first_name', 'string', 'input', 'personal_section', {
    meta: { width: 'half', sort: 1 },
  }),
  createChildField('last_name', 'string', 'input', 'personal_section', {
    meta: { width: 'half', sort: 2 },
  }),
  createChildField('email', 'string', 'input', 'personal_section', {
    meta: { width: 'full', sort: 3 },
  }),
  // Section B (group field, child of accordion)
  createGroupField('address_section', 'group-detail', {
    meta: {
      sort: 2,
      name: 'Address',
      group: 'details_accordion',
    },
  }),
  // Fields inside Section B
  createChildField('street', 'string', 'input', 'address_section', {
    meta: { width: 'full', sort: 1 },
  }),
  createChildField('city', 'string', 'input', 'address_section', {
    meta: { width: 'half', sort: 2 },
  }),
  createChildField('zip_code', 'string', 'input', 'address_section', {
    meta: { width: 'half', sort: 3 },
  }),
  // Section C
  createGroupField('preferences_section', 'group-detail', {
    meta: {
      sort: 3,
      name: 'Preferences',
      group: 'details_accordion',
    },
  }),
  createChildField('newsletter', 'boolean', 'boolean', 'preferences_section', {
    meta: { width: 'half', sort: 1 },
  }),
  createChildField('theme', 'string', 'select-dropdown', 'preferences_section', {
    meta: {
      width: 'half',
      sort: 2,
      options: {
        choices: [
          { text: 'Light', value: 'light' },
          { text: 'Dark', value: 'dark' },
          { text: 'System', value: 'system' },
        ],
      },
    },
  }),
];

/**
 * Form with GroupAccordion interface
 */
export const WithGroupAccordion: Story = {
  render: () => <VFormWrapper fields={groupAccordionFields} />,
  parameters: {
    docs: {
      description: {
        story: 'Form with group-accordion interface. Each accordion section is a group field '
          + 'containing form fields. "Personal Info" starts open (start=first). '
          + 'In accordion mode, only one section can be open at a time.',
      },
    },
  },
};

// Accordion with regular (non-group) fields as direct children — Directus pattern
// In Directus, ALL direct children of an accordion become sections,
// including regular fields like text inputs. The field renders inside
// the expanded section with hideLabel.
const regularAccordionFields: Field[] = [
  createField('page_title', 'string', 'input', {
    meta: { width: 'full', required: true, sort: 1 },
  }),
  // Accordion parent
  createGroupField('test_accordion', 'group-accordion', {
    meta: {
      sort: 2,
      name: 'Test Accordion',
      options: { accordionMode: true, start: 'first' },
    },
  }),
  // Regular fields as direct children of the accordion (not groups)
  createChildField('test_input', 'string', 'input', 'test_accordion', {
    meta: { width: 'full', sort: 1 },
  }),
  createChildField('test_input2', 'string', 'input', 'test_accordion', {
    meta: { width: 'full', sort: 2 },
  }),
  createChildField('rich_text_editor', 'text', 'input-multiline', 'test_accordion', {
    meta: { width: 'full', sort: 3 },
  }),
];

/**
 * Accordion with regular fields as sections (Directus pattern).
 * Each direct child field becomes a section header.
 * The section content renders the field itself (with hideLabel).
 * This matches the Directus data model screenshot where test_input,
 * test_input2, and rich_text_editor are direct children of the accordion.
 */
export const WithRegularFieldAccordion: Story = {
  render: () => <VFormWrapper fields={regularAccordionFields} />,
  parameters: {
    docs: {
      description: {
        story: 'Accordion with regular (non-group) fields as direct children. '
          + 'Each field becomes a section header, and the input renders inside '
          + 'the expanded section. Matches the Directus accordion pattern.',
      },
    },
  },
};

/**
 * Form with mixed group types
 */
export const WithMixedGroups: Story = {
  render: () => <VFormWrapper fields={mixedGroupFields} />,
  parameters: {
    docs: {
      description: {
        story: 'Form combining group-detail and group-raw interfaces. '
          + 'Demonstrates that different group types can coexist in the same form.',
      },
    },
  },
};
