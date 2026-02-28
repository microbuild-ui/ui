import type { Meta, StoryObj } from '@storybook/react';
import { GroupAccordion } from './GroupAccordion';
import { Input } from '../input';
import { Toggle } from '../toggle';
import { RichTextHTML } from '../rich-text-html/RichTextHTML';
import '../stories-shared.css';

const meta: Meta<typeof GroupAccordion> = {
  title: 'Interfaces/GroupAccordion',
  component: GroupAccordion,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `An accordion-style group that renders child fields as expandable sections.

## Features
- Accordion mode (one section at a time) or multi-expand
- Start state: closed, first open, or all open
- Shift+click to toggle all (multi mode)
- Validation error auto-open
- Edited indicator
- Directus equivalent: group-accordion

## Usage
\`\`\`tsx
import { GroupAccordion } from '@buildpad/ui-interfaces';

<GroupAccordion
  field={{ name: 'Settings', meta: { field: 'settings' } }}
  fields={allFields}
  accordionMode={true}
  start="first"
  renderSection={(section) => <FormFields section={section} />}
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    accordionMode: {
      control: 'boolean',
      description: 'When true, only one section can be open at a time',
    },
    start: {
      control: 'select',
      options: ['closed', 'first', 'opened'],
      description: 'Initial open state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Shared mock data
const accordionField = {
  name: 'Settings',
  meta: { field: 'settings_group', special: ['alias', 'group', 'no-data'] },
};

const sectionFields = [
  {
    field: 'general',
    name: 'General Settings',
    meta: { group: 'settings_group', field: 'general', special: ['alias', 'group', 'no-data'] },
  },
  {
    field: 'notifications',
    name: 'Notification Preferences',
    meta: { group: 'settings_group', field: 'notifications', special: ['alias', 'group', 'no-data'] },
  },
  {
    field: 'advanced',
    name: 'Advanced Options',
    meta: { group: 'settings_group', field: 'advanced', special: ['alias', 'group', 'no-data'] },
  },
];

const allFields = [accordionField as any, ...sectionFields];

export const AccordionMode: Story = {
  args: {
    field: accordionField,
    fields: allFields,
    accordionMode: true,
    start: 'first',
    renderSection: (section: any) => (
      <div className="story-pad-stack-12">
        <Input label={`${section.name} - Field 1`} placeholder="Enter value" />
        <Input label={`${section.name} - Field 2`} placeholder="Enter value" />
      </div>
    ),
  },
};

export const MultiExpandMode: Story = {
  args: {
    field: accordionField,
    fields: allFields,
    accordionMode: false,
    start: 'opened',
    renderSection: (section: any) => (
      <div className="story-pad-stack-12">
        <Input label={`${section.name} - Field 1`} placeholder="Enter value" />
        <Toggle label={`Enable ${section.name}`} />
      </div>
    ),
  },
};

export const AllClosed: Story = {
  args: {
    field: accordionField,
    fields: allFields,
    accordionMode: true,
    start: 'closed',
    renderSection: (section: any) => (
      <div className="story-pad-stack-12">
        <Input label={`${section.name} - Field`} placeholder="Enter value" />
      </div>
    ),
  },
};

export const WithBadge: Story = {
  args: {
    field: accordionField,
    fields: allFields,
    accordionMode: false,
    start: 'first',
    badge: 'Optional',
    renderSection: (section: any) => (
      <div className="story-pad-stack-12">
        <Input label={`${section.name} - Field`} placeholder="Enter value" />
      </div>
    ),
  },
};

export const Disabled: Story = {
  args: {
    field: accordionField,
    fields: allFields,
    accordionMode: true,
    start: 'closed',
    disabled: true,
    renderSection: (section: any) => (
      <div className="story-pad-stack-12">
        <Input label={`${section.name} - Field`} placeholder="Enter value" disabled />
      </div>
    ),
  },
};

// ============================================================================
// Regular fields as sections (Directus pattern)
// In Directus, ALL direct children of an accordion become sections,
// including regular (non-group) fields like text inputs.
// ============================================================================

const regularAccordionField = {
  name: 'Test Accordion',
  meta: { field: 'test_accordion', special: ['alias', 'group', 'no-data'] },
};

const regularSectionFields = [
  {
    field: 'test_input',
    name: 'Test Input',
    type: 'string',
    meta: { group: 'test_accordion', field: 'test_input', interface: 'input' },
  },
  {
    field: 'test_input2',
    name: 'Test Input 2',
    type: 'string',
    meta: { group: 'test_accordion', field: 'test_input2', interface: 'input' },
  },
  {
    field: 'rich_text_editor',
    name: 'Rich Text Editor',
    type: 'text',
    meta: { group: 'test_accordion', field: 'rich_text_editor', interface: 'input-multiline' },
  },
];

const regularAllFields = [regularAccordionField as any, ...regularSectionFields];

/**
 * Regular fields as accordion sections (Directus pattern).
 * Each direct child field becomes a section header.
 * The section content renders the field itself (with hideLabel).
 */
export const RegularFieldSections: Story = {
  args: {
    field: regularAccordionField,
    fields: regularAllFields,
    accordionMode: true,
    start: 'first',
    renderSection: (section: any) => (
      <div className="story-pad-stack-12">
        <Input
          label=""
          placeholder={`Enter ${section.name?.toLowerCase() || section.field}...`}
        />
      </div>
    ),
  },
};

/**
 * Mixed sections: some are group fields (with nested children),
 * some are regular fields rendered directly as sections.
 */
export const MixedSections: Story = {
  args: {
    field: {
      name: 'Mixed Accordion',
      meta: { field: 'mixed_accordion', special: ['alias', 'group', 'no-data'] },
    },
    fields: [
      {
        name: 'Mixed Accordion',
        meta: { field: 'mixed_accordion', special: ['alias', 'group', 'no-data'] },
      },
      // Regular field as section
      {
        field: 'standalone_input',
        name: 'Standalone Input',
        type: 'string',
        meta: { group: 'mixed_accordion', field: 'standalone_input', interface: 'input' },
      },
      // Group field as section (with nested children)
      {
        field: 'contact_group',
        name: 'Contact Details',
        meta: {
          group: 'mixed_accordion',
          field: 'contact_group',
          special: ['alias', 'group', 'no-data'],
        },
      },
      { field: 'email', name: 'Email', meta: { group: 'contact_group', interface: 'input' } },
      { field: 'phone', name: 'Phone', meta: { group: 'contact_group', interface: 'input' } },
      // Another regular field
      {
        field: 'notes_field',
        name: 'Notes',
        type: 'text',
        meta: { group: 'mixed_accordion', field: 'notes_field', interface: 'input-multiline' },
      },
    ] as any,
    accordionMode: false,
    start: 'opened',
    renderSection: (section: any) => {
      const isGroup = section.meta?.special?.includes?.('group');
      if (isGroup) {
        return (
          <div className="story-pad-stack-12">
            <Input label="Email" placeholder="email@example.com" />
            <Input label="Phone" placeholder="+1 234 567 890" />
          </div>
        );
      }
      return (
        <div className="story-pad-stack-12">
          <Input label="" placeholder={`Enter ${section.name?.toLowerCase()}...`} />
        </div>
      );
    },
  },
};


// ============================================================================
// WYSIWYG (RichTextHTML) inside accordion — regression test
// Verifies that Tiptap editor renders correctly when mounted inside
// a previously-hidden accordion section.
// ============================================================================

const wysiwygAccordionField = {
  name: 'Content Sections',
  meta: { field: 'content_sections', special: ['alias', 'group', 'no-data'] },
};

const wysiwygSectionFields = [
  {
    field: 'basic_input',
    name: 'Basic Input',
    type: 'string',
    meta: { group: 'content_sections', field: 'basic_input', interface: 'input' },
  },
  {
    field: 'richtext_section',
    name: 'Rich Text Content',
    type: 'text',
    meta: { group: 'content_sections', field: 'richtext_section', interface: 'input-rich-text-html' },
  },
  {
    field: 'another_input',
    name: 'Another Input',
    type: 'string',
    meta: { group: 'content_sections', field: 'another_input', interface: 'input' },
  },
];

const wysiwygAllFields = [wysiwygAccordionField as any, ...wysiwygSectionFields];

/**
 * WYSIWYG editor (RichTextHTML) inside an accordion section.
 * This is a regression test: the Tiptap editor must render its content
 * area with proper height when the accordion section is opened.
 * Click "Rich Text Content" to expand and verify the editor appears.
 */
export const WithRichTextEditor: Story = {
  args: {
    field: wysiwygAccordionField,
    fields: wysiwygAllFields,
    accordionMode: true,
    start: 'closed',
    renderSection: (section: any) => {
      if (section.meta?.interface === 'input-rich-text-html') {
        return (
          <RichTextHTML
            placeholder="Start typing rich content..."
            value="<p>Hello from inside the accordion!</p>"
          />
        );
      }
      return (
        <div className="story-pad-stack-12">
          <Input label="" placeholder={`Enter ${section.name?.toLowerCase()}...`} />
        </div>
      );
    },
  },
};

/**
 * Same as above but with the WYSIWYG section open by default (start="first"
 * won't open it since it's the second section). Uses multi-expand + opened
 * to verify the editor also works when rendered immediately.
 */
export const WithRichTextEditorOpen: Story = {
  args: {
    field: wysiwygAccordionField,
    fields: wysiwygAllFields,
    accordionMode: false,
    start: 'opened',
    renderSection: (section: any) => {
      if (section.meta?.interface === 'input-rich-text-html') {
        return (
          <RichTextHTML
            placeholder="Start typing rich content..."
            value="<p>This editor was visible from the start.</p>"
          />
        );
      }
      return (
        <div className="story-pad-stack-12">
          <Input label="" placeholder={`Enter ${section.name?.toLowerCase()}...`} />
        </div>
      );
    },
  },
};
