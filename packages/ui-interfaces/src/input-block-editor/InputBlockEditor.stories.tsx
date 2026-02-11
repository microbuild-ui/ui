import type { Meta, StoryObj } from '@storybook/react';
import { InputBlockEditor } from './InputBlockEditor';

const meta: Meta<typeof InputBlockEditor> = {
  title: 'Interfaces/InputBlockEditor',
  component: InputBlockEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A block-based content editor using Editor.js for visual content creation.

## Features
- Block-based content structure
- Multiple block types (paragraph, header, list, code, quote, etc.)
- Drag and drop reordering
- Inline formatting
- JSON output format
- Extensible with custom blocks

## Available Blocks
- Header (H1-H6)
- Paragraph
- Nested List
- Code
- Quote
- Checklist
- Delimiter
- Table
- Underline
- Inline Code

## Usage
\`\`\`tsx
import { InputBlockEditor } from '@microbuild/ui-interfaces';

<InputBlockEditor
  label="Content"
  value={blockData}
  onChange={(data) => setBlockData(data)}
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'object',
      description: 'Current value as EditorJS OutputData',
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
    readOnly: {
      control: 'boolean',
      description: 'Whether the field is read-only',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    description: {
      control: 'text',
      description: 'Field description',
    },
    font: {
      control: 'select',
      options: ['sans-serif', 'monospace', 'serif'],
      description: 'Font family',
    },
    tools: {
      control: 'object',
      description: 'Available tools/blocks',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Content',
    placeholder: 'Start writing or press Tab to add a block...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Article Content',
    value: {
      time: Date.now(),
      blocks: [
        {
          type: 'header',
          data: { text: 'Welcome to the Block Editor', level: 1 },
        },
        {
          type: 'paragraph',
          data: { text: 'This is a paragraph block with some sample content.' },
        },
        {
          type: 'header',
          data: { text: 'Features', level: 2 },
        },
        {
          type: 'nestedlist',
          data: {
            style: 'unordered',
            items: [
              { content: 'Block-based editing', items: [] },
              { content: 'Multiple block types', items: [] },
              { content: 'Easy to use interface', items: [] },
            ],
          },
        },
      ],
      version: '2.28.2',
    },
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Page Content',
    description: 'Build your page using content blocks',
    placeholder: 'Click here to start adding blocks...',
  },
};

export const BlogPost: Story = {
  args: {
    label: 'Blog Post',
    value: {
      time: Date.now(),
      blocks: [
        {
          type: 'header',
          data: { text: 'My First Blog Post', level: 1 },
        },
        {
          type: 'paragraph',
          data: { text: 'Welcome to my blog! Today I want to share some thoughts about web development.' },
        },
        {
          type: 'header',
          data: { text: 'Key Takeaways', level: 2 },
        },
        {
          type: 'nestedlist',
          data: {
            style: 'ordered',
            items: [
              { content: 'Always write clean code', items: [] },
              { content: 'Test your components', items: [] },
              { content: 'Document your work', items: [] },
            ],
          },
        },
        {
          type: 'quote',
          data: {
            text: 'The best code is no code at all.',
            caption: 'Jeff Atwood',
          },
        },
      ],
      version: '2.28.2',
    },
  },
};

export const WithCode: Story = {
  args: {
    label: 'Technical Documentation',
    value: {
      time: Date.now(),
      blocks: [
        {
          type: 'header',
          data: { text: 'Installation Guide', level: 1 },
        },
        {
          type: 'paragraph',
          data: { text: 'Follow these steps to install the package:' },
        },
        {
          type: 'code',
          data: { code: 'npm install @microbuild/ui-interfaces' },
        },
        {
          type: 'paragraph',
          data: { text: 'Then import and use the components:' },
        },
        {
          type: 'code',
          data: { code: "import { InputBlockEditor } from '@microbuild/ui-interfaces';\n\n<InputBlockEditor\n  label=\"Content\"\n  onChange={handleChange}\n/>" },
        },
      ],
      version: '2.28.2',
    },
  },
};

export const WithChecklist: Story = {
  args: {
    label: 'Task List',
    value: {
      time: Date.now(),
      blocks: [
        {
          type: 'header',
          data: { text: 'Project Checklist', level: 2 },
        },
        {
          type: 'checklist',
          data: {
            items: [
              { text: 'Set up project structure', checked: true },
              { text: 'Install dependencies', checked: true },
              { text: 'Create components', checked: false },
              { text: 'Write tests', checked: false },
              { text: 'Deploy to production', checked: false },
            ],
          },
        },
      ],
      version: '2.28.2',
    },
  },
};

export const SerifFont: Story = {
  args: {
    label: 'Literary Content',
    font: 'serif',
    placeholder: 'Write with a classic feel...',
  },
};

export const MonospaceFont: Story = {
  args: {
    label: 'Technical Content',
    font: 'monospace',
    placeholder: 'Technical documentation...',
  },
};

export const LimitedTools: Story = {
  args: {
    label: 'Simple Editor',
    tools: ['header', 'paragraph', 'nestedlist'],
    placeholder: 'Basic blocks only...',
    description: 'Only headers, paragraphs, and lists available',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Content',
    required: true,
    placeholder: 'This field is required',
  },
};

export const WithError: Story = {
  args: {
    label: 'Content',
    error: 'Content cannot be empty',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Editor',
    disabled: true,
    value: {
      time: Date.now(),
      blocks: [
        {
          type: 'paragraph',
          data: { text: 'This content is not editable.' },
        },
      ],
      version: '2.28.2',
    },
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Published Content',
    readOnly: true,
    value: {
      time: Date.now(),
      blocks: [
        {
          type: 'header',
          data: { text: 'Published Article', level: 1 },
        },
        {
          type: 'paragraph',
          data: { text: 'This content is published and cannot be edited.' },
        },
      ],
      version: '2.28.2',
    },
  },
};

export const PageBuilder: Story = {
  args: {
    label: 'Landing Page',
    description: 'Design your landing page using content blocks',
    value: {
      time: Date.now(),
      blocks: [
        {
          type: 'header',
          data: { text: 'Welcome to Our Product', level: 1 },
        },
        {
          type: 'paragraph',
          data: { text: 'The best solution for your business needs. Get started today!' },
        },
        {
          type: 'header',
          data: { text: 'Why Choose Us?', level: 2 },
        },
        {
          type: 'nestedlist',
          data: {
            style: 'unordered',
            items: [
              { content: 'Easy to use', items: [] },
              { content: 'Powerful features', items: [] },
              { content: 'Great support', items: [] },
            ],
          },
        },
        {
          type: 'delimiter',
          data: {},
        },
        {
          type: 'header',
          data: { text: 'Get Started', level: 2 },
        },
        {
          type: 'paragraph',
          data: { text: 'Sign up for a free trial today and see the difference.' },
        },
      ],
      version: '2.28.2',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example landing page content structure.',
      },
    },
  },
};
