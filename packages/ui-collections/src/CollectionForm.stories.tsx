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
          'Requires a DaaS backend connection — configure STORYBOOK_DAAS_URL to test with live data.',
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
 * Create mode — requires STORYBOOK_DAAS_URL proxy to fetch fields from the backend.
 */
export const CreateMode: Story = {
  args: {
    collection: 'posts',
    mode: 'create',
  },
};

/**
 * Edit mode — requires STORYBOOK_DAAS_URL proxy to fetch fields and item data.
 */
export const EditMode: Story = {
  args: {
    collection: 'posts',
    mode: 'edit',
    id: '1',
  },
};
