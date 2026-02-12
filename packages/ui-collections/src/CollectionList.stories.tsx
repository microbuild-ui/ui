import React from 'react';
import type { Meta, StoryObj, Decorator } from '@storybook/react';
import { CollectionList } from './CollectionList';

// ============================================================================
// Mock Data — stories work offline without a DaaS backend
// ============================================================================

const MOCK_FIELDS = [
  { field: 'id', type: 'integer', meta: { hidden: false }, schema: { is_primary_key: true } },
  { field: 'title', type: 'string', meta: { hidden: false, note: 'Title' }, schema: {} },
  { field: 'status', type: 'string', meta: { hidden: false, note: 'Status' }, schema: {} },
  { field: 'author', type: 'string', meta: { hidden: false, note: 'Author' }, schema: {} },
  { field: 'category', type: 'string', meta: { hidden: false, note: 'Category' }, schema: {} },
  { field: 'published_at', type: 'timestamp', meta: { hidden: false, note: 'Published' }, schema: {} },
];

const MOCK_ITEMS = [
  { id: 1, title: 'Getting Started with Microbuild', status: 'published', author: 'Jane Smith', category: 'Tutorial', published_at: '2025-06-01' },
  { id: 2, title: 'Building Dynamic Forms', status: 'published', author: 'John Doe', category: 'Guide', published_at: '2025-06-10' },
  { id: 3, title: 'Advanced Table Patterns', status: 'draft', author: 'Alice Brown', category: 'Tutorial', published_at: null },
  { id: 4, title: 'Authentication & Permissions', status: 'published', author: 'Bob Wilson', category: 'Security', published_at: '2025-07-01' },
  { id: 5, title: 'Relational Interfaces Guide', status: 'review', author: 'Charlie Davis', category: 'Guide', published_at: null },
  { id: 6, title: 'Deploying to Amplify', status: 'published', author: 'Jane Smith', category: 'DevOps', published_at: '2025-07-15' },
  { id: 7, title: 'Custom Interface Components', status: 'draft', author: 'John Doe', category: 'Advanced', published_at: null },
  { id: 8, title: 'File Upload Patterns', status: 'published', author: 'Alice Brown', category: 'Guide', published_at: '2025-08-01' },
];

/**
 * Decorator that intercepts fetch calls to /api/* and returns mock data
 * so the stories work without a running DaaS backend.
 */
const withMockApi: Decorator = (Story) => {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Mock fields endpoint
    if (url.includes('/api/fields/')) {
      return new Response(JSON.stringify({ data: MOCK_FIELDS }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock items endpoint
    if (url.includes('/api/items/')) {
      return new Response(JSON.stringify({ data: MOCK_ITEMS }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch(input, init);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => { window.fetch = originalFetch; };
  });

  return <Story />;
};

// ============================================================================
// Meta
// ============================================================================

const meta = {
  title: 'Collections/CollectionList',
  component: CollectionList,
  decorators: [withMockApi],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A dynamic list/table that fetches items from a collection. ' +
          'These stories use mock data. For live DaaS data, use the **Playground** story.',
      },
    },
  },
  argTypes: {
    collection: {
      control: 'text',
      description: 'Collection name to display',
    },
    enableSelection: {
      control: 'boolean',
    },
    enableSearch: {
      control: 'boolean',
    },
    limit: {
      control: 'number',
      description: 'Items per page',
    },
  },
} satisfies Meta<typeof CollectionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic list displaying collection items with search.
 * Uses mock data — no backend required.
 */
export const BasicList: Story = {
  args: {
    collection: 'posts',
    enableSearch: true,
    limit: 10,
  },
};

/**
 * With selection enabled for bulk actions.
 */
export const WithSelection: Story = {
  args: {
    collection: 'posts',
    enableSelection: true,
    enableSearch: true,
    limit: 10,
  },
};
