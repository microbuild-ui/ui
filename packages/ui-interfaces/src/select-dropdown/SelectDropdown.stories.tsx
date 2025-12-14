import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectDropdown, SelectOption } from './SelectDropdown';

const meta: Meta<typeof SelectDropdown> = {
  title: 'Interfaces/SelectDropdown',
  component: SelectDropdown,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
SelectDropdown component implementing Directus select-dropdown interface functionality using Mantine's Select component.

## Features

- Single value selection from predefined choices
- Support for string, number, and boolean values
- Optional custom value input (allowOther)
- Clearable selection (allowNone)
- Search functionality
- Icon support
- Validation and error states
- Accessibility compliant

## Directus Compatibility

This component matches the behavior of the Directus \`select-dropdown\` interface:
- Supports the same choice format with text/value pairs
- Handles allowNone and allowOther options
- Compatible with all Directus field types (string, integer, float, bigInteger)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'Current selected value',
    },
    choices: {
      control: { type: 'object' },
      description: 'Array of choice options with text and value properties',
    },
    onChange: {
      action: 'onChange',
      description: 'Callback fired when selection changes',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the select is disabled',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text when no option is selected',
    },
    icon: {
      control: { type: 'text' },
      description: 'Icon name to display in the left section',
    },
    allowNone: {
      control: { type: 'boolean' },
      description: 'Whether to allow clearing the selection',
    },
    allowOther: {
      control: { type: 'boolean' },
      description: 'Whether to allow entering custom values',
    },
    label: {
      control: { type: 'text' },
      description: 'Field label',
    },
    description: {
      control: { type: 'text' },
      description: 'Field description',
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the field is required',
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Whether the field is read-only',
    },
    searchable: {
      control: { type: 'boolean' },
      description: 'Whether to enable search functionality',
    },
    maxDropdownHeight: {
      control: { type: 'number', min: 100, max: 500, step: 50 },
      description: 'Maximum height of the dropdown in pixels',
    },
  },
} satisfies Meta<typeof SelectDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const frameworkChoices: SelectOption[] = [
  { text: 'React', value: 'react' },
  { text: 'Vue.js', value: 'vue' },
  { text: 'Angular', value: 'angular' },
  { text: 'Svelte', value: 'svelte' },
  { text: 'Solid.js', value: 'solid' },
  { text: 'Qwik', value: 'qwik' },
];

const priorityChoices: SelectOption[] = [
  { text: 'Low', value: 1 },
  { text: 'Medium', value: 2 },
  { text: 'High', value: 3 },
  { text: 'Critical', value: 4 },
];

const statusChoices: SelectOption[] = [
  { text: 'Active', value: true },
  { text: 'Inactive', value: false },
];

const categoryChoices: SelectOption[] = [
  { text: 'Frontend', value: 'frontend' },
  { text: 'Backend', value: 'backend' },
  { text: 'DevOps', value: 'devops' },
  { text: 'Design', value: 'design' },
  { text: 'Mobile (Disabled)', value: 'mobile', disabled: true },
];

// Basic story
export const Default: Story = {
  args: {
    label: 'Favorite Framework',
    placeholder: 'Choose a framework',
    choices: frameworkChoices,
    value: 'react',
  },
};

// String values
export const StringValues: Story = {
  args: {
    label: 'Project Category',
    description: 'Select the main category for your project',
    placeholder: 'Choose a category',
    choices: categoryChoices,
    value: 'frontend',
  },
};

// Numeric values
export const NumericValues: Story = {
  args: {
    label: 'Priority Level',
    description: 'Select the priority level (1-4)',
    placeholder: 'Choose priority',
    choices: priorityChoices,
    value: 3,
  },
};

// Boolean values
export const BooleanValues: Story = {
  args: {
    label: 'Status',
    description: 'Is the feature currently active?',
    placeholder: 'Select status',
    choices: statusChoices,
    value: true,
  },
};

// With icon
export const WithIcon: Story = {
  args: {
    label: 'Framework',
    placeholder: 'Choose a framework',
    choices: frameworkChoices,
    icon: 'code',
    value: 'vue',
  },
};

// Clearable (allowNone)
export const Clearable: Story = {
  args: {
    label: 'Optional Framework',
    description: 'You can clear this selection',
    placeholder: 'Choose a framework (optional)',
    choices: frameworkChoices,
    allowNone: true,
    value: 'angular',
  },
};

// Searchable
export const Searchable: Story = {
  args: {
    label: 'Searchable Framework',
    description: 'Type to search through options',
    placeholder: 'Search frameworks...',
    choices: frameworkChoices,
    searchable: true,
  },
};

// Allow custom values (allowOther)
export const AllowCustomValues: Story = {
  args: {
    label: 'Framework or Custom',
    description: 'You can select from the list or enter a custom value',
    placeholder: 'Choose or type a framework',
    choices: frameworkChoices,
    allowOther: true,
    searchable: true,
  },
};

// Required field
export const Required: Story = {
  args: {
    label: 'Required Framework',
    description: 'This field is required',
    placeholder: 'Choose a framework',
    choices: frameworkChoices,
    required: true,
  },
};

// With error
export const WithError: Story = {
  args: {
    label: 'Framework',
    placeholder: 'Choose a framework',
    choices: frameworkChoices,
    error: 'Please select a valid framework',
    required: true,
  },
};

// Disabled
export const Disabled: Story = {
  args: {
    label: 'Framework (Disabled)',
    placeholder: 'Choose a framework',
    choices: frameworkChoices,
    value: 'react',
    disabled: true,
  },
};

// Read-only
export const ReadOnly: Story = {
  args: {
    label: 'Framework (Read-only)',
    placeholder: 'Choose a framework',
    choices: frameworkChoices,
    value: 'react',
    readOnly: true,
  },
};

// No choices error
export const NoChoicesError: Story = {
  args: {
    label: 'Framework',
    placeholder: 'Choose a framework',
    choices: [],
    allowOther: false,
  },
};

// Empty choices with allowOther
export const EmptyChoicesWithCustom: Story = {
  args: {
    label: 'Custom Input',
    description: 'No predefined choices, but you can enter any value',
    placeholder: 'Enter any value...',
    choices: [],
    allowOther: true,
  },
};

// Large dataset
export const LargeDataset: Story = {
  args: {
    label: 'Country',
    description: 'Large list with search functionality',
    placeholder: 'Search countries...',
    choices: Array.from({ length: 100 }, (_, i) => ({
      text: `Country ${i + 1}`,
      value: `country_${i + 1}`,
    })),
    searchable: true,
    maxDropdownHeight: 200,
  },
};

// All features combined
export const AllFeatures: Story = {
  args: {
    label: 'Advanced Framework Selection',
    description: 'Demonstrates all available features',
    placeholder: 'Search or choose a framework...',
    choices: frameworkChoices,
    icon: 'settings',
    allowNone: true,
    allowOther: true,
    searchable: true,
    required: true,
    maxDropdownHeight: 300,
  },
};
