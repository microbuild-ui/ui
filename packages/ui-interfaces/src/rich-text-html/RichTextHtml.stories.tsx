import type { Meta, StoryObj } from '@storybook/react-vite';
import { RichTextHTML } from './RichTextHtml';

const meta: Meta<typeof RichTextHTML> = {
  title: 'Interfaces/RichTextHTML',
  component: RichTextHTML,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A WYSIWYG HTML editor using Tiptap with Mantine styling.

## Features
- Rich text formatting (bold, italic, underline)
- Headings (H1, H2, H3)
- Lists (ordered, unordered)
- Links
- Code blocks and inline code
- Text alignment
- Blockquotes
- Horizontal rules
- Customizable toolbar

## Usage
\`\`\`tsx
import { RichTextHTML } from '@microbuild/ui-interfaces';

<RichTextHTML
  label="Content"
  value={htmlContent}
  onChange={(html) => setHtmlContent(html)}
  placeholder="Start writing..."
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value of the editor (HTML string)',
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
      description: 'Whether the editor is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    toolbar: {
      control: 'object',
      description: 'Toolbar configuration',
    },
    softLength: {
      control: 'number',
      description: 'Soft character length limit',
    },
    minimal: {
      control: 'boolean',
      description: 'Whether to use minimal toolbar',
    },
    editorFont: {
      control: 'select',
      options: ['sans-serif', 'serif', 'monospace'],
      description: 'Editor font family',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Content',
    placeholder: 'Start typing...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Article Content',
    value: '<h1>Welcome</h1><p>This is a <strong>rich text</strong> editor with <em>formatting</em> support.</p><ul><li>Feature one</li><li>Feature two</li></ul>',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Blog Post',
    placeholder: 'Write your blog post...',
    value: '',
  },
};

export const FormattedContent: Story = {
  args: {
    label: 'Formatted Article',
    value: `<h1>Main Title</h1>
<p>This is an introductory paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
<h2>Section Heading</h2>
<p>Here's a paragraph with a <a href="https://example.com">link</a> and some <code>inline code</code>.</p>
<blockquote>This is a blockquote that can be used for testimonials or callouts.</blockquote>
<h3>Subsection</h3>
<ul>
<li>First item in an unordered list</li>
<li>Second item with more details</li>
<li>Third item to complete the list</li>
</ul>
<p>And here's an ordered list:</p>
<ol>
<li>Step one</li>
<li>Step two</li>
<li>Step three</li>
</ol>`,
  },
};

export const MinimalToolbar: Story = {
  args: {
    label: 'Simple Editor',
    minimal: true,
    placeholder: 'Basic formatting only...',
  },
};

export const CustomToolbar: Story = {
  args: {
    label: 'Custom Toolbar',
    toolbar: ['bold', 'italic', 'h1', 'h2', 'bullist', 'numlist'],
    placeholder: 'Limited formatting options...',
  },
};

export const SerifFont: Story = {
  args: {
    label: 'Literary Content',
    editorFont: 'serif',
    placeholder: 'Write with a classic feel...',
    value: '<p>The quick brown fox jumps over the lazy dog.</p>',
  },
};

export const MonospaceFont: Story = {
  args: {
    label: 'Technical Documentation',
    editorFont: 'monospace',
    placeholder: 'Code-like appearance...',
    value: '<p>function example() { return true; }</p>',
  },
};

export const WithSoftLength: Story = {
  args: {
    label: 'Summary',
    softLength: 500,
    placeholder: 'Write a summary (max 500 characters)',
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
    error: 'Content is required',
    value: '',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Editor',
    disabled: true,
    value: '<p>This content cannot be edited.</p>',
  },
};

export const BlogEditor: Story = {
  args: {
    label: 'Blog Post Content',
    placeholder: 'Start writing your blog post...',
    editorFont: 'serif',
  },
  parameters: {
    docs: {
      description: {
        story: 'Common configuration for blog post editing.',
      },
    },
  },
};

export const EmailTemplate: Story = {
  args: {
    label: 'Email Body',
    placeholder: 'Compose your email...',
    toolbar: ['bold', 'italic', 'customLink', 'bullist', 'numlist'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Simplified toolbar for email composition.',
      },
    },
  },
};

export const ProductDescription: Story = {
  args: {
    label: 'Product Description',
    placeholder: 'Describe your product...',
    softLength: 1000,
    value: `<h2>Product Features</h2>
<ul>
<li><strong>Feature 1:</strong> Description of feature one</li>
<li><strong>Feature 2:</strong> Description of feature two</li>
<li><strong>Feature 3:</strong> Description of feature three</li>
</ul>
<p>Additional details about the product...</p>`,
  },
  parameters: {
    docs: {
      description: {
        story: 'E-commerce product description editor.',
      },
    },
  },
};
