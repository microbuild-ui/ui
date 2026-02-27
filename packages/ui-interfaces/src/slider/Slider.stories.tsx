import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Interfaces/Slider',
  component: Slider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A slider input interface that supports various numeric types including integers, big integers, decimals, and floats.

## Features
- Configurable min/max values and step intervals
- Support for different numeric types (integer, bigInteger, decimal, float)
- Optional always-visible value label
- Custom tick marks
- Value display with min/max indicators
- Read-only and disabled states

## Usage
\`\`\`tsx
import { Slider } from '@buildpad/ui-interfaces';

<Slider
  label="Volume"
  value={50}
  minValue={0}
  maxValue={100}
  stepInterval={5}
  onChange={(value) => console.log(value)}
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'number',
      description: 'Current value of the slider',
    },
    type: {
      control: 'select',
      options: ['integer', 'bigInteger', 'decimal', 'float'],
      description: 'Value type for parsing and formatting',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the slider is read-only',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    minValue: {
      control: 'number',
      description: 'Minimum value',
    },
    maxValue: {
      control: 'number',
      description: 'Maximum value',
    },
    stepInterval: {
      control: 'number',
      description: 'Step interval for the slider',
    },
    alwaysShowValue: {
      control: 'boolean',
      description: 'Whether to always show the value label on the slider',
    },
    label: {
      control: 'text',
      description: 'Field label',
    },
    description: {
      control: 'text',
      description: 'Description text',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the slider',
    },
    color: {
      control: 'color',
      description: 'Color of the slider track',
    },
    showTicks: {
      control: 'boolean',
      description: 'Whether to show tick marks',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Value',
    value: 50,
  },
};

export const WithRange: Story = {
  args: {
    label: 'Volume',
    value: 75,
    minValue: 0,
    maxValue: 100,
    description: 'Adjust the volume level',
  },
};

export const CustomStep: Story = {
  args: {
    label: 'Quantity',
    value: 10,
    minValue: 0,
    maxValue: 100,
    stepInterval: 10,
    description: 'Step by 10',
  },
};

export const IntegerType: Story = {
  args: {
    label: 'Age',
    type: 'integer',
    value: 25,
    minValue: 0,
    maxValue: 100,
  },
};

export const DecimalType: Story = {
  args: {
    label: 'Price',
    type: 'decimal',
    value: 29.99,
    minValue: 0,
    maxValue: 100,
    stepInterval: 0.01,
    description: 'Set the price (precision to cents)',
  },
};

export const FloatType: Story = {
  args: {
    label: 'Temperature',
    type: 'float',
    value: 36.5,
    minValue: 35,
    maxValue: 42,
    stepInterval: 0.1,
    description: 'Body temperature (°C)',
  },
};

export const AlwaysShowValue: Story = {
  args: {
    label: 'Brightness',
    value: 60,
    minValue: 0,
    maxValue: 100,
    alwaysShowValue: true,
    description: 'Value label is always visible',
  },
};

export const WithMarks: Story = {
  args: {
    label: 'Rating',
    value: 3,
    minValue: 1,
    maxValue: 5,
    stepInterval: 1,
    marks: [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5' },
    ],
  },
};

export const WithTicks: Story = {
  args: {
    label: 'Progress',
    value: 40,
    minValue: 0,
    maxValue: 100,
    stepInterval: 20,
    showTicks: true,
    marks: [
      { value: 0, label: '0%' },
      { value: 20, label: '20%' },
      { value: 40, label: '40%' },
      { value: 60, label: '60%' },
      { value: 80, label: '80%' },
      { value: 100, label: '100%' },
    ],
  },
};

export const SmallSize: Story = {
  args: {
    label: 'Small Slider',
    value: 50,
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Large Slider',
    value: 50,
    size: 'lg',
  },
};

export const CustomColor: Story = {
  args: {
    label: 'Custom Color',
    value: 60,
    color: 'teal',
    description: 'Teal colored slider',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Field',
    required: true,
    value: 50,
  },
};

export const WithError: Story = {
  args: {
    label: 'Invalid Value',
    value: 150,
    maxValue: 100,
    error: 'Value exceeds maximum',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Slider',
    value: 50,
    disabled: true,
    description: 'This slider is disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    value: 75,
    readOnly: true,
    description: 'Value cannot be changed',
  },
};

export const PercentageSlider: Story = {
  args: {
    label: 'Opacity',
    value: 80,
    minValue: 0,
    maxValue: 100,
    stepInterval: 5,
    alwaysShowValue: true,
    marks: [
      { value: 0, label: '0%' },
      { value: 50, label: '50%' },
      { value: 100, label: '100%' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'A slider configured for percentage values with marked positions.',
      },
    },
  },
};

export const NegativeRange: Story = {
  args: {
    label: 'Temperature Offset',
    value: 0,
    minValue: -50,
    maxValue: 50,
    stepInterval: 5,
    marks: [
      { value: -50, label: '-50°' },
      { value: 0, label: '0°' },
      { value: 50, label: '+50°' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'A slider with negative values.',
      },
    },
  },
};
