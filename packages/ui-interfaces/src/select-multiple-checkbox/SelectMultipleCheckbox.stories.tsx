import type { Meta, StoryObj } from '@storybook/react';
import { SelectMultipleCheckbox } from './SelectMultipleCheckbox';

const meta: Meta<typeof SelectMultipleCheckbox> = {
  title: 'Interfaces/SelectMultipleCheckbox',
  component: SelectMultipleCheckbox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A multiple checkbox selection interface that matches the DaaS select-multiple-checkbox interface functionality.',
      },
    },
  },
  argTypes: {
    value: {
      control: 'object',
      description: 'Array of selected values',
    },
    onChange: {
      action: 'changed',
      description: 'Called when selection changes',
    },
    label: {
      control: 'text',
      description: 'Label for the checkbox group',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkboxes are disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    choices: {
      control: 'object',
      description: 'Array of choice options',
    },
    allowOther: {
      control: 'boolean',
      description: 'Whether to allow custom values',
    },
    width: {
      control: 'text',
      description: 'Width of the component',
    },
    color: {
      control: 'color',
      description: 'Color for checked checkboxes',
    },
    itemsShown: {
      control: 'number',
      description: 'Number of items to show before "show more" button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectMultipleCheckbox>;

const defaultChoices = [
  { text: 'Apple', value: 'apple' },
  { text: 'Banana', value: 'banana' },
  { text: 'Cherry', value: 'cherry' },
  { text: 'Date', value: 'date' },
  { text: 'Elderberry', value: 'elderberry' },
];

const manyChoices = [
  { text: 'Option 1', value: 'opt1' },
  { text: 'Option 2', value: 'opt2' },
  { text: 'Option 3', value: 'opt3' },
  { text: 'Option 4', value: 'opt4' },
  { text: 'Option 5', value: 'opt5' },
  { text: 'Option 6', value: 'opt6' },
  { text: 'Option 7', value: 'opt7' },
  { text: 'Option 8', value: 'opt8' },
  { text: 'Option 9', value: 'opt9' },
  { text: 'Option 10', value: 'opt10' },
  { text: 'Option 11', value: 'opt11' },
  { text: 'Option 12', value: 'opt12' },
];

const longTextChoices = [
  { text: 'Very Long Option Name That Exceeds Normal Length', value: 'long1' },
  { text: 'Another Extremely Long Option Name', value: 'long2' },
  { text: 'Short', value: 'short' },
  { text: 'Medium Length Option', value: 'medium' },
];

export const Default: Story = {
  args: {
    label: 'Select Fruits',
    choices: defaultChoices,
  },
};

export const WithSelectedValues: Story = {
  args: {
    label: 'Select Fruits',
    choices: defaultChoices,
    value: ['apple', 'cherry'],
  },
};

export const Required: Story = {
  args: {
    label: 'Select Fruits',
    choices: defaultChoices,
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Select Fruits',
    choices: defaultChoices,
    error: 'Please select at least one option',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Select Fruits',
    choices: defaultChoices,
    value: ['apple', 'banana'],
    disabled: true,
  },
};

export const AllowOther: Story = {
  args: {
    label: 'Select Fruits',
    choices: defaultChoices,
    allowOther: true,
  },
};

export const AllowOtherWithCustomValues: Story = {
  args: {
    label: 'Select Fruits',
    choices: defaultChoices,
    allowOther: true,
    value: ['apple', 'custom_fruit', 'another_custom'],
  },
};

export const ManyOptions: Story = {
  args: {
    label: 'Select Options',
    choices: manyChoices,
    itemsShown: 6,
  },
};

export const ManyOptionsShowAll: Story = {
  args: {
    label: 'Select Options',
    choices: manyChoices,
    itemsShown: 6,
    value: ['opt1', 'opt8', 'opt12'],
  },
};

export const LongTextOptions: Story = {
  args: {
    label: 'Select Options',
    choices: longTextChoices,
  },
};

export const HalfWidth: Story = {
  args: {
    label: 'Select Fruits',
    choices: defaultChoices,
    width: 'half',
  },
};

export const CustomColor: Story = {
  args: {
    label: 'Select Fruits',
    choices: defaultChoices,
    value: ['apple', 'banana'],
    color: '#e74c3c',
  },
};

export const MixedValueTypes: Story = {
  args: {
    label: 'Mixed Value Types',
    choices: [
      { text: 'String Value', value: 'string_value' },
      { text: 'Number Value', value: 42 },
      { text: 'Boolean True', value: true },
      { text: 'Boolean False', value: false },
    ],
    value: ['string_value', 42, true],
  },
};

export const NoChoices: Story = {
  args: {
    label: 'Select Options',
    choices: [],
  },
};

export const SmallItemsShown: Story = {
  args: {
    label: 'Select Options',
    choices: manyChoices,
    itemsShown: 3,
  },
};

export const WithAllFeatures: Story = {
  args: {
    label: 'Complete Example',
    choices: defaultChoices,
    value: ['apple', 'custom_option'],
    allowOther: true,
    required: true,
    color: '#9c88ff',
    width: '400px',
  },
};
