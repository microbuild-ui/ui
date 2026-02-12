import type { Meta, StoryObj } from '@storybook/react';
import { CollectionForm } from './CollectionForm';

const meta = {
  title: 'Collections/CollectionForm',
  component: CollectionForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A CRUD wrapper around VForm that handles data fetching and persistence. ' +
          'Requires a DaaS backend connection — start the host app (`pnpm dev:host`) and connect at http://localhost:3000.',
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
 * Create mode — requires Storybook Host app running to proxy API requests.
 * Start with `pnpm dev:host`, then connect at http://localhost:3000.
 */
export const CreateMode: Story = {
  args: {
    collection: 'posts',
    mode: 'create',
  },
};

/**
 * Edit mode — requires Storybook Host app running to proxy API requests.
 * Start with `pnpm dev:host`, then connect at http://localhost:3000.
 */
export const EditMode: Story = {
  args: {
    collection: 'posts',
    mode: 'edit',
    id: '1',
  },
};
