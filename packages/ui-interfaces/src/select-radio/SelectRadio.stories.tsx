import type { Meta, StoryObj } from '@storybook/react';
import { SelectRadio } from './SelectRadio';

const meta: Meta<typeof SelectRadio> = {
  title: 'Interfaces/SelectRadio',
  component: SelectRadio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `A radio button selection interface with support for custom "other" option.

## Features
- Radio button group selection
- Optional "Allow Other" for custom input
- Custom colors per option
- Icon support
- Horizontal or vertical layout

## Usage
\`\`\`tsx
import { SelectRadio } from '@microbuild/ui-interfaces';

<SelectRadio
  label="Select Priority"
  value={priority}
  onChange={setPriority}
  choices={[
    { text: 'Low', value: 'low' },
    { text: 'Medium', value: 'medium' },
    { text: 'High', value: 'high' },
  ]}
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    label: {
      control: 'text',
      description: 'Field label',
    },
    description: {
      control: 'text',
      description: 'Help text',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    choices: {
      control: 'object',
      description: 'Array of choices',
    },
    allowOther: {
      control: 'boolean',
      description: 'Allow custom "other" input',
    },
    color: {
      control: 'color',
      description: 'Default color for radio buttons',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Select Option',
    choices: [
      { text: 'Option A', value: 'a' },
      { text: 'Option B', value: 'b' },
      { text: 'Option C', value: 'c' },
    ],
  },
};

export const WithValue: Story = {
  args: {
    label: 'Priority',
    value: 'medium',
    choices: [
      { text: 'Low', value: 'low' },
      { text: 'Medium', value: 'medium' },
      { text: 'High', value: 'high' },
    ],
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Contact Preference',
    description: 'How would you like to be contacted?',
    choices: [
      { text: 'Email', value: 'email' },
      { text: 'Phone', value: 'phone' },
      { text: 'SMS', value: 'sms' },
    ],
  },
};

export const AllowOther: Story = {
  args: {
    label: 'How did you hear about us?',
    choices: [
      { text: 'Search Engine', value: 'search' },
      { text: 'Social Media', value: 'social' },
      { text: 'Friend', value: 'friend' },
    ],
    allowOther: true,
  },
};

export const WithColors: Story = {
  args: {
    label: 'Status',
    choices: [
      { text: 'Draft', value: 'draft', foreground: '#666' },
      { text: 'Pending', value: 'pending', foreground: '#FFA500' },
      { text: 'Published', value: 'published', foreground: '#22C55E' },
      { text: 'Archived', value: 'archived', foreground: '#EF4444' },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    label: 'Payment Method',
    choices: [
      { text: 'Credit Card', value: 'card', icon: 'credit_card' },
      { text: 'PayPal', value: 'paypal', icon: 'payments' },
      { text: 'Bank Transfer', value: 'bank', icon: 'account_balance' },
    ],
  },
};

export const Required: Story = {
  args: {
    label: 'Required Selection',
    required: true,
    choices: [
      { text: 'Yes', value: 'yes' },
      { text: 'No', value: 'no' },
    ],
  },
};

export const WithError: Story = {
  args: {
    label: 'Selection',
    error: 'Please make a selection',
    choices: [
      { text: 'Option 1', value: '1' },
      { text: 'Option 2', value: '2' },
    ],
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'selected',
    choices: [
      { text: 'Selected', value: 'selected' },
      { text: 'Not Selected', value: 'other' },
    ],
  },
};

export const CustomColor: Story = {
  args: {
    label: 'Theme Color',
    color: '#6644FF',
    choices: [
      { text: 'Light', value: 'light' },
      { text: 'Dark', value: 'dark' },
      { text: 'System', value: 'system' },
    ],
  },
};

export const ManyOptions: Story = {
  args: {
    label: 'Country',
    choices: [
      { text: 'United States', value: 'us' },
      { text: 'United Kingdom', value: 'uk' },
      { text: 'Canada', value: 'ca' },
      { text: 'Australia', value: 'au' },
      { text: 'Germany', value: 'de' },
      { text: 'France', value: 'fr' },
      { text: 'Japan', value: 'jp' },
      { text: 'Singapore', value: 'sg' },
    ],
    allowOther: true,
  },
};

export const YesNo: Story = {
  args: {
    label: 'Subscribe to newsletter?',
    choices: [
      { text: 'Yes, sign me up!', value: 'yes' },
      { text: 'No, thanks', value: 'no' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple yes/no selection.',
      },
    },
  },
};

export const SurveyRating: Story = {
  args: {
    label: 'How satisfied are you?',
    description: 'Rate your experience',
    choices: [
      { text: 'Very Dissatisfied', value: '1' },
      { text: 'Dissatisfied', value: '2' },
      { text: 'Neutral', value: '3' },
      { text: 'Satisfied', value: '4' },
      { text: 'Very Satisfied', value: '5' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Survey-style satisfaction rating.',
      },
    },
  },
};

export const ShippingMethod: Story = {
  args: {
    label: 'Shipping Method',
    description: 'Select your preferred shipping option',
    choices: [
      { text: 'Standard (5-7 days) - Free', value: 'standard' },
      { text: 'Express (2-3 days) - $9.99', value: 'express' },
      { text: 'Next Day - $24.99', value: 'next_day' },
    ],
    value: 'standard',
  },
  parameters: {
    docs: {
      description: {
        story: 'E-commerce shipping selection.',
      },
    },
  },
};
