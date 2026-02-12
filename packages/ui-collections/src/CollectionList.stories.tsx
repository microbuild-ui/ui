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
          'Requires a DaaS backend connection — start the host app (`pnpm dev:host`) and connect at http://localhost:3000.',
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
 * Basic list — requires Storybook Host app running to proxy API requests.
 * Start with `pnpm dev:host`, then connect at http://localhost:3000.
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
