import type { Meta, StoryObj } from '@storybook/react-vite';
import { Color } from './Color';

const meta = {
  title: 'Interfaces/Color',
  component: Color,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Color interface provides a comprehensive color picker with multiple format support and customizable presets.

## Features

- **Multiple Color Formats**: RGB, HSL, RGBA, HSLA
- **Native Color Picker**: Integration with browser's native color picker
- **Alpha/Opacity Support**: Optional transparency control
- **Color Presets**: Customizable quick-select color swatches  
- **Validation**: Hex color format validation with error handling
- **Accessibility**: Proper contrast detection and visual indicators

## Usage

Use this interface when you need users to select colors for themes, branding, or visual customization.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current color value in hex format',
    },
    label: {
      control: 'text',
      description: 'Label displayed above the color picker',
    },
    description: {
      control: 'text', 
      description: 'Help text displayed below the label',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the color input',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the color picker is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    opacity: {
      control: 'boolean',
      description: 'Whether to support alpha/opacity values',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when color changes',
    },
  },
} satisfies Meta<typeof Color>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Color',
    placeholder: '#000000',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Primary Color',
    value: '#6644FF',
    description: 'Choose your primary brand color',
  },
};

export const WithOpacity: Story = {
  args: {
    label: 'Background Color',
    value: '#6644FF80',
    opacity: true,
    description: 'Select a color with transparency',
  },
};

export const Required: Story = {
  args: {
    label: 'Theme Color',
    required: true,
    placeholder: 'Select a theme color...',
  },
};

export const WithError: Story = {
  args: {
    label: 'Color',
    value: 'invalid-color',
    error: 'Please enter a valid hex color format',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Color',
    value: '#6644FF',
    disabled: true,
    description: 'This color picker is disabled',
  },
};

export const CustomPresets: Story = {
  args: {
    label: 'Brand Color',
    description: 'Choose from brand colors or pick a custom one',
    presets: [
      { name: 'Primary', color: '#6644FF' },
      { name: 'Secondary', color: '#3399FF' },
      { name: 'Success', color: '#2ECDA7' },
      { name: 'Warning', color: '#FFC23B' },
      { name: 'Danger', color: '#E35169' },
      { name: 'Dark', color: '#18222F' },
      { name: 'Light', color: '#F8F9FA' },
    ],
  },
};

export const WithoutPresets: Story = {
  args: {
    label: 'Custom Color',
    description: 'Enter any color in hex format',
    presets: [],
  },
};

export const AllFormats: Story = {
  args: {
    label: 'Color with All Formats',
    value: '#6644FF',
    opacity: true,
    description: 'This picker supports RGB, HSL, RGBA, and HSLA formats',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the color picker with all available format options.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    label: 'Interactive Color Demo',
    value: '#6644FF',
    opacity: true,
    description: 'Try changing the color using different methods: typing hex values, using the native picker, selecting presets, or adjusting RGB/HSL values.',
  },
  parameters: {
    docs: {
      description: {
        story: `
This is a fully interactive demo of the Color interface. You can:

1. **Type hex values** directly in the input field
2. **Click the color swatch** to open the native browser color picker  
3. **Select from presets** for quick color selection
4. **Use RGB or HSL inputs** for precise color control
5. **Adjust opacity** with the alpha slider (when opacity mode is enabled)
6. **Switch between color formats** using the dropdown

The component automatically validates hex colors and provides visual feedback for invalid values.
        `,
      },
    },
  },
};

// Form integration example
export const FormIntegration: Story = {
  args: {
    label: 'Website Theme Color',
    value: '#6644FF',
    required: true,
    description: 'This color will be used as the primary theme color for your website',
  },
  parameters: {
    docs: {
      description: {
        story: `
Example of how the Color interface would typically be used in a form context with proper labeling, 
validation states, and user guidance.
        `,
      },
    },
  },
};

// Accessibility example
export const AccessibilityDemo: Story = {
  args: {
    label: 'Accessible Color Picker',
    value: '#6644FF',
    description: 'This color picker includes proper contrast detection and accessibility features',
  },
  parameters: {
    docs: {
      description: {
        story: `
The Color interface includes several accessibility features:

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper labels and descriptions
- **Contrast Detection**: Visual indicators for low-contrast colors
- **Error States**: Clear error messaging and validation
- **Focus Management**: Logical tab order and focus indicators
        `,
      },
    },
  },
};
