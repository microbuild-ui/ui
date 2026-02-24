import type { Meta, StoryObj } from "@storybook/react";
import { IconRocket } from "@tabler/icons-react";
import "../stories-shared.css";
import { Notice } from "./Notice";

const meta: Meta<typeof Notice> = {
  title: "Interfaces/Notice",
  component: Notice,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `A notice/alert component that provides visual feedback for information, success, warning, and error states.

## Features
- Four notice types: info, success, warning, danger
- Customizable icons or hide icon completely
- Centered layout option
- Multiline text support with wrapping
- Content indentation to align with title
- Separate title and content slots
- Custom color theming

## Usage
\`\`\`tsx
import { Notice } from '@microbuild/ui-interfaces';

<Notice type="success" title="Success!">
  Your changes have been saved.
</Notice>
\`\`\``,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
      description: "Type of notice that determines the default styling",
    },
    icon: {
      control: false,
      description:
        "Custom icon (ReactNode), `false` to hide, or `true`/omit for default type icon. " +
        "String values from DaaS backend are normalised to `null` so the default type icon is used.",
    },
    text: {
      control: "text",
      description:
        "Body text rendered when no `children` are provided. " +
        "Maps directly to the DaaS `options.text` field, enabling notice body text " +
        "when the component is rendered via VForm without slot children.",
    },
    center: {
      control: "boolean",
      description: "Whether to center the content",
    },
    multiline: {
      control: "boolean",
      description: "Whether to allow multiline content with wrapping",
    },
    indentContent: {
      control: "boolean",
      description: "Whether to indent content to align with title",
    },
    title: {
      control: "text",
      description: "Title/heading for the notice",
    },
    children: {
      control: "text",
      description: "Content for the notice body",
    },
    color: {
      control: "color",
      description: "Custom text color",
    },
    backgroundColor: {
      control: "color",
      description: "Custom background color",
    },
    borderColor: {
      control: "color",
      description: "Custom border color",
    },
    iconColor: {
      control: "color",
      description: "Custom icon color",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This is a default notice message.",
  },
};

export const Info: Story = {
  args: {
    type: "info",
    title: "Information",
    children: "This is an informational notice.",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    title: "Success",
    children: "Your changes have been saved successfully.",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    title: "Warning",
    children: "This action may have unintended consequences.",
  },
};

export const Danger: Story = {
  args: {
    type: "danger",
    title: "Error",
    children: "An error occurred while processing your request.",
  },
};

export const TitleOnly: Story = {
  args: {
    type: "info",
    title: "This notice only has a title",
  },
};

export const ContentOnly: Story = {
  args: {
    type: "warning",
    children: "This notice only has content without a title.",
  },
};

export const Centered: Story = {
  args: {
    type: "info",
    title: "Centered Notice",
    children: "This notice has centered content.",
    center: true,
  },
};

export const NoIcon: Story = {
  args: {
    type: "info",
    title: "No Icon",
    children: "This notice has the icon hidden.",
    icon: false,
  },
};

export const CustomIcon: Story = {
  args: {
    type: "info",
    title: "New Feature",
    children: "Check out our new rocket-powered feature!",
    icon: <IconRocket size={24} />,
  },
};

export const Multiline: Story = {
  args: {
    type: "info",
    title: "Important Notice",
    multiline: true,
    children: `This is a multiline notice with longer content.
    
It can contain multiple paragraphs or formatted text that wraps naturally based on the container width. This is useful for detailed explanations or instructions.`,
  },
};

export const IndentedContent: Story = {
  args: {
    type: "warning",
    title: "Configuration Required",
    indentContent: true,
    children:
      "Please complete the setup wizard to configure your account. This content is indented to align with the title.",
  },
};

export const CustomColors: Story = {
  args: {
    title: "Custom Styled",
    children: "This notice uses custom colors.",
    color: "#1a1a2e",
    backgroundColor: "#edf2f4",
    borderColor: "#6644FF",
    iconColor: "#6644FF",
  },
};

export const LongContent: Story = {
  args: {
    type: "info",
    title: "Terms and Conditions",
    multiline: true,
    indentContent: true,
    children: `By using this service, you agree to our terms of use and privacy policy. 

Please read these documents carefully before proceeding. If you have any questions or concerns, please contact our support team.

Your data is handled securely and in accordance with applicable data protection regulations.`,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="story-stack-16">
      <Notice type="info" title="Information">
        An informational message for the user.
      </Notice>
      <Notice type="success" title="Success">
        The operation completed successfully.
      </Notice>
      <Notice type="warning" title="Warning">
        Please review before continuing.
      </Notice>
      <Notice type="danger" title="Error">
        Something went wrong.
      </Notice>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All four notice variants displayed together.",
      },
    },
  },
};

export const FormValidation: Story = {
  args: {
    type: "danger",
    title: "Validation Error",
    children: "Please correct the following errors before submitting the form.",
    indentContent: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Commonly used to show form validation errors.",
      },
    },
  },
};

// --- New prop: text ---

/**
 * DaaS stores the notice body as `options.text` on the field definition.
 * When the Notice is rendered via VForm, there are no slot children —
 * the body would have been empty before this fix.
 * The new `text` prop accepts that value and renders it as the notice body
 * when no `children` are provided.
 */
export const WithTextProp: Story = {
  name: "WithTextProp (new)",
  args: {
    type: "info",
    title: "Did you know?",
    text: "This notice body comes from the `text` prop, which maps to `options.text` stored in DaaS. Before this fix, the body was empty when rendered via VForm.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `text` prop maps to `options.text` from the DaaS field definition. " +
          "It renders as the notice body when no `children` are provided. " +
          "`children` always takes precedence over `text` if both are supplied.",
      },
    },
  },
};

export const TextFallbackVsChildren: Story = {
  name: "TextFallbackVsChildren",
  render: () => (
    <div className="story-stack-12">
      <Notice type="success" title="Using text prop">
        {undefined}
      </Notice>
      <Notice
        type="success"
        title="Using text prop"
        text="Body supplied via text prop (no children)."
      />
      <Notice
        type="warning"
        title="children takes precedence"
        text="This text prop body is ignored."
      >
        This body comes from children — text prop is ignored.
      </Notice>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates that `children` takes precedence over `text` when both are provided.",
      },
    },
  },
};

// --- Backend string icon graceful degradation ---

export const WithStringIconFromBackend: Story = {
  name: "WithStringIconFromBackend (DaaS compat)",
  args: {
    type: "warning",
    title: "Backend-configured icon",
    text: 'The `icon` prop received a plain string ("info-circle") from DaaS options. It is normalised to null so the default warning icon renders instead of raw text.',
    // @ts-expect-error intentionally passing string to show runtime guard
    icon: "info-circle",
  },
  parameters: {
    docs: {
      description: {
        story:
          "DaaS `options.icon` can be a plain string. " +
          "The component now accepts `string | ReactNode | boolean` and normalises " +
          "strings to `null`, falling back to the default type icon.",
      },
    },
  },
};
