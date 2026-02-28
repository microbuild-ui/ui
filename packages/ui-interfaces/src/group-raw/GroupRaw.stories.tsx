import type { Meta, StoryObj } from '@storybook/react';
import { GroupRaw } from './GroupRaw';
import { Input } from '../input';
import { Textarea } from '../textarea';
import '../stories-shared.css';

const meta: Meta<typeof GroupRaw> = {
  title: 'Interfaces/GroupRaw',
  component: GroupRaw,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A transparent group wrapper that renders child fields inline without any visual container.

## Features
- No collapsible behavior
- No visual border or header
- Simply groups fields logically in the schema
- Directus equivalent: group-raw

## Usage
\`\`\`tsx
import { GroupRaw } from '@buildpad/ui-interfaces';

<GroupRaw field={{ name: 'Raw Group', meta: { field: 'raw_group' } }}>
  <Input label="Field 1" />
  <Input label="Field 2" />
</GroupRaw>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    field: { name: 'Raw Group', meta: { field: 'raw_group' } },
    children: (
      <div className="story-pad-stack-16">
        <Input label="First Name" placeholder="Enter first name" />
        <Input label="Last Name" placeholder="Enter last name" />
        <Textarea label="Bio" placeholder="Tell us about yourself" />
      </div>
    ),
  },
};

export const TransparentWrapper: Story = {
  render: () => (
    <div className="story-stack-16">
      <Input label="Field Before Group" placeholder="Not in group" />
      <GroupRaw field={{ name: 'Inline Group', meta: { field: 'inline' } }}>
        <div className="story-pad-stack-16">
          <Input label="Grouped Field 1" placeholder="Inside group-raw" />
          <Input label="Grouped Field 2" placeholder="Inside group-raw" />
        </div>
      </GroupRaw>
      <Input label="Field After Group" placeholder="Not in group" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'GroupRaw renders its children inline — no visual distinction from surrounding fields.',
      },
    },
  },
};
