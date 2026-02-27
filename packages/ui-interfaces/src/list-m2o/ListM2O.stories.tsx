import type { Meta, StoryObj } from '@storybook/react';
import { ListM2O } from './ListM2O';

const meta: Meta<typeof ListM2O> = {
  title: 'Interfaces/ListM2O',
  component: ListM2O,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Many-to-One (M2O) relationship interface - allows selecting ONE item from a related collection.

## Features
- Dropdown or modal layout modes
- Search/filter functionality
- Create new related items
- Link to related items
- Template display customization

## Use Case
Example: A "post" belongs to ONE "category". The post has a \`category_id\` foreign key.

## Usage
\`\`\`tsx
import { ListM2O } from '@buildpad/ui-interfaces';

<ListM2O
  collection="posts"
  field="category_id"
  value={categoryId}
  onChange={(value) => setCategoryId(value)}
  layout="dropdown"
/>
\`\`\`

**Note:** This component requires configured relationship hooks for live data.`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value - the foreign key (ID of the related item)',
    },
    collection: {
      control: 'text',
      description: 'Current collection name',
    },
    field: {
      control: 'text',
      description: 'Field name for this M2O relationship',
    },
    layout: {
      control: 'select',
      options: ['dropdown', 'modal'],
      description: 'Layout mode',
    },
    template: {
      control: 'text',
      description: 'Template string for display',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the interface is disabled',
    },
    enableCreate: {
      control: 'boolean',
      description: 'Enable create new items button',
    },
    enableLink: {
      control: 'boolean',
      description: 'Enable link to related items',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search/filter',
    },
    label: {
      control: 'text',
      description: 'Field label',
    },
    description: {
      control: 'text',
      description: 'Field description',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the field is read-only',
    },
    allowNone: {
      control: 'boolean',
      description: 'Allow clearing the selection',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Category',
    collection: 'posts',
    field: 'category_id',
    placeholder: 'Select a category...',
  },
};

export const DropdownLayout: Story = {
  args: {
    label: 'Author',
    collection: 'articles',
    field: 'author_id',
    layout: 'dropdown',
    placeholder: 'Select an author...',
    description: 'Compact dropdown selector',
  },
};

export const ModalLayout: Story = {
  args: {
    label: 'Department',
    collection: 'employees',
    field: 'department_id',
    layout: 'modal',
    placeholder: 'Choose department...',
    description: 'Opens a modal for selection',
  },
};

export const WithTemplate: Story = {
  args: {
    label: 'Manager',
    collection: 'employees',
    field: 'manager_id',
    template: '{{first_name}} {{last_name}} - {{title}}',
    placeholder: 'Select manager...',
  },
};

export const Searchable: Story = {
  args: {
    label: 'Customer',
    collection: 'orders',
    field: 'customer_id',
    searchable: true,
    placeholder: 'Search customers...',
  },
};

export const WithCreateEnabled: Story = {
  args: {
    label: 'Brand',
    collection: 'products',
    field: 'brand_id',
    enableCreate: true,
    placeholder: 'Select or create brand...',
  },
};

export const WithLinkEnabled: Story = {
  args: {
    label: 'Parent Category',
    collection: 'categories',
    field: 'parent_id',
    enableLink: true,
    placeholder: 'Select parent...',
    description: 'Can link to view the selected item',
  },
};

export const AllowNone: Story = {
  args: {
    label: 'Supervisor (Optional)',
    collection: 'employees',
    field: 'supervisor_id',
    allowNone: true,
    placeholder: 'None selected',
    description: 'Selection can be cleared',
  },
};

export const Required: Story = {
  args: {
    label: 'Organization',
    collection: 'users',
    field: 'organization_id',
    required: true,
    placeholder: 'Select organization...',
  },
};

export const WithError: Story = {
  args: {
    label: 'Team',
    collection: 'members',
    field: 'team_id',
    error: 'Please select a team',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Status',
    collection: 'orders',
    field: 'status_id',
    disabled: true,
    value: 'status-1',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Created By',
    collection: 'documents',
    field: 'created_by',
    readOnly: true,
    value: 'user-123',
  },
};

export const FullFeatured: Story = {
  args: {
    label: 'Assigned To',
    collection: 'tasks',
    field: 'assigned_to',
    layout: 'dropdown',
    searchable: true,
    enableCreate: true,
    enableLink: true,
    allowNone: true,
    template: '{{name}} ({{email}})',
    placeholder: 'Select assignee...',
    description: 'Assign this task to a team member',
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-featured M2O selector with all options enabled.',
      },
    },
  },
};

export const ProductCategory: Story = {
  args: {
    label: 'Product Category',
    collection: 'products',
    field: 'category_id',
    layout: 'dropdown',
    searchable: true,
    enableLink: true,
    placeholder: 'Choose category...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Common e-commerce use case.',
      },
    },
  },
};
