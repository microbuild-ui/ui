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
- Font family support (sans-serif, serif, monospace)
- RTL direction support
- Left/right icon support
- Read-only and disabled states

## Usage
\`\`\`tsx
import { AutocompleteAPI } from '@buildpad/ui-interfaces';

<AutocompleteAPI
  label="Search Users"
  url="https://api.example.com/users?q={{value}}"
  resultsPath="data"
  textPath="name"
  valuePath="id"
  onChange={(value) => console.log(value)}
/>
\`\`\`

## DaaS Field Options
| Option | Type | Description |
|--------|------|-------------|
| url | string | API URL with \`{{value}}\` placeholder |
| resultsPath | string | Dot-notation path to results array |
| textPath | string | Path to display text in each result |
| valuePath | string | Path to value in each result |
| trigger | 'debounce' \\| 'throttle' | API call trigger strategy |
| rate | number | Rate limit in ms |
| font | string | Font family (sans-serif, serif, monospace) |
| iconLeft | string | Left icon name |
| iconRight | string | Right icon name |
`,
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
    iconLeft: {
      control: 'text',
      description: 'Left icon name',
    },
    iconRight: {
      control: 'text',
      description: 'Right icon name',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default GitHub API configuration used across stories
const githubRepoDefaults = {
  url: 'https://api.github.com/search/repositories?q={{value}}',
  resultsPath: 'items',
  textPath: 'full_name',
  valuePath: 'id',
};

const githubUserDefaults = {
  url: 'https://api.github.com/search/users?q={{value}}',
  resultsPath: 'items',
  textPath: 'login',
  valuePath: 'id',
};

// ─── Basic Stories ───────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Search GitHub Repos',
    placeholder: 'Type to search repositories...',
    ...githubRepoDefaults,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'GitHub Repository',
    description: 'Search for public repositories by name',
    placeholder: 'e.g., react, vue, next.js...',
    ...githubRepoDefaults,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Selected Repository',
    value: 'facebook/react',
    ...githubRepoDefaults,
    description: 'Pre-populated with a value',
  },
};

// ─── Trigger & Rate Stories ──────────────────────────────────────

export const WithDebounce: Story = {
  args: {
    label: 'Debounced Search',
    placeholder: 'Type to search...',
    ...githubRepoDefaults,
    trigger: 'debounce',
    rate: 300,
    description: 'Waits 300ms after typing stops before searching',
  },
};

export const WithThrottle: Story = {
  args: {
    label: 'Throttled Search',
    placeholder: 'Type to search...',
    ...githubRepoDefaults,
    trigger: 'throttle',
    rate: 500,
    description: 'Searches at most every 500ms while typing',
  },
};

export const FastDebounce: Story = {
  args: {
    label: 'Fast Debounce (100ms)',
    placeholder: 'Type to search...',
    ...githubRepoDefaults,
    trigger: 'debounce',
    rate: 100,
    description: 'Very responsive - 100ms debounce',
  },
};

export const SlowThrottle: Story = {
  args: {
    label: 'Slow Throttle (2000ms)',
    placeholder: 'Type to search...',
    ...githubRepoDefaults,
    trigger: 'throttle',
    rate: 2000,
    description: 'Rate limited to once every 2 seconds',
  },
};

// ─── Results Configuration Stories ───────────────────────────────

export const LimitedResults: Story = {
  args: {
    label: 'Top 3 Results',
    placeholder: 'Type to search...',
    ...githubRepoDefaults,
    limit: 3,
    description: 'Shows max 3 results',
  },
};

export const ManyResults: Story = {
  args: {
    label: 'Extended Results (20)',
    placeholder: 'Type to search...',
    ...githubRepoDefaults,
    limit: 20,
    maxDropdownHeight: 400,
    description: 'Shows up to 20 results with taller dropdown',
  },
};

// ─── State Stories ───────────────────────────────────────────────

export const Required: Story = {
  args: {
    label: 'Required Repository',
    required: true,
    placeholder: 'Select a repository...',
    ...githubRepoDefaults,
  },
};

export const WithError: Story = {
  args: {
    label: 'Search Repos',
    error: 'Please select a valid repository',
    value: 'invalid-repo-name',
    ...githubRepoDefaults,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'facebook/react',
    ...githubRepoDefaults,
    description: 'This field is disabled and cannot be interacted with',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    readOnly: true,
    value: 'vercel/next.js',
    ...githubRepoDefaults,
    description: 'This field cannot be edited but is not visually disabled',
  },
};

export const Clearable: Story = {
  args: {
    label: 'Clearable Search',
    clearable: true,
    value: 'vuejs/vue',
    ...githubRepoDefaults,
    description: 'Click the X to clear the value',
  },
};

// ─── Font & Styling Stories ──────────────────────────────────────

export const MonospaceFont: Story = {
  args: {
    label: 'Code Repository',
    font: 'monospace',
    placeholder: 'Search repositories...',
    ...githubRepoDefaults,
    description: 'Monospace font for code-like display',
  },
};

export const SerifFont: Story = {
  args: {
    label: 'Article Search',
    font: 'serif',
    placeholder: 'Search articles...',
    ...githubRepoDefaults,
    description: 'Serif font for editorial content',
  },
};

export const RTLDirection: Story = {
  args: {
    label: 'بحث',
    direction: 'rtl',
    placeholder: 'ابحث عن مستودع...',
    ...githubRepoDefaults,
    description: 'Right-to-left text direction',
  },
};

// ─── Icon Stories ────────────────────────────────────────────────

export const WithLeftIcon: Story = {
  args: {
    label: 'Search with Icon',
    iconLeft: 'search',
    placeholder: 'Search repositories...',
    ...githubRepoDefaults,
    description: 'Shows a search icon on the left (replaced by loader when fetching)',
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Search with Right Icon',
    iconRight: 'search',
    placeholder: 'Search repositories...',
    ...githubRepoDefaults,
    description: 'Shows an icon on the right side',
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Dual Icon Search',
    iconLeft: 'search',
    iconRight: 'chevron-down',
    placeholder: 'Search...',
    ...githubRepoDefaults,
    description: 'Left icon shows loader when fetching, right icon stays',
  },
};

// ─── API Configuration Stories ───────────────────────────────────

export const GitHubUserSearch: Story = {
  args: {
    label: 'Search GitHub Users',
    placeholder: 'Search users by username...',
    ...githubUserDefaults,
    description: 'Uses different API endpoint and result paths',
    limit: 10,
  },
};

export const MissingURL: Story = {
  args: {
    label: 'No URL Configured',
    placeholder: 'This should show a warning',
    description: 'Shows warning when URL is not configured',
  },
};

// ─── Combined Options Stories ────────────────────────────────────

export const FullFeatured: Story = {
  args: {
    label: 'Full Featured Search',
    ...githubRepoDefaults,
    trigger: 'debounce',
    rate: 300,
    limit: 8,
    clearable: true,
    required: true,
    font: 'monospace',
    iconLeft: 'search',
    placeholder: 'Search repositories...',
    description: 'Debounce 300ms, limit 8, clearable, required, monospace, with icon',
  },
};

export const MinimalConfig: Story = {
  args: {
    label: 'Minimal',
    url: 'https://api.github.com/search/repositories?q={{value}}',
    resultsPath: 'items',
    textPath: 'full_name',
    valuePath: 'id',
  },
};
