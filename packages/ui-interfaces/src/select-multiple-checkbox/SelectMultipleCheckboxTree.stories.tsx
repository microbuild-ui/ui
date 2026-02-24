import type { Meta, StoryObj } from "@storybook/react";
import { SelectMultipleCheckboxTree } from "./SelectMultipleCheckboxTree";

/**
 * SelectMultipleCheckboxTree stories
 *
 * Previously this component was never correctly wired from the DaaS backend because
 * `getExplicitInterface()` had no `case 'select-multiple-checkbox-tree'` entry.
 * It now maps correctly and the stories below cover all supported prop combinations.
 */
const meta: Meta<typeof SelectMultipleCheckboxTree> = {
  title: "Interfaces/SelectMultipleCheckboxTree",
  component: SelectMultipleCheckboxTree,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `Tree-based multi-select checkbox interface matching the DaaS \`select-multiple-checkbox-tree\` interface.

## Fix history
Previously \`getExplicitInterface()\` had no case for \`select-multiple-checkbox-tree\`, so the field
fell back to type-based mapping and rendered as \`InputCode\` (json type).  A \`case\` was added
that passes \`{ choices }\` from DaaS \`options\`.

## Features
- Hierarchical \`choices\` with unlimited nesting depth
- Five value-combining modes: \`all\`, \`branch\`, \`leaf\`, \`indeterminate\`, \`exclusive\`
- Built-in search/filter
- Expand / collapse tree nodes
- "Show selected only" filter
- DaaS-compatible \`{ text, value, children }\` choice schema`,
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
      description: "Whether the tree is disabled",
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
      description:
        "Tree of { text, value, children? } choice objects from DaaS",
    },
    valueCombining: {
      control: "select",
      options: ["all", "branch", "leaf", "indeterminate", "exclusive"],
      description:
        "Controls which values are included when a parent node is selected. " +
        "`all` = parent + all descendants, `leaf` = only leaf nodes, " +
        "`branch` = only the branch root, `indeterminate` = only indeterminate nodes, " +
        "`exclusive` = only the direct selected node.",
    },
    width: {
      control: "text",
      description: 'Width of the component (e.g. "half")',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectMultipleCheckboxTree>;

// ─── Shared choice fixtures ────────────────────────────────────────────────

const categoryChoices = [
  {
    text: "Technology",
    value: "tech",
    children: [
      { text: "Frontend", value: "frontend" },
      { text: "Backend", value: "backend" },
      { text: "DevOps", value: "devops" },
    ],
  },
  {
    text: "Design",
    value: "design",
    children: [
      { text: "UI", value: "ui" },
      { text: "UX", value: "ux" },
      { text: "Branding", value: "branding" },
    ],
  },
  {
    text: "Business",
    value: "business",
  },
];

const deepChoices = [
  {
    text: "Europe",
    value: "europe",
    children: [
      {
        text: "Western Europe",
        value: "western-europe",
        children: [
          { text: "France", value: "fr" },
          { text: "Germany", value: "de" },
          { text: "Netherlands", value: "nl" },
        ],
      },
      {
        text: "Eastern Europe",
        value: "eastern-europe",
        children: [
          { text: "Poland", value: "pl" },
          { text: "Czech Republic", value: "cz" },
        ],
      },
    ],
  },
  {
    text: "Asia",
    value: "asia",
    children: [
      { text: "Indonesia", value: "id" },
      { text: "Singapore", value: "sg" },
      { text: "Japan", value: "jp" },
    ],
  },
];

// ─── Stories ──────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: "Select Categories",
    choices: categoryChoices,
  },
};

export const WithSelectedValues: Story = {
  args: {
    label: "Select Categories",
    choices: categoryChoices,
    value: ["frontend", "ui"],
  },
};

export const Required: Story = {
  args: {
    label: "Select Categories",
    choices: categoryChoices,
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Select Categories",
    choices: categoryChoices,
    error: "Please select at least one category",
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Select Categories",
    choices: categoryChoices,
    value: ["backend", "ux"],
    disabled: true,
  },
};

// Value-combining modes

export const ValueCombiningAll: Story = {
  name: "ValueCombining: all",
  args: {
    label: "All nodes selected (parent + descendants)",
    choices: categoryChoices,
    valueCombining: "all",
    value: ["tech"],
  },
  parameters: {
    docs: {
      description: {
        story:
          "`all`: selecting a parent stores the parent value AND all descendant values. " +
          'Selecting "Technology" yields `["tech", "frontend", "backend", "devops"]`.',
      },
    },
  },
};

export const ValueCombiningLeaf: Story = {
  name: "ValueCombining: leaf",
  args: {
    label: "Leaf nodes only",
    choices: categoryChoices,
    valueCombining: "leaf",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`leaf`: only leaf (childless) nodes are stored. " +
          'Selecting "Technology" yields `["frontend", "backend", "devops"]` — the parent is omitted.',
      },
    },
  },
};

export const ValueCombiningBranch: Story = {
  name: "ValueCombining: branch",
  args: {
    label: "Branch root only",
    choices: categoryChoices,
    valueCombining: "branch",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`branch`: only the branch root value is stored when all children are selected.",
      },
    },
  },
};

export const ValueCombiningExclusive: Story = {
  name: "ValueCombining: exclusive",
  args: {
    label: "Exclusive (only clicked node)",
    choices: categoryChoices,
    valueCombining: "exclusive",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`exclusive`: only the directly selected node value is stored — no propagation to children or parent.",
      },
    },
  },
};

// Deep hierarchy

export const DeepHierarchy: Story = {
  args: {
    label: "Select Regions",
    choices: deepChoices,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates three levels of nesting: Continent → Region → Country.",
      },
    },
  },
};

export const DeepHierarchyWithSelection: Story = {
  args: {
    label: "Select Regions",
    choices: deepChoices,
    value: ["fr", "de", "sg"],
  },
};

export const FlatChoices: Story = {
  args: {
    label: "Flat list (no tree)",
    choices: [
      { text: "Option A", value: "a" },
      { text: "Option B", value: "b" },
      { text: "Option C", value: "c" },
      { text: "Option D", value: "d" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "The component degrades gracefully to a flat checkbox list when no `children` are provided.",
      },
    },
  },
};

export const EmptyChoices: Story = {
  args: {
    label: "No categories defined",
    choices: [],
  },
};

/**
 * Simulates props passed by getExplicitInterface() when the DaaS field has
 * interface = 'select-multiple-checkbox-tree'.  The mapper now extracts
 * { choices } from options.
 */
export const AsDaaSBackendConfigured: Story = {
  name: "AsDaaSBackendConfigured (mapper output)",
  args: {
    label: "Content Categories",
    choices: categoryChoices,
    value: ["frontend", "ux"],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the exact prop shape emitted by `getExplicitInterface()` after the fix. " +
          "`choices` now correctly flows from DaaS `options` to the component. " +
          "Previously this field rendered as `InputCode` due to the missing case in the mapper.",
      },
    },
  },
};
