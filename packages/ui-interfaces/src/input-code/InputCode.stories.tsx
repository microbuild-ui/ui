import type { Meta, StoryObj } from '@storybook/react';
import { InputCode } from './InputCode';

const meta: Meta<typeof InputCode> = {
  title: 'Interfaces/InputCode',
  component: InputCode,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A code input interface that provides a monospace textarea with optional line numbers and template support.

## Features
- Monospace font for code editing
- Optional line numbers
- Line wrapping toggle
- Template fill functionality
- Language indicator
- JSON and plaintext support

## Usage
\`\`\`tsx
import { InputCode } from '@microbuild/ui-interfaces';

<InputCode
  label="Configuration"
  value={jsonString}
  onChange={(value) => console.log(value)}
  language="json"
  lineNumber
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value of the code input',
    },
    label: {
      control: 'text',
      description: 'Field label',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    language: {
      control: 'text',
      description: 'Programming language for syntax highlighting',
    },
    lineNumber: {
      control: 'boolean',
      description: 'Whether to show line numbers',
    },
    lineWrapping: {
      control: 'boolean',
      description: 'Whether to wrap long lines',
    },
    template: {
      control: 'text',
      description: 'Template content to fill',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Code',
    placeholder: 'Enter code...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'JavaScript',
    language: 'javascript',
    value: `function greet(name) {
  console.log('Hello, ' + name + '!');
}

greet('World');`,
  },
};

export const JSONEditor: Story = {
  args: {
    label: 'Configuration',
    language: 'json',
    value: `{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "mantine": "^7.0.0"
  }
}`,
    description: 'Edit JSON configuration',
  },
};

export const WithLineNumbers: Story = {
  args: {
    label: 'Python Script',
    language: 'python',
    lineNumber: true,
    value: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))`,
  },
};

export const NoLineNumbers: Story = {
  args: {
    label: 'Simple Code',
    lineNumber: false,
    value: 'const x = 42;\nconsole.log(x);',
  },
};

export const WithLineWrapping: Story = {
  args: {
    label: 'Long Lines',
    lineWrapping: true,
    value: 'This is a very long line of code that should wrap to the next line when the content exceeds the width of the container. Line wrapping makes it easier to read long lines without horizontal scrolling.',
  },
};

export const NoLineWrapping: Story = {
  args: {
    label: 'No Wrapping',
    lineWrapping: false,
    value: 'This is a very long line of code that will not wrap and will require horizontal scrolling to see the full content of this line.',
    description: 'Scroll horizontally to see full content',
  },
};

export const WithTemplate: Story = {
  args: {
    label: 'Config Template',
    language: 'json',
    template: `{
  "apiUrl": "https://api.example.com",
  "timeout": 5000,
  "retries": 3
}`,
    placeholder: 'Click "Fill Template" to start',
    description: 'Use the template button to fill default content',
  },
};

export const HTMLCode: Story = {
  args: {
    label: 'HTML Snippet',
    language: 'html',
    lineNumber: true,
    value: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Welcome to my page.</p>
</body>
</html>`,
  },
};

export const CSSCode: Story = {
  args: {
    label: 'CSS Styles',
    language: 'css',
    lineNumber: true,
    value: `.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

.button {
  background-color: #6644FF;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
}`,
  },
};

export const SQLQuery: Story = {
  args: {
    label: 'SQL Query',
    language: 'sql',
    lineNumber: true,
    value: `SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email
ORDER BY order_count DESC
LIMIT 10;`,
  },
};

export const Required: Story = {
  args: {
    label: 'Required Code',
    required: true,
    placeholder: 'This field is required',
  },
};

export const WithError: Story = {
  args: {
    label: 'Invalid JSON',
    language: 'json',
    value: '{ invalid json }',
    error: 'Invalid JSON syntax',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'const disabled = true;',
  },
};

export const PlainText: Story = {
  args: {
    label: 'Plain Text',
    language: 'plaintext',
    lineNumber: true,
    value: `This is plain text content.
No syntax highlighting is applied.
Just simple monospace text.`,
  },
};

export const TypeScriptCode: Story = {
  args: {
    label: 'TypeScript',
    language: 'typescript',
    lineNumber: true,
    value: `interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

async function getUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`,
  },
};
