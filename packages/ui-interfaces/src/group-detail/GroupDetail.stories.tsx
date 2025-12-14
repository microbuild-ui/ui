import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupDetail } from './GroupDetail';
import { Input } from '../input';
import { Textarea } from '../textarea';
import { SelectDropdown } from '../select-dropdown';
import { Toggle } from '../toggle';

const meta: Meta<typeof GroupDetail> = {
  title: 'Interfaces/GroupDetail',
  component: GroupDetail,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A collapsible group/section container for organizing form fields.

## Features
- Collapsible/expandable sections
- Header with icon and badge
- Customizable colors
- LTR/RTL support
- Validation error display
- Optional apply button

## Usage
\`\`\`tsx
import { GroupDetail } from '@microbuild/ui-interfaces';

<GroupDetail
  field={{ name: 'Details', meta: { field: 'details' } }}
  start="open"
  headerIcon="settings"
>
  <Input label="Name" value={name} onChange={setName} />
  <Textarea label="Description" value={desc} onChange={setDesc} />
</GroupDetail>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    field: {
      control: 'object',
      description: 'Field configuration object',
    },
    fields: {
      control: 'object',
      description: 'Array of field configurations for the form',
    },
    values: {
      control: 'object',
      description: 'Current form values',
    },
    initialValues: {
      control: 'object',
      description: 'Initial form values for comparison',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the form is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the form is loading',
    },
    badge: {
      control: 'text',
      description: 'Badge text',
    },
    start: {
      control: 'select',
      options: ['open', 'closed'],
      description: 'Initial state',
    },
    headerIcon: {
      control: 'text',
      description: 'Header icon name',
    },
    headerColor: {
      control: 'color',
      description: 'Header color',
    },
    direction: {
      control: 'select',
      options: ['ltr', 'rtl'],
      description: 'Text direction',
    },
    validationErrors: {
      control: 'object',
      description: 'Validation errors',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    field: { name: 'Details', meta: { field: 'details' } },
    children: (
      <div style={{ padding: '16px' }}>
        <p>Group content goes here...</p>
      </div>
    ),
  },
};

export const StartOpen: Story = {
  args: {
    field: { name: 'Personal Information', meta: { field: 'personal' } },
    start: 'open',
    children: (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="First Name" placeholder="Enter first name" />
        <Input label="Last Name" placeholder="Enter last name" />
        <Input label="Email" placeholder="Enter email" type="string" />
      </div>
    ),
  },
};

export const StartClosed: Story = {
  args: {
    field: { name: 'Advanced Settings', meta: { field: 'advanced' } },
    start: 'closed',
    children: (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Toggle label="Enable caching" />
        <Toggle label="Debug mode" />
        <Input label="Timeout (ms)" type="integer" />
      </div>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    field: { name: 'Settings', meta: { field: 'settings' } },
    headerIcon: 'settings',
    start: 'open',
    children: (
      <div style={{ padding: '16px' }}>
        <Toggle label="Enable notifications" />
      </div>
    ),
  },
};

export const WithBadge: Story = {
  args: {
    field: { name: 'Optional Fields', meta: { field: 'optional' } },
    badge: 'Optional',
    start: 'closed',
    children: (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Nickname" placeholder="Optional nickname" />
        <Textarea label="Bio" placeholder="Tell us about yourself" />
      </div>
    ),
  },
};

export const CustomColor: Story = {
  args: {
    field: { name: 'Important Section', meta: { field: 'important' } },
    headerColor: '#6644FF',
    start: 'open',
    children: (
      <div style={{ padding: '16px' }}>
        <p>This section has a custom header color.</p>
      </div>
    ),
  },
};

export const WithValidationErrors: Story = {
  args: {
    field: { name: 'User Details', meta: { field: 'user' } },
    start: 'open',
    validationErrors: [
      { field: 'email', code: 'INVALID_EMAIL', type: 'validation' },
      { field: 'phone', code: 'REQUIRED', type: 'validation' },
    ],
    children: (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Email" error="Invalid email format" />
        <Input label="Phone" error="This field is required" />
      </div>
    ),
  },
};

export const Disabled: Story = {
  args: {
    field: { name: 'Locked Section', meta: { field: 'locked' } },
    disabled: true,
    start: 'open',
    children: (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Read Only Field" value="Cannot edit" disabled />
      </div>
    ),
  },
};

export const Loading: Story = {
  args: {
    field: { name: 'Loading Section', meta: { field: 'loading' } },
    loading: true,
    start: 'open',
    children: (
      <div style={{ padding: '16px' }}>
        <p>Content is loading...</p>
      </div>
    ),
  },
};

export const RTLDirection: Story = {
  args: {
    field: { name: 'قسم التفاصيل', meta: { field: 'rtl' } },
    direction: 'rtl',
    start: 'open',
    children: (
      <div style={{ padding: '16px', direction: 'rtl' }}>
        <p>محتوى بالعربية</p>
      </div>
    ),
  },
};

export const FormSection: Story = {
  args: {
    field: { name: 'Contact Information', meta: { field: 'contact' } },
    headerIcon: 'contacts',
    start: 'open',
    children: (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Full Name" placeholder="John Doe" required />
        <Input label="Email Address" placeholder="john@example.com" required />
        <Input label="Phone Number" placeholder="+1 (555) 000-0000" />
        <Textarea label="Address" placeholder="Enter your address" minRows={2} />
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Common use case for grouping related form fields.',
      },
    },
  },
};

export const MultipleGroups: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <GroupDetail
        field={{ name: 'Basic Info', meta: { field: 'basic' } }}
        start="open"
        headerIcon="info"
      >
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input label="Title" placeholder="Enter title" required />
          <Textarea label="Description" placeholder="Enter description" />
        </div>
      </GroupDetail>
      
      <GroupDetail
        field={{ name: 'Settings', meta: { field: 'settings' } }}
        start="closed"
        headerIcon="settings"
      >
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Toggle label="Published" />
          <Toggle label="Featured" />
        </div>
      </GroupDetail>
      
      <GroupDetail
        field={{ name: 'Advanced', meta: { field: 'advanced' } }}
        start="closed"
        badge="Optional"
      >
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input label="Slug" placeholder="custom-slug" />
          <Input label="Sort Order" type="integer" />
        </div>
      </GroupDetail>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple collapsible sections for complex forms.',
      },
    },
  },
};
