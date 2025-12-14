import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListO2M } from './ListO2M';

const meta: Meta<typeof ListO2M> = {
  title: 'Interfaces/ListO2M',
  component: ListO2M,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `One-to-Many (O2M) relationship interface - displays MULTIPLE items from a related collection that have a foreign key pointing to the current item.

## Features
- List or table layout modes
- Create new related items
- Select existing items
- Search/filter functionality
- Link to related items
- Remove action (unlink or delete)

## Use Case
Example: A "category" has MANY "posts" (posts have \`category_id\` foreign key).
This is the INVERSE of M2O - viewing the "many" side from the "one" perspective.

## Usage
\`\`\`tsx
import { ListO2M } from '@microbuild/ui-interfaces';

<ListO2M
  collection="categories"
  field="posts"
  primaryKey="cat-123"
  layout="table"
/>
\`\`\`

**Note:** This component requires configured relationship hooks for live data.`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'object',
      description: 'Array of related item IDs or objects',
    },
    collection: {
      control: 'text',
      description: 'Current collection name (the "one" side)',
    },
    field: {
      control: 'text',
      description: 'Field name for this O2M relationship',
    },
    primaryKey: {
      control: 'text',
      description: 'Primary key of the current item',
    },
    layout: {
      control: 'select',
      options: ['list', 'table'],
      description: 'Layout mode',
    },
    tableSpacing: {
      control: 'select',
      options: ['compact', 'cozy', 'comfortable'],
      description: 'Table spacing',
    },
    template: {
      control: 'text',
      description: 'Template string for list layout',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the interface is disabled',
    },
    enableCreate: {
      control: 'boolean',
      description: 'Enable create new items button',
    },
    enableSelect: {
      control: 'boolean',
      description: 'Enable select existing items button',
    },
    enableSearchFilter: {
      control: 'boolean',
      description: 'Enable search filter in table mode',
    },
    enableLink: {
      control: 'boolean',
      description: 'Enable link to related items',
    },
    limit: {
      control: 'number',
      description: 'Items per page',
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
    removeAction: {
      control: 'select',
      options: ['unlink', 'delete'],
      description: 'Action when removing items',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Related Posts',
    collection: 'categories',
    field: 'posts',
    primaryKey: 'cat-1',
  },
};

export const ListLayout: Story = {
  args: {
    label: 'Comments',
    collection: 'articles',
    field: 'comments',
    primaryKey: 'article-1',
    layout: 'list',
    template: '{{author}} - {{created_at}}',
  },
};

export const TableLayout: Story = {
  args: {
    label: 'Order Items',
    collection: 'orders',
    field: 'items',
    primaryKey: 'order-123',
    layout: 'table',
    fields: ['product_name', 'quantity', 'price'],
  },
};

export const CompactTable: Story = {
  args: {
    label: 'Tags',
    collection: 'posts',
    field: 'tags',
    primaryKey: 'post-1',
    layout: 'table',
    tableSpacing: 'compact',
  },
};

export const CozyTable: Story = {
  args: {
    label: 'Team Members',
    collection: 'projects',
    field: 'members',
    primaryKey: 'project-1',
    layout: 'table',
    tableSpacing: 'cozy',
  },
};

export const ComfortableTable: Story = {
  args: {
    label: 'Documents',
    collection: 'folders',
    field: 'documents',
    primaryKey: 'folder-1',
    layout: 'table',
    tableSpacing: 'comfortable',
  },
};

export const WithSearch: Story = {
  args: {
    label: 'Employees',
    collection: 'departments',
    field: 'employees',
    primaryKey: 'dept-1',
    layout: 'table',
    enableSearchFilter: true,
  },
};

export const CreateEnabled: Story = {
  args: {
    label: 'Tasks',
    collection: 'projects',
    field: 'tasks',
    primaryKey: 'project-1',
    enableCreate: true,
    enableSelect: false,
  },
};

export const SelectEnabled: Story = {
  args: {
    label: 'Assignees',
    collection: 'tickets',
    field: 'assignees',
    primaryKey: 'ticket-1',
    enableCreate: false,
    enableSelect: true,
  },
};

export const BothEnabled: Story = {
  args: {
    label: 'Contributors',
    collection: 'documents',
    field: 'contributors',
    primaryKey: 'doc-1',
    enableCreate: true,
    enableSelect: true,
  },
};

export const WithPagination: Story = {
  args: {
    label: 'Products',
    collection: 'categories',
    field: 'products',
    primaryKey: 'cat-1',
    layout: 'table',
    limit: 5,
  },
};

export const UnlinkAction: Story = {
  args: {
    label: 'Linked Items',
    collection: 'collections',
    field: 'items',
    primaryKey: 'col-1',
    removeAction: 'unlink',
    description: 'Removing unlinks the item (sets FK to null)',
  },
};

export const DeleteAction: Story = {
  args: {
    label: 'Child Items',
    collection: 'parents',
    field: 'children',
    primaryKey: 'parent-1',
    removeAction: 'delete',
    description: 'Removing deletes the item permanently',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Items',
    collection: 'lists',
    field: 'items',
    primaryKey: 'list-1',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Items',
    collection: 'containers',
    field: 'items',
    primaryKey: 'container-1',
    error: 'At least one item is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Items',
    collection: 'locked',
    field: 'items',
    primaryKey: 'locked-1',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only Items',
    collection: 'archive',
    field: 'records',
    primaryKey: 'archive-1',
    readOnly: true,
  },
};

export const WithMockItems: Story = {
  args: {
    label: 'Blog Comments',
    collection: 'blog_posts',
    field: 'comments',
    primaryKey: 'post-1',
    layout: 'list',
    template: '{{author}} wrote: {{content}}',
    mockItems: [
      { id: 1, author: 'John Doe', content: 'Great article!', created_at: '2024-01-15' },
      { id: 2, author: 'Jane Smith', content: 'Very informative, thanks!', created_at: '2024-01-16' },
      { id: 3, author: 'Bob Wilson', content: 'I learned a lot from this.', created_at: '2024-01-17' },
    ],
    mockRelationInfo: {
      relatedCollection: { collection: 'comments' },
      reverseJunctionField: { field: 'post_id', type: 'uuid' },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with mock data for testing.',
      },
    },
  },
};

export const FullFeatured: Story = {
  args: {
    label: 'Project Tasks',
    collection: 'projects',
    field: 'tasks',
    primaryKey: 'project-123',
    layout: 'table',
    tableSpacing: 'cozy',
    enableCreate: true,
    enableSelect: true,
    enableSearchFilter: true,
    enableLink: true,
    limit: 10,
    removeAction: 'unlink',
    description: 'Manage all tasks for this project',
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-featured O2M interface with all options enabled.',
      },
    },
  },
};
