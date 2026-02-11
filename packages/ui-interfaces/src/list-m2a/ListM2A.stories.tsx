import type { Meta, StoryObj } from '@storybook/react';
import { ListM2A } from './ListM2A';

const meta: Meta<typeof ListM2A> = {
  title: 'Interfaces/ListM2A',
  component: ListM2A,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Many-to-Any (M2A) relationship interface - allows linking to items from MULTIPLE different collections through a junction table.

## Features
- Link items from multiple collection types
- List or table layout modes
- Create new related items
- Select existing items
- Collection type badges

## Use Case
Example: A "page" can have "blocks" that are articles, images, videos, etc.
The junction table stores: \`page_id\`, \`collection\` (e.g., "articles"), \`item\` (the article ID)

## Usage
\`\`\`tsx
import { ListM2A } from '@microbuild/ui-interfaces';

<ListM2A
  collection="pages"
  field="blocks"
  primaryKey="page-123"
  layout="list"
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
      description: 'Array of junction items',
    },
    collection: {
      control: 'text',
      description: 'Current collection name (the parent side)',
    },
    field: {
      control: 'text',
      description: 'Field name for this M2A relationship',
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
    prefix: {
      control: 'text',
      description: 'Prefix template for displaying collection name',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the interface is disabled',
    },
    enableCreate: {
      control: 'boolean',
      description: 'Enable create new items',
    },
    enableSelect: {
      control: 'boolean',
      description: 'Enable select existing items',
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
    allowDuplicates: {
      control: 'boolean',
      description: 'Allow duplicate items from the same collection',
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Content Blocks',
    collection: 'pages',
    field: 'blocks',
    primaryKey: 'page-1',
  },
};

export const ListLayout: Story = {
  args: {
    label: 'Page Sections',
    collection: 'pages',
    field: 'sections',
    primaryKey: 'page-1',
    layout: 'list',
    description: 'Drag items to reorder',
  },
};

export const TableLayout: Story = {
  args: {
    label: 'Related Content',
    collection: 'articles',
    field: 'related',
    primaryKey: 'article-1',
    layout: 'table',
  },
};

export const WithSearch: Story = {
  args: {
    label: 'Media Items',
    collection: 'galleries',
    field: 'items',
    primaryKey: 'gallery-1',
    layout: 'table',
    enableSearchFilter: true,
  },
};

export const CreateEnabled: Story = {
  args: {
    label: 'Content Blocks',
    collection: 'pages',
    field: 'blocks',
    primaryKey: 'page-1',
    enableCreate: true,
    enableSelect: false,
    description: 'Create new blocks for this page',
  },
};

export const SelectEnabled: Story = {
  args: {
    label: 'Related Items',
    collection: 'posts',
    field: 'related',
    primaryKey: 'post-1',
    enableCreate: false,
    enableSelect: true,
    description: 'Select existing items to link',
  },
};

export const BothEnabled: Story = {
  args: {
    label: 'Page Components',
    collection: 'pages',
    field: 'components',
    primaryKey: 'page-1',
    enableCreate: true,
    enableSelect: true,
  },
};

export const AllowDuplicates: Story = {
  args: {
    label: 'Playlist',
    collection: 'playlists',
    field: 'tracks',
    primaryKey: 'playlist-1',
    allowDuplicates: true,
    description: 'Same track can appear multiple times',
  },
};

export const NoDuplicates: Story = {
  args: {
    label: 'Unique Items',
    collection: 'collections',
    field: 'items',
    primaryKey: 'col-1',
    allowDuplicates: false,
    description: 'Each item can only appear once',
  },
};

export const WithPagination: Story = {
  args: {
    label: 'Gallery Items',
    collection: 'galleries',
    field: 'items',
    primaryKey: 'gallery-1',
    layout: 'table',
    limit: 5,
  },
};

export const Required: Story = {
  args: {
    label: 'Required Blocks',
    collection: 'pages',
    field: 'blocks',
    primaryKey: 'page-1',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Content',
    collection: 'pages',
    field: 'content',
    primaryKey: 'page-1',
    error: 'At least one content block is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    collection: 'pages',
    field: 'blocks',
    primaryKey: 'page-1',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    collection: 'pages',
    field: 'blocks',
    primaryKey: 'page-1',
    readOnly: true,
  },
};

export const WithMockItems: Story = {
  args: {
    label: 'Page Builder',
    collection: 'pages',
    field: 'blocks',
    primaryKey: 'page-1',
    layout: 'list',
    mockItems: [
      { id: 1, collection: 'text_blocks', item: '101', sort: 1, _related: { title: 'Introduction' } },
      { id: 2, collection: 'image_blocks', item: '201', sort: 2, _related: { title: 'Hero Image' } },
      { id: 3, collection: 'video_blocks', item: '301', sort: 3, _related: { title: 'Demo Video' } },
      { id: 4, collection: 'text_blocks', item: '102', sort: 4, _related: { title: 'Conclusion' } },
    ],
    mockRelationInfo: {
      allowedCollections: [
        { collection: 'text_blocks' },
        { collection: 'image_blocks' },
        { collection: 'video_blocks' },
        { collection: 'cta_blocks' },
      ],
      junctionCollection: { collection: 'pages_blocks' },
      collectionField: { field: 'collection' },
      itemField: { field: 'item' },
      sortField: 'sort',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with mock data showing mixed content types.',
      },
    },
  },
};

export const PageBuilder: Story = {
  args: {
    label: 'Page Content',
    collection: 'pages',
    field: 'content',
    primaryKey: 'home',
    layout: 'list',
    enableCreate: true,
    enableSelect: true,
    enableLink: true,
    description: 'Build your page by adding content blocks',
  },
  parameters: {
    docs: {
      description: {
        story: 'Common CMS page builder pattern.',
      },
    },
  },
};

export const FullFeatured: Story = {
  args: {
    label: 'Flexible Content',
    collection: 'pages',
    field: 'sections',
    primaryKey: 'page-123',
    layout: 'table',
    tableSpacing: 'cozy',
    enableCreate: true,
    enableSelect: true,
    enableSearchFilter: true,
    enableLink: true,
    limit: 10,
    allowDuplicates: false,
    description: 'Complete M2A interface with all options',
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-featured M2A interface with all options enabled.',
      },
    },
  },
};
