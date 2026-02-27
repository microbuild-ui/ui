import type { Meta, StoryObj } from "@storybook/react";
import {
  IconFolder,
  IconSettings,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import "../stories-shared.css";
import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Interfaces/Divider",
  component: Divider,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `A flexible divider component that supports horizontal and vertical orientations, optional titles, and icons.

## Features
- Horizontal and vertical orientations
- Optional title/label with icon
- Inline or stacked title positioning
- Large styling variant
- Customizable colors and thickness

## Usage
\`\`\`tsx
import { Divider } from '@buildpad/ui-interfaces';

<Divider title="Section Title" icon={<IconSettings />} />
\`\`\``,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Title content for the divider",
    },
    icon: {
      control: false,
      description:
        "Icon to display before the title. Accepts a ReactNode. " +
        "String values (e.g. from DaaS backend options) are safely ignored — the title still renders without an icon.",
    },
    vertical: {
      control: "boolean",
      description: "Whether the divider is vertical",
    },
    inlineTitle: {
      control: "boolean",
      description:
        "Whether the title is displayed inline with the divider line",
    },
    large: {
      control: "boolean",
      description: "Whether to use larger styling",
    },
    disabled: {
      control: "boolean",
      description: "Whether the divider is disabled (affects text color)",
    },
    color: {
      control: "color",
      description: "Color of the divider line",
    },
    labelColor: {
      control: "color",
      description: "Color of the label text",
    },
    thickness: {
      control: "number",
      description: "Thickness of the divider line",
    },
    margin: {
      control: "text",
      description: "Margin around the divider",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithTitle: Story = {
  args: {
    title: "Section Title",
  },
};

export const InlineTitle: Story = {
  args: {
    title: "Inline Title",
    inlineTitle: true,
  },
};

export const WithIcon: Story = {
  args: {
    title: "Settings",
    icon: <IconSettings size={16} />,
  },
};

export const InlineTitleWithIcon: Story = {
  args: {
    title: "User Profile",
    icon: <IconUser size={16} />,
    inlineTitle: true,
  },
};

export const Large: Story = {
  args: {
    title: "Main Section",
    large: true,
  },
};

export const LargeWithIcon: Story = {
  args: {
    title: "Featured",
    icon: <IconStar size={20} />,
    large: true,
  },
};

export const Disabled: Story = {
  args: {
    title: "Disabled Section",
    disabled: true,
  },
};

export const CustomColor: Story = {
  args: {
    title: "Custom Colors",
    color: "#6644FF",
    labelColor: "#6644FF",
  },
};

export const ThickDivider: Story = {
  args: {
    title: "Thick Divider",
    thickness: 3,
  },
};

export const Vertical: Story = {
  args: {
    vertical: true,
  },
  decorators: [
    (Story) => (
      <div className="story-flex-stretch-100">
        <div className="story-pad-10">Left Content</div>
        <Story />
        <div className="story-pad-10">Right Content</div>
      </div>
    ),
  ],
};

export const VerticalWithTitle: Story = {
  args: {
    vertical: true,
    title: "OR",
  },
  decorators: [
    (Story) => (
      <div className="story-flex-stretch-150">
        <div className="story-pad-10">Option A</div>
        <Story />
        <div className="story-pad-10">Option B</div>
      </div>
    ),
  ],
};

export const WithMargin: Story = {
  args: {
    title: "With Margin",
    margin: "20px",
  },
  decorators: [
    (Story) => (
      <div className="story-dashed-container">
        <Story />
      </div>
    ),
  ],
};

export const FolderSection: Story = {
  args: {
    title: "Documents",
    icon: <IconFolder size={16} />,
    inlineTitle: true,
    color: "#2196F3",
    labelColor: "#2196F3",
  },
};

// Backend string icon graceful degradation
export const WithStringIconFromBackend: Story = {
  name: "WithStringIconFromBackend (DaaS compat)",
  args: {
    title: "Section with backend icon",
    // @ts-expect-error intentionally passing string to show runtime guard
    icon: "settings",
    inlineTitle: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'DaaS `options.icon` is stored as a plain string (e.g. `"settings"`). ' +
          "The component accepts `string | ReactNode` and normalises strings to `undefined`, " +
          "so the title renders correctly without an icon rather than printing raw text.",
      },
    },
  },
};

export const FormSection: Story = {
  args: {
    title: "Personal Information",
    large: true,
    icon: <IconUser size={20} />,
  },
  parameters: {
    docs: {
      description: {
        story: "Ideal for separating sections in a form",
      },
    },
  },
};
