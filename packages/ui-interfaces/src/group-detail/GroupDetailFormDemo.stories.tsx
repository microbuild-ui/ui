import type { Meta, StoryObj } from '@storybook/react';
import { GroupDetailFormDemo } from './GroupDetailFormDemo';

const meta: Meta<typeof GroupDetailFormDemo> = {
  title: 'Interfaces/GroupDetail/FormDemo',
  component: GroupDetailFormDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A comprehensive demo showing how the GroupDetail component works within a form context.

This demo demonstrates:
- Individual fields (not grouped)
- Address Information group (starts closed, optional)
- Company Information group (starts open, required)
- Form validation and error handling
- Proper value synchronization between form and groups
- Real-world form layout and interaction patterns

**Features Showcased:**
- Collapsible groups with different initial states
- Validation error filtering and display within groups
- Form state management with Mantine's useForm
- Proper field grouping that matches Directus behavior
- Change handlers that synchronize group values with parent form
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complete form demo showing GroupDetail integration with real form fields and validation.',
      },
    },
  },
};
