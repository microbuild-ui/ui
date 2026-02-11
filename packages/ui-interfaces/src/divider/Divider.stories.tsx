import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';
import { IconSettings, IconUser, IconFolder, IconStar } from '@tabler/icons-react';

const meta: Meta<typeof Divider> = {
  title: 'Interfaces/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A flexible divider component that supports horizontal and vertical orientations, optional titles, and icons.

## Features
- Horizontal and vertical orientations
- Optional title/label with icon
- Inline or stacked title positioning
- Large styling variant
- Customizable colors and thickness

## Usage
\`\`\`tsx
import { Divider } from '@microbuild/ui-interfaces';

<Divider title="Section Title" icon={<IconSettings />} />
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title content for the divider',
    },
    icon: {
      control: false,
      description: 'Icon to display before the title',
    },
    vertical: {
      control: 'boolean',
      description: 'Whether the divider is vertical',
    },
    inlineTitle: {
      control: 'boolean',
      description: 'Whether the title is displayed inline with the divider line',
    },
    large: {
      control: 'boolean',
      description: 'Whether to use larger styling',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the divider is disabled (affects text color)',
    },
    color: {
      control: 'color',
      description: 'Color of the divider line',
    },
    labelColor: {
      control: 'color',
      description: 'Color of the label text',
    },
    thickness: {
      control: 'number',
      description: 'Thickness of the divider line',
    },
    margin: {
      control: 'text',
      description: 'Margin around the divider',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithTitle: Story = {
  args: {
    title: 'Section Title',
  },
};

export const InlineTitle: Story = {
  args: {
    title: 'Inline Title',
    inlineTitle: true,
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Settings',
    icon: <IconSettings size={16} />,
  },
};

export const InlineTitleWithIcon: Story = {
  args: {
    title: 'User Profile',
    icon: <IconUser size={16} />,
    inlineTitle: true,
  },
};

export const Large: Story = {
  args: {
    title: 'Main Section',
    large: true,
  },
};

export const LargeWithIcon: Story = {
  args: {
    title: 'Featured',
    icon: <IconStar size={20} />,
    large: true,
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Section',
    disabled: true,
  },
};

export const CustomColor: Story = {
  args: {
    title: 'Custom Colors',
    color: '#6644FF',
    labelColor: '#6644FF',
  },
};

export const ThickDivider: Story = {
  args: {
    title: 'Thick Divider',
    thickness: 3,
  },
};

export const Vertical: Story = {
  args: {
    vertical: true,
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '100px', alignItems: 'stretch' }}>
        <div style={{ padding: '10px' }}>Left Content</div>
        <Story />
        <div style={{ padding: '10px' }}>Right Content</div>
      </div>
    ),
  ],
};

export const VerticalWithTitle: Story = {
  args: {
    vertical: true,
    title: 'OR',
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '150px', alignItems: 'stretch' }}>
        <div style={{ padding: '10px' }}>Option A</div>
        <Story />
        <div style={{ padding: '10px' }}>Option B</div>
      </div>
    ),
  ],
};

export const WithMargin: Story = {
  args: {
    title: 'With Margin',
    margin: '20px',
  },
  decorators: [
    (Story) => (
      <div style={{ border: '1px dashed #ccc', padding: '10px' }}>
        <Story />
      </div>
    ),
  ],
};

export const FolderSection: Story = {
  args: {
    title: 'Documents',
    icon: <IconFolder size={16} />,
    inlineTitle: true,
    color: '#2196F3',
    labelColor: '#2196F3',
  },
};

export const FormSection: Story = {
  args: {
    title: 'Personal Information',
    large: true,
    icon: <IconUser size={20} />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Ideal for separating sections in a form',
      },
    },
  },
};
