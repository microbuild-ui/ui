import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './Toggle';
import { IconSun, IconMoon, IconBell, IconBellOff, IconLock, IconLockOpen } from '@tabler/icons-react';

const meta: Meta<typeof Toggle> = {
  title: 'Interfaces/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `A toggle switch interface that provides a more visual on/off toggle compared to the 
standard Boolean component. Matches the Directus toggle interface functionality.

## Features
- Visual on/off state with icons
- Custom colors for states
- Optional state labels (On/Off text)
- Directus-compatible API
- Accessibility support (ARIA)

## Usage

\`\`\`tsx
import { Toggle } from '@/components/interfaces/toggle';

<Toggle
  label="Enable notifications"
  value={true}
  labelOn="Enabled"
  labelOff="Disabled"
  onChange={(value) => console.log('Toggle changed:', value)}
/>
\`\`\``,
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
      description: 'Whether the toggle is disabled',
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Whether the toggle is readonly',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the field is required (shows asterisk)',
    },
    label: {
      control: { type: 'text' },
      description: 'Label displayed next to the toggle',
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
      description: 'Size of the toggle',
    },
    colorOn: {
      control: { type: 'color' },
      description: 'Color when toggle is on',
    },
    colorOff: {
      control: { type: 'color' },
      description: 'Color when toggle is off',
    },
    labelOn: {
      control: { type: 'text' },
      description: 'Label for the on state',
    },
    labelOff: {
      control: { type: 'text' },
      description: 'Label for the off state',
    },
    showStateLabels: {
      control: { type: 'boolean' },
      description: 'Show state labels (On/Off) beside the toggle',
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

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled option (checked)',
    disabled: true,
    value: true,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Toggle label="Extra Small" size="xs" value={true} />
      <Toggle label="Small" size="sm" value={true} />
      <Toggle label="Medium" size="md" value={true} />
      <Toggle label="Large" size="lg" value={true} />
      <Toggle label="Extra Large" size="xl" value={true} />
    </div>
  ),
};

// State labels
export const WithStateLabels: Story = {
  args: {
    label: 'Toggle with state labels',
    showStateLabels: true,
    labelOn: 'Active',
    labelOff: 'Inactive',
    value: false,
  },
};

export const StateLabelsEnabled: Story = {
  args: {
    label: 'Feature status',
    showStateLabels: true,
    labelOn: 'Enabled',
    labelOff: 'Disabled',
    value: true,
  },
};

// Icon examples
export const DarkModeToggle: Story = {
  args: {
    label: 'Dark mode',
    iconOn: <IconSun size={14} />,
    iconOff: <IconMoon size={14} />,
    value: false,
  },
};

export const NotificationToggle: Story = {
  args: {
    label: 'Notifications',
    iconOn: <IconBell size={14} />,
    iconOff: <IconBellOff size={14} />,
    colorOn: '#339af0',
    value: true,
  },
};

export const SecurityToggle: Story = {
  args: {
    label: 'Lock account',
    iconOn: <IconLock size={14} />,
    iconOff: <IconLockOpen size={14} />,
    colorOn: '#f03e3e',
    colorOff: '#51cf66',
    value: false,
  },
};

// Custom colors
export const CustomColors: Story = {
  args: {
    label: 'Custom theme toggle',
    colorOn: '#be4bdb',
    colorOff: '#868e96',
    value: false,
  },
};

export const GreenRedToggle: Story = {
  args: {
    label: 'Status indicator',
    colorOn: '#51cf66',
    colorOff: '#ff6b6b',
    value: true,
  },
};

// Value states
export const ValueStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Toggle label="True value" value={true} />
      <Toggle label="False value" value={false} />
      <Toggle label="Null value" value={null} />
      <Toggle label="Undefined value" value={undefined} />
    </div>
  ),
};

// Complex example with state labels and custom styling
export const CompleteExample: Story = {
  args: {
    label: 'Premium subscription',
    description: 'Enable premium features for your account',
    showStateLabels: true,
    labelOn: 'Active',
    labelOff: 'Inactive',
    colorOn: '#fab005',
    size: 'md',
    value: false,
  },
};

// Form context example
export const InFormContext: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '400px', 
      padding: '2rem', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>System Settings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Toggle 
          label="Auto-save enabled" 
          description="Automatically save changes every 30 seconds"
          value={true}
        />
        <Toggle 
          label="Dark mode" 
          description="Use dark theme for the interface"
          iconOn={<IconSun size={14} />}
          iconOff={<IconMoon size={14} />}
          value={false}
        />
        <Toggle 
          label="Push notifications" 
          description="Receive push notifications"
          showStateLabels
          labelOn="Enabled"
          labelOff="Disabled"
          colorOn="#339af0"
          value={false}
        />
        <Toggle 
          label="Two-factor authentication" 
          description="Require 2FA for login"
          iconOn={<IconLock size={14} />}
          iconOff={<IconLockOpen size={14} />}
          colorOn="#51cf66"
          required
          value={false}
        />
        <Toggle 
          label="Maintenance mode" 
          description="Site will be unavailable to visitors"
          error="Warning: This will take the site offline"
          colorOn="#f03e3e"
          value={false}
        />
      </div>
    </div>
  ),
};

// Comparison with Boolean
export const ComparisonWithBoolean: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '500px', 
      padding: '2rem', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Toggle vs Boolean</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '1.5rem' }}>
        Toggle provides enhanced visual styling with custom colors, icons, and state labels.
        Use Toggle when you need more visual feedback for on/off states.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 500, fontSize: '14px' }}>Standard Toggle:</p>
          <Toggle label="Standard toggle" value={true} />
        </div>
        <div>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 500, fontSize: '14px' }}>With State Labels:</p>
          <Toggle 
            label="With labels" 
            showStateLabels 
            labelOn="Yes" 
            labelOff="No" 
            value={true} 
          />
        </div>
        <div>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 500, fontSize: '14px' }}>Custom Colors:</p>
          <Toggle 
            label="Custom colors" 
            colorOn="#be4bdb" 
            colorOff="#868e96" 
            value={true} 
          />
        </div>
        <div>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 500, fontSize: '14px' }}>With Icons:</p>
          <Toggle 
            label="With icons" 
            iconOn={<IconBell size={14} />}
            iconOff={<IconBellOff size={14} />}
            value={true} 
          />
        </div>
      </div>
    </div>
  ),
};
