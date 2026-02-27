import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { IconUser, IconMail, IconPhone, IconLock } from '@tabler/icons-react';

const meta: Meta<typeof Input> = {
  title: 'Interfaces/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `A versatile input interface supporting multiple types including text, numbers, UUID, and password inputs.

## Features
- Multiple input types (string, integer, float, decimal, uuid, bigInteger)
- Masked input (password style)
- Slug conversion
- Clear button
- Soft length indicator
- Left and right icons
- Font family options

## Usage
\`\`\`tsx
import { Input } from '@buildpad/ui-interfaces';

<Input
  label="Username"
  placeholder="Enter username"
  value={username}
  onChange={(val) => setUsername(val)}
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Input value',
    },
    type: {
      control: 'select',
      options: ['string', 'uuid', 'bigInteger', 'integer', 'float', 'decimal', 'text'],
      description: 'Input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    readonly: {
      control: 'boolean',
      description: 'Whether the input is readonly',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    label: {
      control: 'text',
      description: 'Field label',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    description: {
      control: 'text',
      description: 'Help text',
    },
    masked: {
      control: 'boolean',
      description: 'Whether to mask the input (password style)',
    },
    clear: {
      control: 'boolean',
      description: 'Whether to show clear button',
    },
    slug: {
      control: 'boolean',
      description: 'Whether to convert to slug format',
    },
    trim: {
      control: 'boolean',
      description: 'Whether to trim whitespace',
    },
    softLength: {
      control: 'number',
      description: 'Soft character length limit',
    },
    font: {
      control: 'select',
      options: ['sans-serif', 'monospace', 'serif'],
      description: 'Font family',
    },
    min: {
      control: 'number',
      description: 'Minimum value (for numeric types)',
    },
    max: {
      control: 'number',
      description: 'Maximum value (for numeric types)',
    },
    step: {
      control: 'number',
      description: 'Step interval (for numeric types)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Name',
    placeholder: 'Enter your name',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Username',
    value: 'john.doe',
    description: 'Your unique username',
  },
};

export const StringInput: Story = {
  args: {
    label: 'Full Name',
    type: 'string',
    placeholder: 'John Doe',
  },
};

export const IntegerInput: Story = {
  args: {
    label: 'Age',
    type: 'integer',
    placeholder: 'Enter age',
    min: 0,
    max: 150,
  },
};

export const FloatInput: Story = {
  args: {
    label: 'Price',
    type: 'float',
    placeholder: '0.00',
    min: 0,
    step: 0.01,
  },
};

export const DecimalInput: Story = {
  args: {
    label: 'Amount',
    type: 'decimal',
    placeholder: '0.00',
    description: 'High precision decimal input',
  },
};

export const UUIDInput: Story = {
  args: {
    label: 'ID',
    type: 'uuid',
    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    font: 'monospace',
  },
};

export const PasswordInput: Story = {
  args: {
    label: 'Password',
    type: 'string',
    masked: true,
    placeholder: 'Enter password',
  },
};

export const WithClearButton: Story = {
  args: {
    label: 'Search',
    clear: true,
    value: 'Search term',
    placeholder: 'Type to search...',
  },
};

export const SlugInput: Story = {
  args: {
    label: 'URL Slug',
    slug: true,
    placeholder: 'my-page-title',
    description: 'Automatically converts to lowercase kebab-case',
  },
};

export const WithSoftLength: Story = {
  args: {
    label: 'Bio',
    softLength: 100,
    placeholder: 'Write a short bio...',
    description: 'Maximum 100 characters recommended',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter email',
    iconLeft: <IconMail size={16} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Phone',
    placeholder: 'Enter phone number',
    iconRight: <IconPhone size={16} />,
  },
};

export const MonospaceFont: Story = {
  args: {
    label: 'Code',
    font: 'monospace',
    placeholder: 'const x = 42;',
  },
};

export const SerifFont: Story = {
  args: {
    label: 'Quote',
    font: 'serif',
    placeholder: 'Enter a literary quote...',
  },
};

export const Required: Story = {
  args: {
    label: 'Email',
    required: true,
    placeholder: 'This field is required',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'Disabled value',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    readonly: true,
    value: 'Read-only value',
    description: 'This field cannot be edited',
  },
};

export const NumericWithRange: Story = {
  args: {
    label: 'Quantity',
    type: 'integer',
    min: 1,
    max: 100,
    step: 1,
    value: 10,
    description: 'Select a quantity between 1 and 100',
  },
};

export const TrimWhitespace: Story = {
  args: {
    label: 'Trimmed Input',
    trim: true,
    placeholder: 'Whitespace will be trimmed',
    description: 'Leading and trailing spaces are removed',
  },
};
