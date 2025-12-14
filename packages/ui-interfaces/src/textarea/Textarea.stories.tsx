import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Interfaces/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `A multi-line text input interface based on the Directus input-multiline interface.

## Features
- Soft character length limit with counter
- Auto-sizing based on content
- Configurable min/max rows
- Font family options
- RTL/LTR text direction
- Trim whitespace option

## Usage
\`\`\`tsx
import { Textarea } from '@microbuild/ui-interfaces';

<Textarea
  label="Description"
  value={description}
  onChange={(val) => setDescription(val)}
  softLength={500}
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the field is readonly',
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
    softLength: {
      control: 'number',
      description: 'Soft character length limit (shows counter)',
    },
    trim: {
      control: 'boolean',
      description: 'Whether to trim whitespace on blur',
    },
    font: {
      control: 'select',
      options: ['sans-serif', 'serif', 'monospace'],
      description: 'Font family',
    },
    direction: {
      control: 'select',
      options: ['ltr', 'rtl'],
      description: 'Text direction',
    },
    minRows: {
      control: 'number',
      description: 'Minimum number of rows',
    },
    maxRows: {
      control: 'number',
      description: 'Maximum number of rows',
    },
    autosize: {
      control: 'boolean',
      description: 'Whether to autosize based on content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter description...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Bio',
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    description: 'Write a short bio about yourself',
  },
};

export const WithSoftLength: Story = {
  args: {
    label: 'Summary',
    softLength: 200,
    placeholder: 'Write a summary (max 200 characters)',
    description: 'Character count will show as you type',
  },
};

export const ApproachingLimit: Story = {
  args: {
    label: 'Tweet',
    softLength: 280,
    value: 'This is a sample text that is getting close to the character limit. You can see how the counter changes color as you approach the maximum allowed characters.',
    description: 'Counter turns yellow when approaching limit',
  },
};

export const MonospaceFont: Story = {
  args: {
    label: 'Code Snippet',
    font: 'monospace',
    placeholder: 'Enter code here...',
    minRows: 5,
    value: `function hello() {
  console.log("Hello, World!");
}`,
  },
};

export const SerifFont: Story = {
  args: {
    label: 'Story',
    font: 'serif',
    placeholder: 'Once upon a time...',
    description: 'A serif font for literary content',
  },
};

export const FixedRows: Story = {
  args: {
    label: 'Notes',
    minRows: 5,
    maxRows: 5,
    autosize: false,
    placeholder: 'Fixed 5 rows',
    description: 'Does not autosize',
  },
};

export const AutosizeRows: Story = {
  args: {
    label: 'Comments',
    minRows: 2,
    maxRows: 10,
    autosize: true,
    placeholder: 'Start typing to see it grow...',
    description: 'Grows with content up to 10 rows',
  },
};

export const RTLDirection: Story = {
  args: {
    label: 'النص العربي',
    direction: 'rtl',
    placeholder: 'اكتب هنا...',
    description: 'Right-to-left text direction',
  },
};

export const WithTrim: Story = {
  args: {
    label: 'Trimmed Input',
    trim: true,
    placeholder: 'Whitespace will be trimmed on blur',
    description: 'Leading and trailing spaces removed automatically',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Field',
    required: true,
    placeholder: 'This field is required',
  },
};

export const WithError: Story = {
  args: {
    label: 'Invalid Input',
    error: 'This field contains invalid content',
    value: 'Invalid content',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'This content cannot be edited',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    readOnly: true,
    value: 'This is read-only content that can be selected but not edited.',
    description: 'View-only mode',
  },
};

export const LongContent: Story = {
  args: {
    label: 'Article Content',
    minRows: 3,
    maxRows: 15,
    value: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
    description: 'Multi-paragraph content',
  },
};
