import type { Meta, StoryObj } from '@storybook/react';
import { Tags } from './Tags';

const meta: Meta<typeof Tags> = {
  title: 'Interfaces/Tags',
  component: Tags,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A tag input interface that supports preset tags, custom tags, and various text transformation options.

## Features
- Preset tag chips for quick selection
- Custom tag input with comma or Enter to add
- Text transformations: lowercase, uppercase, capitalize
- Alphabetized output option
- Duplicate prevention
- Optional icons

## Usage
\`\`\`tsx
import { Tags } from '@microbuild/ui-interfaces';

<Tags
  label="Categories"
  value={['react', 'typescript']}
  onChange={(tags) => console.log(tags)}
  presets={['React', 'Vue', 'Angular']}
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'object',
      description: 'Current array of selected tags',
    },
    label: {
      control: 'text',
      description: 'Field label',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    presets: {
      control: 'object',
      description: 'Preset tag options',
    },
    allowCustom: {
      control: 'boolean',
      description: 'Whether custom (non-preset) tags are allowed',
    },
    alphabetize: {
      control: 'boolean',
      description: 'Whether to alphabetize the tags',
    },
    lowercase: {
      control: 'boolean',
      description: 'Whether to lowercase all tags',
    },
    uppercase: {
      control: 'boolean',
      description: 'Whether to uppercase all tags',
    },
    capitalize: {
      control: 'boolean',
      description: 'Whether to capitalize the first letter of each tag',
    },
    trim: {
      control: 'boolean',
      description: 'Whether to trim whitespace from tags',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Tags',
    placeholder: 'Add a tag...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Categories',
    value: ['React', 'TypeScript', 'Mantine'],
    description: 'Pre-selected tags',
  },
};

export const WithPresets: Story = {
  args: {
    label: 'Framework',
    presets: ['React', 'Vue', 'Angular', 'Svelte', 'Solid'],
    placeholder: 'Select or add a framework...',
    description: 'Click presets to add or type custom tags',
  },
};

export const PresetsOnly: Story = {
  args: {
    label: 'Priority',
    presets: ['Low', 'Medium', 'High', 'Critical'],
    allowCustom: false,
    placeholder: 'Select priority...',
    description: 'Only preset values allowed',
  },
};

export const WithSelectedPresets: Story = {
  args: {
    label: 'Skills',
    presets: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust'],
    value: ['JavaScript', 'TypeScript'],
    description: 'Some presets already selected',
  },
};

export const LowercaseTransform: Story = {
  args: {
    label: 'Keywords',
    lowercase: true,
    placeholder: 'Tags will be lowercased',
    value: ['REACT', 'TypeScript'],
    description: 'All tags converted to lowercase',
  },
};

export const UppercaseTransform: Story = {
  args: {
    label: 'Codes',
    uppercase: true,
    placeholder: 'Tags will be uppercased',
    value: ['abc', 'def'],
    description: 'All tags converted to uppercase',
  },
};

export const CapitalizeTransform: Story = {
  args: {
    label: 'Names',
    capitalize: true,
    placeholder: 'Tags will be capitalized',
    value: ['john', 'jane'],
    description: 'First letter capitalized',
  },
};

export const Alphabetized: Story = {
  args: {
    label: 'Sorted Tags',
    alphabetize: true,
    value: ['Zebra', 'Apple', 'Mango', 'Banana'],
    description: 'Tags are automatically sorted alphabetically',
  },
};

export const TrimWhitespace: Story = {
  args: {
    label: 'Trimmed Tags',
    trim: true,
    placeholder: 'Whitespace will be trimmed',
    description: 'Leading/trailing spaces removed from tags',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Tags',
    required: true,
    placeholder: 'Add at least one tag...',
  },
};

export const WithError: Story = {
  args: {
    label: 'Tags',
    error: 'Please add at least one tag',
    value: [],
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Tags',
    disabled: true,
    value: ['Read', 'Only'],
    description: 'Cannot add or remove tags',
  },
};

export const ManyTags: Story = {
  args: {
    label: 'Many Tags',
    value: [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
      'Node.js', 'Python', 'Go', 'Rust', 'Java',
    ],
    description: 'Multiple tags wrap to new lines',
  },
};

export const ColoredPresets: Story = {
  args: {
    label: 'Status',
    presets: ['Draft', 'Pending', 'Published', 'Archived'],
    value: ['Published'],
    allowCustom: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Status tags with preset-only selection.',
      },
    },
  },
};

export const TechStack: Story = {
  args: {
    label: 'Tech Stack',
    presets: [
      'React', 'Next.js', 'TypeScript', 'Node.js',
      'PostgreSQL', 'Redis', 'Docker', 'AWS',
    ],
    value: ['React', 'TypeScript', 'Node.js'],
    placeholder: 'Add technologies...',
    description: 'Select from common technologies or add custom ones',
  },
  parameters: {
    docs: {
      description: {
        story: 'Common use case for listing technology stack.',
      },
    },
  },
};

export const AllTransforms: Story = {
  args: {
    label: 'Processed Tags',
    lowercase: true,
    alphabetize: true,
    trim: true,
    placeholder: 'Tags will be lowercased, trimmed, and sorted',
    value: ['  Zebra  ', 'APPLE', 'mango'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple transformations applied together.',
      },
    },
  },
};
