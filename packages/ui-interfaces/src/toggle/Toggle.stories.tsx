import type { Meta, StoryObj } from "@storybook/react";
import {
  IconBell,
  IconBellOff,
  IconLock,
  IconLockOpen,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import "../stories-shared.css";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Interfaces/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `A toggle switch interface that provides a more visual on/off toggle compared to the 
standard Boolean component. Matches the DaaS toggle interface functionality.

## Features
- Visual on/off state with icons
- Custom colors for states
- Optional state labels (On/Off text)
- DaaS-compatible API
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
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "boolean" },
      description: "Current boolean value",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the toggle is disabled",
    },
    readOnly: {
      control: { type: "boolean" },
      description: "Whether the toggle is readonly",
    },
    required: {
      control: { type: "boolean" },
      description: "Whether the field is required (shows asterisk)",
    },
    label: {
      control: { type: "text" },
      description: "Label displayed next to the toggle",
    },
    description: {
      control: { type: "text" },
      description: "Description text displayed below the label",
    },
    error: {
      control: { type: "text" },
      description: "Error message to display",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Size of the toggle",
    },
    colorOn: {
      control: { type: "color" },
      description: "Color when toggle is on",
    },
    colorOff: {
      control: { type: "color" },
      description: "Color when toggle is off",
    },
    labelOn: {
      control: { type: "text" },
      description: "Label for the on state",
    },
    labelOff: {
      control: { type: "text" },
      description: "Label for the off state",
    },
    showStateLabels: {
      control: { type: "boolean" },
      description: "Show state labels (On/Off) beside the toggle",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic usage
export const Default: Story = {
  args: {
    label: "Enable feature",
    value: false,
  },
};

export const Checked: Story = {
  args: {
    label: "Feature enabled",
    value: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: "Enable notifications",
    description: "Receive email notifications for important updates",
    value: false,
  },
};

export const Required: Story = {
  args: {
    label: "Accept terms",
    required: true,
    value: false,
  },
};

export const WithError: Story = {
  args: {
    label: "Accept terms",
    error: "You must accept the terms to continue",
    value: false,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled option",
    disabled: true,
    value: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: "Disabled option (checked)",
    disabled: true,
    value: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: "Read-only option",
    readOnly: true,
    value: true,
  },
};

// Size variants
export const Sizes: Story = {
  render: () => (
    <div className="story-stack">
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
    label: "Toggle with state labels",
    showStateLabels: true,
    labelOn: "Active",
    labelOff: "Inactive",
    value: false,
  },
};

export const StateLabelsEnabled: Story = {
  args: {
    label: "Feature status",
    showStateLabels: true,
    labelOn: "Enabled",
    labelOff: "Disabled",
    value: true,
  },
};

// Icon examples
export const DarkModeToggle: Story = {
  args: {
    label: "Dark mode",
    iconOn: <IconSun size={14} />,
    iconOff: <IconMoon size={14} />,
    value: false,
  },
};

export const NotificationToggle: Story = {
  args: {
    label: "Notifications",
    iconOn: <IconBell size={14} />,
    iconOff: <IconBellOff size={14} />,
    colorOn: "#339af0",
    value: true,
  },
};

export const SecurityToggle: Story = {
  args: {
    label: "Lock account",
    iconOn: <IconLock size={14} />,
    iconOff: <IconLockOpen size={14} />,
    colorOn: "#f03e3e",
    colorOff: "#51cf66",
    value: false,
  },
};

// Custom colors
export const CustomColors: Story = {
  args: {
    label: "Custom theme toggle",
    colorOn: "#be4bdb",
    colorOff: "#868e96",
    value: false,
  },
};

export const GreenRedToggle: Story = {
  args: {
    label: "Status indicator",
    colorOn: "#51cf66",
    colorOff: "#ff6b6b",
    value: true,
  },
};

// Value states
export const ValueStates: Story = {
  render: () => (
    <div className="story-stack">
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
    label: "Premium subscription",
    description: "Enable premium features for your account",
    showStateLabels: true,
    labelOn: "Active",
    labelOff: "Inactive",
    colorOn: "#fab005",
    size: "md",
    value: false,
  },
};

// Form context example
export const InFormContext: Story = {
  render: () => (
    <div className="story-form-container">
      <h3 className="story-form-heading">System Settings</h3>
      <div className="story-stack">
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

// Backend string icon graceful degradation
/**
 * When DaaS stores option values like `{ iconOn: "sun", iconOff: "moon" }`,
 * the backend sends plain strings rather than ReactNodes.
 * Toggle now accepts `string | ReactNode` for icon props and silently falls
 * back to the default check/X icons when a string is received.
 */
export const WithStringIconFromBackend: Story = {
  name: "WithStringIconFromBackend (DaaS compat)",
  args: {
    label: "Backend-configured toggle",
    description:
      'iconOn="sun" and iconOff="moon" are strings from DaaS — ignored at runtime; default check/X icons are used instead',
    // @ts-expect-error intentionally passing string to show runtime guard
    iconOn: "sun",
    // @ts-expect-error intentionally passing string to show runtime guard
    iconOff: "moon",
    showStateLabels: true,
    labelOn: "On",
    labelOff: "Off",
    value: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "DaaS `options.iconOn` / `options.iconOff` are stored as plain strings. " +
          "The component normalises strings to `undefined`, falling back to the " +
          "built-in `<IconCheck>` / `<IconX>` defaults rather than rendering raw text.",
      },
    },
  },
};

// Comparison with Boolean
export const ComparisonWithBoolean: Story = {
  render: () => (
    <div className="story-form-container-lg">
      <h3 className="story-form-heading">Toggle vs Boolean</h3>
      <p className="story-description">
        Toggle provides enhanced visual styling with custom colors, icons, and
        state labels. Use Toggle when you need more visual feedback for on/off
        states.
      </p>
      <div className="story-stack-lg">
        <div>
          <p className="story-sub-label">Standard Toggle:</p>
          <Toggle label="Standard toggle" value={true} />
        </div>
        <div>
          <p className="story-sub-label">With State Labels:</p>
          <Toggle
            label="With labels"
            showStateLabels
            labelOn="Yes"
            labelOff="No"
            value={true}
          />
        </div>
        <div>
          <p className="story-sub-label">Custom Colors:</p>
          <Toggle
            label="Custom colors"
            colorOn="#be4bdb"
            colorOff="#868e96"
            value={true}
          />
        </div>
        <div>
          <p className="story-sub-label">With Icons:</p>
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
