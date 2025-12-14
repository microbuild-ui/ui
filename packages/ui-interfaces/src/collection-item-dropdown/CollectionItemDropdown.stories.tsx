import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollectionItemDropdown } from './CollectionItemDropdown';

const meta: Meta<typeof CollectionItemDropdown> = {
  title: 'Interfaces/CollectionItemDropdown',
  component: CollectionItemDropdown,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A polymorphic dropdown for selecting items from any collection. Stores both the item key and collection name.

## Features
- Select items from any collection
- Optional collection selector
- Display template customization
- Search/filter functionality
- System/custom collection filtering

## Usage
\`\`\`tsx
import { CollectionItemDropdown } from '@microbuild/ui-interfaces';

<CollectionItemDropdown
  label="Related Item"
  selectedCollection="articles"
  value={{ key: '123', collection: 'articles' }}
  onChange={(value) => console.log(value)}
/>
\`\`\`

**Note:** This component requires configured API services for live data.`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'object',
      description: 'Current value containing key and collection',
    },
    selectedCollection: {
      control: 'text',
      description: 'The collection to select items from',
    },
    showCollectionSelect: {
      control: 'boolean',
      description: 'Show collection selection UI',
    },
    includeSystemCollections: {
      control: 'boolean',
      description: 'Include system collections in dropdown',
    },
    excludeSingletons: {
      control: 'boolean',
      description: 'Exclude singleton collections',
    },
    template: {
      control: 'text',
      description: 'Display template (e.g., "{{name}} - {{id}}")',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the interface is disabled',
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
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    limit: {
      control: 'number',
      description: 'Maximum items in dropdown',
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search/filter',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Select Item',
    selectedCollection: 'articles',
    placeholder: 'Choose an item...',
  },
};

export const WithCollection: Story = {
  args: {
    label: 'Select Article',
    selectedCollection: 'articles',
    placeholder: 'Search articles...',
    description: 'Select an article from the collection',
  },
};

export const WithCollectionSelector: Story = {
  args: {
    label: 'Related Item',
    showCollectionSelect: true,
    placeholder: 'First select a collection',
    description: 'Choose a collection, then select an item',
  },
};

export const WithMockCollections: Story = {
  args: {
    label: 'Related Content',
    showCollectionSelect: true,
    mockCollections: [
      { collection: 'articles', meta: { icon: 'article', note: 'Blog articles' } },
      { collection: 'products', meta: { icon: 'shopping_cart', note: 'Product catalog' } },
      { collection: 'pages', meta: { icon: 'description', note: 'Static pages' } },
      { collection: 'categories', meta: { icon: 'folder', note: 'Category list' } },
    ],
    placeholder: 'Select a collection first...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demo with mock collections for testing.',
      },
    },
  },
};

export const IncludeSystemCollections: Story = {
  args: {
    label: 'Any Item',
    showCollectionSelect: true,
    includeSystemCollections: true,
    placeholder: 'Includes system collections',
  },
};

export const ExcludeSingletons: Story = {
  args: {
    label: 'Multi-item Collection',
    showCollectionSelect: true,
    excludeSingletons: true,
    description: 'Only collections with multiple items',
  },
};

export const CustomTemplate: Story = {
  args: {
    label: 'User',
    selectedCollection: 'users',
    template: '{{first_name}} {{last_name}} ({{email}})',
    placeholder: 'Select a user...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Selected Article',
    selectedCollection: 'articles',
    value: { key: '123', collection: 'articles' },
  },
};

export const Searchable: Story = {
  args: {
    label: 'Search Items',
    selectedCollection: 'products',
    searchable: true,
    placeholder: 'Type to search...',
  },
};

export const WithLimit: Story = {
  args: {
    label: 'Quick Select',
    selectedCollection: 'articles',
    limit: 5,
    description: 'Shows max 5 items',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Item',
    selectedCollection: 'articles',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Item',
    selectedCollection: 'articles',
    error: 'Please select an item',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    selectedCollection: 'articles',
    disabled: true,
    value: { key: '123', collection: 'articles' },
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    selectedCollection: 'articles',
    readOnly: true,
    value: { key: '456', collection: 'articles' },
  },
};

export const ContentReference: Story = {
  args: {
    label: 'Link to Content',
    showCollectionSelect: true,
    mockCollections: [
      { collection: 'blog_posts', meta: { icon: 'article', note: 'Blog Posts' } },
      { collection: 'landing_pages', meta: { icon: 'web', note: 'Landing Pages' } },
      { collection: 'products', meta: { icon: 'inventory_2', note: 'Products' } },
      { collection: 'events', meta: { icon: 'event', note: 'Events' } },
    ],
    description: 'Create a link to any content type',
    searchable: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Common CMS pattern for linking to various content types.',
      },
    },
  },
};
