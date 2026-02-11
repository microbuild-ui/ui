import type { Meta, StoryObj } from '@storybook/react';
import { CollectionList } from './CollectionList';

const meta = {
  title: 'Collections/CollectionList',
  component: CollectionList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A dynamic list/table that fetches items from a collection. ' +
          'Requires a DaaS backend connection — configure STORYBOOK_DAAS_URL to test with live data.',
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
 * Basic list — requires STORYBOOK_DAAS_URL proxy to fetch items from the backend.
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
