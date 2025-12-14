import type { Meta, StoryObj } from '@storybook/react-vite';
import { Notice } from './Notice';
import { IconRocket, IconInfoCircle } from '@tabler/icons-react';

const meta: Meta<typeof Notice> = {
  title: 'Interfaces/Notice',
  component: Notice,
  parameters: {
    layout: 'padded',
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
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
      description: 'Type of notice that determines the default styling',
    },
    icon: {
      control: false,
      description: 'Custom icon or false to hide the icon',
    },
    center: {
      control: 'boolean',
      description: 'Whether to center the content',
    },
    multiline: {
      control: 'boolean',
      description: 'Whether to allow multiline content with wrapping',
    },
    indentContent: {
      control: 'boolean',
      description: 'Whether to indent content to align with title',
    },
    title: {
      control: 'text',
      description: 'Title/heading for the notice',
    },
    children: {
      control: 'text',
      description: 'Content for the notice body',
    },
    color: {
      control: 'color',
      description: 'Custom text color',
    },
    backgroundColor: {
      control: 'color',
      description: 'Custom background color',
    },
    borderColor: {
      control: 'color',
      description: 'Custom border color',
    },
    iconColor: {
      control: 'color',
      description: 'Custom icon color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a default notice message.',
  },
};

export const Info: Story = {
  args: {
    type: 'info',
    title: 'Information',
    children: 'This is an informational notice.',
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    title: 'Success',
    children: 'Your changes have been saved successfully.',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    title: 'Warning',
    children: 'This action may have unintended consequences.',
  },
};

export const Danger: Story = {
  args: {
    type: 'danger',
    title: 'Error',
    children: 'An error occurred while processing your request.',
  },
};

export const TitleOnly: Story = {
  args: {
    type: 'info',
    title: 'This notice only has a title',
  },
};

export const ContentOnly: Story = {
  args: {
    type: 'warning',
    children: 'This notice only has content without a title.',
  },
};

export const Centered: Story = {
  args: {
    type: 'info',
    title: 'Centered Notice',
    children: 'This notice has centered content.',
    center: true,
  },
};

export const NoIcon: Story = {
  args: {
    type: 'info',
    title: 'No Icon',
    children: 'This notice has the icon hidden.',
    icon: false,
  },
};

export const CustomIcon: Story = {
  args: {
    type: 'info',
    title: 'New Feature',
    children: 'Check out our new rocket-powered feature!',
    icon: <IconRocket size={24} />,
  },
};

export const Multiline: Story = {
  args: {
    type: 'info',
    title: 'Important Notice',
    multiline: true,
    children: `This is a multiline notice with longer content.
    
It can contain multiple paragraphs or formatted text that wraps naturally based on the container width. This is useful for detailed explanations or instructions.`,
  },
};

export const IndentedContent: Story = {
  args: {
    type: 'warning',
    title: 'Configuration Required',
    indentContent: true,
    children: 'Please complete the setup wizard to configure your account. This content is indented to align with the title.',
  },
};

export const CustomColors: Story = {
  args: {
    title: 'Custom Styled',
    children: 'This notice uses custom colors.',
    color: '#1a1a2e',
    backgroundColor: '#edf2f4',
    borderColor: '#6644FF',
    iconColor: '#6644FF',
  },
};

export const LongContent: Story = {
  args: {
    type: 'info',
    title: 'Terms and Conditions',
    multiline: true,
    indentContent: true,
    children: `By using this service, you agree to our terms of use and privacy policy. 

Please read these documents carefully before proceeding. If you have any questions or concerns, please contact our support team.

Your data is handled securely and in accordance with applicable data protection regulations.`,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        story: 'All four notice variants displayed together.',
      },
    },
  },
};

export const FormValidation: Story = {
  args: {
    type: 'danger',
    title: 'Validation Error',
    children: 'Please correct the following errors before submitting the form.',
    indentContent: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Commonly used to show form validation errors.',
      },
    },
  },
};
