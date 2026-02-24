import type { Meta, StoryObj } from "@storybook/react";
import { SelectMultipleDropdown } from "./SelectMultipleDropdown";

/**
 * SelectMultipleDropdown stories
 *
 * Previously this component was never correctly wired from the DaaS backend because
 * `getExplicitInterface()` had no `case 'select-multiple-dropdown'` entry.  It now
 * maps correctly and the stories below cover all supported prop combinations.
 */
const meta: Meta<typeof SelectMultipleDropdown> = {
  title: "Interfaces/SelectMultipleDropdown",
  component: SelectMultipleDropdown,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `Dropdown-based multi-select interface that matches the DaaS \`select-multiple-dropdown\` interface.

## Fix history
Previously \`getExplicitInterface()\` had no case for \`select-multiple-dropdown\`, so the field
fell back to type-based mapping and rendered as \`InputCode\` (json type).  A \`case\` block was
added that passes \`{ choices, placeholder, allowOther }\` from DaaS \`options\`.

## Features
- Searchable Mantine MultiSelect
- Full DaaS \`choices\` array support (\`{ text, value }\`)
- Optional placeholder text
- Clearable and configurable max selections
- \`allowNone\` null-value support`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "object",
      description: "Array of selected values",
    },
    label: {
      control: "text",
      description: "Label for the field",
    },
    disabled: {
      control: "boolean",
      description: "Whether the component is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether the field is required",
    },
    error: {
      control: "text",
      description: "Error message",
    },
    choices: {
      control: "object",
      description: "Array of { text, value } choice objects from DaaS",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text shown when nothing is selected",
    },
    searchable: {
      control: "boolean",
      description: "Enable search within the dropdown",
    },
    clearable: {
      control: "boolean",
      description: "Show a clear button to reset selection",
    },
    maxValues: {
      control: "number",
      description: "Maximum number of values that can be selected",
    },
    allowNone: {
      control: "boolean",
      description:
        "Allow null value (triggers onChange with null when cleared)",
    },
    width: {
      control: "text",
      description: 'Width of the component (e.g. "half")',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectMultipleDropdown>;

const fruitChoices = [
  { text: "Apple", value: "apple" },
  { text: "Banana", value: "banana" },
  { text: "Cherry", value: "cherry" },
  { text: "Date", value: "date" },
  { text: "Elderberry", value: "elderberry" },
  { text: "Fig", value: "fig" },
  { text: "Grape", value: "grape" },
];

const roleChoices = [
  { text: "Administrator", value: "admin" },
  { text: "Editor", value: "editor" },
  { text: "Viewer", value: "viewer" },
  { text: "Moderator", value: "moderator" },
  { text: "API User", value: "api" },
];

export const Default: Story = {
  args: {
    label: "Select Fruits",
    choices: fruitChoices,
  },
};

export const WithSelectedValues: Story = {
  args: {
    label: "Select Fruits",
    choices: fruitChoices,
    value: ["apple", "cherry", "fig"],
  },
};

export const WithPlaceholder: Story = {
  args: {
    label: "Assign Roles",
    choices: roleChoices,
    placeholder: "Choose one or more roles…",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Maps to DaaS `options.placeholder`. Previously this was never passed through " +
          "because the mapper had no case for `select-multiple-dropdown`.",
      },
    },
  },
};

export const Required: Story = {
  args: {
    label: "Select Fruits",
    choices: fruitChoices,
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Select Fruits",
    choices: fruitChoices,
    error: "Please select at least one option",
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Select Fruits",
    choices: fruitChoices,
    value: ["banana", "grape"],
    disabled: true,
  },
};

export const MaxTwoSelections: Story = {
  args: {
    label: "Select up to 2 fruits",
    choices: fruitChoices,
    maxValues: 2,
    placeholder: "Maximum 2 selections",
  },
};

export const NotSearchable: Story = {
  args: {
    label: "Select Fruits (no search)",
    choices: fruitChoices,
    searchable: false,
  },
};

export const NotClearable: Story = {
  args: {
    label: "Select Fruits (no clear)",
    choices: fruitChoices,
    value: ["apple"],
    clearable: false,
  },
};

export const EmptyChoices: Story = {
  args: {
    label: "No options available",
    choices: [],
    placeholder: "No choices configured",
  },
};

export const HalfWidth: Story = {
  args: {
    label: "Select Roles",
    choices: roleChoices,
    width: "half",
  },
};

/**
 * Simulates props passed by getExplicitInterface() when the DaaS field has
 * interface = 'select-multiple-dropdown'.  The mapper now extracts
 * { choices, placeholder, allowOther } from options.
 */
export const AsDaaSBackendConfigured: Story = {
  name: "AsDaaSBackendConfigured (mapper output)",
  args: {
    label: "Status Tags",
    choices: [
      { text: "Active", value: "active" },
      { text: "Pending", value: "pending" },
      { text: "Archived", value: "archived" },
      { text: "Draft", value: "draft" },
    ],
    placeholder: "Select statuses",
    value: ["active"],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the exact prop shape emitted by `getExplicitInterface()` after the fix. " +
          "`choices` and `placeholder` now correctly flow from DaaS `options` to the component.",
      },
    },
  },
};
