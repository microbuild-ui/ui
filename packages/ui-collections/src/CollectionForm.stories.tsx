import React from 'react';
import type { Meta, StoryObj, Decorator } from '@storybook/react';
import { CollectionForm } from './CollectionForm';

// ============================================================================
// Mock Data — stories work offline without a DaaS backend
// ============================================================================

const MOCK_FIELDS = [
  {
    field: 'id', type: 'integer',
    meta: { hidden: true, readonly: true, interface: null, width: 'full' },
    schema: { is_primary_key: true, has_auto_increment: true },
  },
  {
    field: 'title', type: 'string',
    meta: { hidden: false, readonly: false, interface: 'input', width: 'full', required: true, note: 'Post title' },
    schema: { max_length: 255, is_nullable: false },
  },
  {
    field: 'status', type: 'string',
    meta: {
      hidden: false, readonly: false, interface: 'select-dropdown', width: 'half',
      options: { choices: [{ text: 'Draft', value: 'draft' }, { text: 'Published', value: 'published' }, { text: 'Archived', value: 'archived' }] },
    },
    schema: { default_value: 'draft' },
  },
  {
    field: 'category', type: 'string',
    meta: {
      hidden: false, readonly: false, interface: 'select-dropdown', width: 'half',
      options: { choices: [{ text: 'Tutorial', value: 'tutorial' }, { text: 'Guide', value: 'guide' }, { text: 'News', value: 'news' }] },
    },
    schema: {},
  },
  {
    field: 'content', type: 'text',
    meta: { hidden: false, readonly: false, interface: 'input-multiline', width: 'full', note: 'Post content' },
    schema: {},
  },
  {
    field: 'featured', type: 'boolean',
    meta: { hidden: false, readonly: false, interface: 'boolean', width: 'half' },
    schema: { default_value: false },
  },
];

const MOCK_ITEM = {
  id: 1,
  title: 'Getting Started with Microbuild',
  status: 'published',
  category: 'tutorial',
  content: 'This guide covers the basics of building forms and tables with Microbuild UI components.',
  featured: true,
};

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

    // Mock single item endpoint (for edit mode)
    if (url.match(/\/api\/items\/\w+\/\d+/)) {
      return new Response(JSON.stringify({ data: MOCK_ITEM }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock create/update item endpoint
    if (url.includes('/api/items/') && init?.method && ['POST', 'PATCH'].includes(init.method)) {
      return new Response(JSON.stringify({ data: { id: 99 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock items list endpoint
    if (url.includes('/api/items/')) {
      return new Response(JSON.stringify({ data: [MOCK_ITEM] }), {
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
  title: 'Collections/CollectionForm',
  component: CollectionForm,
  decorators: [withMockApi],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A CRUD wrapper around VForm that handles data fetching and persistence. ' +
          'These stories use mock data. For live DaaS data, use the **Playground** story.',
      },
    },
  },
  argTypes: {
    collection: {
      control: 'text',
      description: 'Collection name',
    },
    mode: {
      control: 'select',
      options: ['create', 'edit'],
    },
    id: {
      control: 'text',
      description: 'Item ID for edit mode',
    },
  },
} satisfies Meta<typeof CollectionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Create mode — renders an empty form for a new item.
 * Uses mock data — no backend required.
 */
export const CreateMode: Story = {
  args: {
    collection: 'posts',
    mode: 'create',
  },
};

/**
 * Edit mode — loads an existing item and renders its data.
 * Uses mock data — no backend required.
 */
export const EditMode: Story = {
  args: {
    collection: 'posts',
    mode: 'edit',
    id: '1',
  },
};
