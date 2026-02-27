import type { Meta, StoryObj } from '@storybook/react';
import { CollectionItemDropdown } from './CollectionItemDropdown';

const mockUsers = [
  { id: 'u1', first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 'u2', first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com', role: 'Editor' },
  { id: 'u3', first_name: 'Carol', last_name: 'Williams', email: 'carol@example.com', role: 'Viewer' },
  { id: 'u4', first_name: 'Dave', last_name: 'Brown', email: 'dave@example.com', role: 'Editor' },
  { id: 'u5', first_name: 'Eve', last_name: 'Davis', email: 'eve@example.com', role: 'Admin' },
];

const mockArticles = [
  { id: 'a1', title: 'Getting Started with React', status: 'published', author: 'Alice' },
  { id: 'a2', title: 'Advanced TypeScript Patterns', status: 'draft', author: 'Bob' },
  { id: 'a3', title: 'CSS Grid Layout Guide', status: 'published', author: 'Carol' },
  { id: 'a4', title: 'Node.js Best Practices', status: 'review', author: 'Dave' },
  { id: 'a5', title: 'Testing with Vitest', status: 'published', author: 'Eve' },
  { id: 'a6', title: 'Docker for Developers', status: 'draft', author: 'Alice' },
  { id: 'a7', title: 'GraphQL Fundamentals', status: 'published', author: 'Bob' },
  { id: 'a8', title: 'CI/CD Pipeline Setup', status: 'review', author: 'Carol' },
];

const mockCollections = [
  { collection: 'articles', meta: { icon: 'article', note: 'Blog articles' } },
  { collection: 'products', meta: { icon: 'shopping_cart', note: 'Product catalog' } },
  { collection: 'pages', meta: { icon: 'description', note: 'Static pages' } },
  { collection: 'categories', meta: { icon: 'folder', note: 'Category list' } },
  { collection: 'users', meta: { icon: 'person', note: 'User accounts' } },
];

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
- Allow none (clearable)
- Enable link to view item
- Mock items for demo/testing

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

**Note:** This component requires configured API services for live data. Use mockItems for Storybook demos.`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'object', description: 'Current value containing key and collection' },
    selectedCollection: { control: 'text', description: 'The collection to select items from' },
    showCollectionSelect: { control: 'boolean', description: 'Show collection selection UI' },
    includeSystemCollections: { control: 'boolean', description: 'Include system collections in dropdown' },
    excludeSingletons: { control: 'boolean', description: 'Exclude singleton collections' },
    template: { control: 'text', description: 'Display template (e.g., "{{name}} - {{id}}")' },
    disabled: { control: 'boolean', description: 'Whether the interface is disabled' },
    label: { control: 'text', description: 'Field label' },
    description: { control: 'text', description: 'Field description' },
    error: { control: 'text', description: 'Error message' },
    required: { control: 'boolean', description: 'Whether the field is required' },
    readOnly: { control: 'boolean', description: 'Whether the field is read-only' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    limit: { control: 'number', description: 'Maximum items in dropdown' },
    searchable: { control: 'boolean', description: 'Enable search/filter' },
    allowNone: { control: 'boolean', description: 'Allow clearing selection' },
    enableLink: { control: 'boolean', description: 'Show link to view selected item' },
    primaryKey: { control: 'text', description: 'Primary key field name' },
    fields: { control: 'object', description: 'Fields to fetch for display' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Basic Stories ───

export const Default: Story = {
  args: {
    label: 'Select Item',
    selectedCollection: 'articles',
    placeholder: 'Choose an item...',
    mockItems: mockArticles,
    fields: ['id', 'title', 'status'],
  },
};

export const WithMockItems: Story = {
  args: {
    label: 'Select User',
    selectedCollection: 'users',
    placeholder: 'Search users...',
    description: 'Dropdown populated with mock user data',
    mockItems: mockUsers,
    fields: ['id', 'first_name', 'last_name', 'email'],
    template: '{{first_name}} {{last_name}}',
    searchable: true,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Selected Article',
    selectedCollection: 'articles',
    value: { key: 'a1', collection: 'articles' },
    mockItems: mockArticles,
    fields: ['id', 'title'],
    template: '{{title}}',
  },
};

// ─── Collection Selector Stories ───

export const WithCollectionSelector: Story = {
  args: {
    label: 'Related Item',
    showCollectionSelect: true,
    placeholder: 'First select a collection',
    description: 'Choose a collection, then select an item',
    mockCollections,
  },
};

export const WithMockCollections: Story = {
  args: {
    label: 'Related Content',
    showCollectionSelect: true,
    mockCollections,
    placeholder: 'Select a collection first...',
  },
  parameters: {
    docs: {
      description: { story: 'Demo with mock collections for testing the collection picker.' },
    },
  },
};

export const IncludeSystemCollections: Story = {
  args: {
    label: 'Any Item',
    showCollectionSelect: true,
    includeSystemCollections: true,
    mockCollections: [
      ...mockCollections,
      { collection: 'daas_users', meta: { icon: 'person', note: 'System users' } },
      { collection: 'daas_roles', meta: { icon: 'shield', note: 'System roles' } },
    ],
    placeholder: 'Includes system collections',
  },
};

export const ExcludeSingletons: Story = {
  args: {
    label: 'Multi-item Collection',
    showCollectionSelect: true,
    excludeSingletons: true,
    mockCollections: [
      ...mockCollections,
      { collection: 'settings', meta: { icon: 'settings', singleton: true, note: 'App settings (singleton)' } },
    ],
    description: 'Singleton collections are excluded',
  },
};

// ─── Template Stories ───

export const CustomTemplate: Story = {
  args: {
    label: 'User',
    selectedCollection: 'users',
    template: '{{first_name}} {{last_name}} ({{email}})',
    placeholder: 'Select a user...',
    mockItems: mockUsers,
    fields: ['id', 'first_name', 'last_name', 'email'],
    value: { key: 'u1', collection: 'users' },
  },
};

export const TemplateWithStatus: Story = {
  args: {
    label: 'Article',
    selectedCollection: 'articles',
    template: '{{title}} [{{status}}]',
    placeholder: 'Select an article...',
    mockItems: mockArticles,
    fields: ['id', 'title', 'status'],
    searchable: true,
  },
  parameters: {
    docs: {
      description: { story: 'Template showing title with status badge in brackets.' },
    },
  },
};

// ─── Search & Filter Stories ───

export const Searchable: Story = {
  args: {
    label: 'Search Items',
    selectedCollection: 'articles',
    searchable: true,
    placeholder: 'Type to search...',
    mockItems: mockArticles,
    fields: ['id', 'title', 'status', 'author'],
    template: '{{title}}',
  },
};

export const SearchDisabled: Story = {
  args: {
    label: 'No Search',
    selectedCollection: 'articles',
    searchable: false,
    placeholder: 'Pick from list...',
    mockItems: mockArticles,
    fields: ['id', 'title'],
    template: '{{title}}',
    description: 'Search is disabled - browse only',
  },
};

// ─── Allow None / Clearable Stories ───

export const AllowNone: Story = {
  args: {
    label: 'Clearable Selection',
    selectedCollection: 'users',
    allowNone: true,
    value: { key: 'u2', collection: 'users' },
    mockItems: mockUsers,
    fields: ['id', 'first_name', 'last_name'],
    template: '{{first_name}} {{last_name}}',
    description: 'Click the X to clear the selection',
  },
};

export const NoAllowNone: Story = {
  args: {
    label: 'Non-clearable',
    selectedCollection: 'users',
    allowNone: false,
    value: { key: 'u3', collection: 'users' },
    mockItems: mockUsers,
    fields: ['id', 'first_name', 'last_name'],
    template: '{{first_name}} {{last_name}}',
    description: 'Once selected, cannot be cleared',
  },
};

// ─── Enable Link Story ───

export const WithEnableLink: Story = {
  args: {
    label: 'Linked Item',
    selectedCollection: 'articles',
    enableLink: true,
    value: { key: 'a1', collection: 'articles' },
    mockItems: mockArticles,
    fields: ['id', 'title'],
    template: '{{title}}',
    description: 'Shows a link icon to view the selected item',
  },
};

// ─── State Stories ───

export const Required: Story = {
  args: {
    label: 'Required Item',
    selectedCollection: 'articles',
    required: true,
    mockItems: mockArticles,
    fields: ['id', 'title'],
    template: '{{title}}',
  },
};

export const WithError: Story = {
  args: {
    label: 'Item',
    selectedCollection: 'articles',
    error: 'Please select an item',
    mockItems: mockArticles,
    fields: ['id', 'title'],
    template: '{{title}}',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    selectedCollection: 'articles',
    disabled: true,
    value: { key: 'a1', collection: 'articles' },
    mockItems: mockArticles,
    fields: ['id', 'title'],
    template: '{{title}}',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    selectedCollection: 'articles',
    readOnly: true,
    value: { key: 'a3', collection: 'articles' },
    mockItems: mockArticles,
    fields: ['id', 'title'],
    template: '{{title}}',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Category',
    selectedCollection: 'categories',
    description: 'Select the primary category for this article. This determines where it appears on the site.',
    placeholder: 'Choose a category...',
    mockItems: [
      { id: 'c1', name: 'Technology' },
      { id: 'c2', name: 'Design' },
      { id: 'c3', name: 'Business' },
    ],
    fields: ['id', 'name'],
    template: '{{name}}',
  },
};

// ─── Custom Primary Key Story ───

export const CustomPrimaryKey: Story = {
  args: {
    label: 'Select Product',
    selectedCollection: 'products',
    primaryKey: 'sku',
    mockItems: [
      { sku: 'PRD-001', name: 'Widget A', price: 9.99 },
      { sku: 'PRD-002', name: 'Widget B', price: 19.99 },
      { sku: 'PRD-003', name: 'Gadget C', price: 29.99 },
    ],
    fields: ['sku', 'name', 'price'],
    template: '{{name}} (${{price}})',
    value: { key: 'PRD-001', collection: 'products' },
    description: 'Uses "sku" as the primary key instead of "id"',
  },
};

// ─── Combined / Real-world Stories ───

export const ContentReference: Story = {
  args: {
    label: 'Link to Content',
    showCollectionSelect: true,
    mockCollections,
    description: 'Create a link to any content type',
    searchable: true,
  },
  parameters: {
    docs: {
      description: { story: 'Common CMS pattern for linking to various content types.' },
    },
  },
};

export const FullFeatured: Story = {
  args: {
    label: 'Assign Reviewer',
    selectedCollection: 'users',
    description: 'Select a team member to review this article',
    placeholder: 'Search for a reviewer...',
    template: '{{first_name}} {{last_name}} — {{role}}',
    searchable: true,
    allowNone: true,
    enableLink: true,
    required: true,
    mockItems: mockUsers,
    fields: ['id', 'first_name', 'last_name', 'email', 'role'],
    value: { key: 'u1', collection: 'users' },
  },
  parameters: {
    docs: {
      description: { story: 'All features enabled: search, clearable, link, required, template, description.' },
    },
  },
};

export const EmptyState: Story = {
  args: {
    label: 'Select Item',
    selectedCollection: 'empty_collection',
    mockItems: [],
    fields: ['id', 'name'],
    placeholder: 'No items available...',
    description: 'Collection has no items',
  },
  parameters: {
    docs: {
      description: { story: 'Shows the empty state when no items are available in the collection.' },
    },
  },
};
