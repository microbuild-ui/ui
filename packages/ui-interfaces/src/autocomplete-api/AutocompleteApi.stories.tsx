import type { Meta, StoryObj } from '@storybook/react';
import { AutocompleteAPI } from './AutocompleteApi';

const meta: Meta<typeof AutocompleteAPI> = {
  title: 'Interfaces/AutocompleteAPI',
  component: AutocompleteAPI,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `An autocomplete input that fetches suggestions from an external API.

## Features
- API URL with template placeholder for search term
- Configurable result, text, and value paths
- Debounce/throttle trigger options
- Rate limiting
- Loading state indicator
- Clearable selection

## Usage
\`\`\`tsx
import { AutocompleteAPI } from '@microbuild/ui-interfaces';

<AutocompleteAPI
  label="Search Users"
  url="https://api.example.com/users?q={{value}}"
  resultsPath="data"
  textPath="name"
  valuePath="id"
  onChange={(value) => console.log(value)}
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value',
    },
    url: {
      control: 'text',
      description: 'API URL with {{value}} template placeholder',
    },
    resultsPath: {
      control: 'text',
      description: 'Path to results array in API response (e.g., "data.items")',
    },
    textPath: {
      control: 'text',
      description: 'Path to display text in each result item',
    },
    valuePath: {
      control: 'text',
      description: 'Path to value in each result item',
    },
    trigger: {
      control: 'select',
      options: ['debounce', 'throttle'],
      description: 'Trigger type for API calls',
    },
    rate: {
      control: 'number',
      description: 'Rate limit in milliseconds',
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
      description: 'Whether input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether field is required',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    description: {
      control: 'text',
      description: 'Description/helper text',
    },
    readOnly: {
      control: 'boolean',
      description: 'Read-only state',
    },
    limit: {
      control: 'number',
      description: 'Maximum number of results to show',
    },
    clearable: {
      control: 'boolean',
      description: 'Whether to show clear button',
    },
    font: {
      control: 'select',
      options: ['sans-serif', 'serif', 'monospace'],
      description: 'Font family',
    },
    direction: {
      control: 'select',
      options: ['ltr', 'rtl'],
      description: 'Text direction',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default GitHub API configuration used across stories
const githubDefaults = {
  url: 'https://api.github.com/search/repositories?q={{value}}',
  resultsPath: 'items',
  textPath: 'full_name',
  valuePath: 'id',
};

export const Default: Story = {
  args: {
    label: 'Search GitHub Repos',
    placeholder: 'Type to search repositories...',
    ...githubDefaults,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'GitHub Repository',
    description: 'Search for public repositories by name',
    placeholder: 'e.g., react, vue, next.js...',
    ...githubDefaults,
  },
};

export const WithDebounce: Story = {
  args: {
    label: 'Search Repos',
    placeholder: 'Type to search...',
    ...githubDefaults,
    trigger: 'debounce',
    rate: 300,
    description: 'Waits 300ms after typing stops before searching',
  },
};

export const WithThrottle: Story = {
  args: {
    label: 'Search Repos',
    placeholder: 'Type to search...',
    ...githubDefaults,
    trigger: 'throttle',
    rate: 500,
    description: 'Searches at most every 500ms',
  },
};

export const LimitedResults: Story = {
  args: {
    label: 'Search Repos',
    placeholder: 'Type to search...',
    ...githubDefaults,
    limit: 5,
    description: 'Shows max 5 results',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Repository',
    required: true,
    placeholder: 'Select a repository...',
    ...githubDefaults,
  },
};

export const WithError: Story = {
  args: {
    label: 'Search Repos',
    error: 'Please select a valid repository',
    ...githubDefaults,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'facebook/react',
    ...githubDefaults,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    readOnly: true,
    value: 'vercel/next.js',
    ...githubDefaults,
    description: 'This field cannot be edited',
  },
};

export const Clearable: Story = {
  args: {
    label: 'Clearable Search',
    clearable: true,
    value: 'vuejs/vue',
    ...githubDefaults,
    description: 'Click the X to clear',
  },
};

export const MonospaceFont: Story = {
  args: {
    label: 'Code Repository',
    font: 'monospace',
    placeholder: 'Search repositories...',
    ...githubDefaults,
  },
};

export const RTLDirection: Story = {
  args: {
    label: 'بحث',
    direction: 'rtl',
    placeholder: 'ابحث عن مستودع...',
    ...githubDefaults,
  },
};

export const GitHubUserSearch: Story = {
  args: {
    label: 'Search GitHub Users',
    placeholder: 'Search users...',
    url: 'https://api.github.com/search/users?q={{value}}',
    resultsPath: 'items',
    textPath: 'login',
    valuePath: 'id',
    description: 'Search GitHub users by username',
    limit: 10,
  },
};
