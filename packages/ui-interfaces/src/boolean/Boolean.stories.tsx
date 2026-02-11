import type { Meta, StoryObj } from '@storybook/react';
import { Boolean } from '../Boolean';
import { IconCheck, IconX, IconSun, IconMoon } from '@tabler/icons-react';
import '../stories-shared.css';

const meta: Meta<typeof Boolean> = {
  title: 'Interfaces/Boolean',
  component: Boolean,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A boolean toggle interface using Mantine Switch component. Supports custom icons, colors, and all standard form states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'boolean' },
      description: 'Current boolean value',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the switch is disabled',
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Whether the switch is readonly',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the field is required (shows asterisk)',
    },
    label: {
      control: { type: 'text' },
      description: 'Label displayed next to the switch',
    },
    description: {
      control: { type: 'text' },
      description: 'Description text displayed below the label',
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the switch',
    },
    colorOn: {
      control: { type: 'color' },
      description: 'Color when switch is on',
    },
    colorOff: {
      control: { type: 'color' },
      description: 'Color when switch is off',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic usage
export const Default: Story = {
  args: {
    label: 'Enable feature',
    value: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'Feature enabled',
    value: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Enable notifications',
    description: 'Receive email notifications for important updates',
    value: false,
  },
};

export const Required: Story = {
  args: {
    label: 'Accept terms',
    required: true,
    value: false,
  },
};

export const WithError: Story = {
  args: {
    label: 'Accept terms',
    error: 'You must accept the terms to continue',
    value: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    disabled: true,
    value: false,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read-only option',
    readOnly: true,
    value: true,
  },
};

// Size variants
export const Sizes: Story = {
  render: () => (
    <div className="story-stack">
      <Boolean label="Extra Small" size="xs" value={true} />
      <Boolean label="Small" size="sm" value={true} />
      <Boolean label="Medium" size="md" value={true} />
      <Boolean label="Large" size="lg" value={true} />
      <Boolean label="Extra Large" size="xl" value={true} />
    </div>
  ),
};

// Icon examples
export const WithIcons: Story = {
  args: {
    label: 'Dark mode',
    iconOn: <IconSun size={16} />,
    iconOff: <IconMoon size={16} />,
    value: false,
  },
};

export const WithCheckIcons: Story = {
  args: {
    label: 'Enable feature',
    iconOn: <IconCheck size={12} />,
    iconOff: <IconX size={12} />,
    value: false,
  },
};

// Custom colors
export const CustomColors: Story = {
  args: {
    label: 'Custom theme',
    colorOn: '#ff6b6b',
    colorOff: '#868e96',
    value: false,
  },
};

// Value states
export const ValueStates: Story = {
  render: () => (
    <div className="story-stack">
      <Boolean label="True value" value={true} />
      <Boolean label="False value" value={false} />
      <Boolean label="Null value" value={null} />
      <Boolean label="Undefined value" value={undefined} />
    </div>
  ),
};

// Complex example
export const ComplexExample: Story = {
  args: {
    label: 'Marketing emails',
    description: 'Receive promotional emails and product updates',
    iconOn: <IconCheck size={12} />,
    iconOff: <IconX size={12} />,
    colorOn: '#51cf66',
    colorOff: '#868e96',
    size: 'md',
    value: false,
  },
};

// Form context example
export const InFormContext: Story = {
  render: () => (
    <div className="story-form-container">
      <h3 className="story-form-heading">Account Settings</h3>
      <div className="story-stack">
        <Boolean 
          label="Email notifications" 
          description="Receive email updates about your account"
          value={true}
        />
        <Boolean 
          label="SMS notifications" 
          description="Receive text message alerts"
          value={false}
        />
        <Boolean 
          label="Marketing communications" 
          description="Receive promotional emails and offers"
          required
          value={false}
        />
        <Boolean 
          label="Data sharing" 
          description="Allow anonymous usage data collection"
          error="This setting is required for the service to function"
          value={false}
        />
      </div>
    </div>
  ),
};
