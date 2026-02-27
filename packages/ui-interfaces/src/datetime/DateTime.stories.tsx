import type { Meta, StoryObj } from '@storybook/react';
import { DateTime } from './DateTime';

const meta: Meta<typeof DateTime> = {
  title: 'Interfaces/DateTime',
  component: DateTime,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `A datetime picker interface using Mantine's DateTimePicker component.

## Features
- Support for datetime, date, time, and timestamp types
- Configurable time format (12/24 hour)
- Optional seconds display
- Custom value formatting
- Date range constraints
- Clearable selection

## Usage
\`\`\`tsx
import { DateTime } from '@buildpad/ui-interfaces';

<DateTime
  label="Pick a date"
  value={date}
  onChange={setDate}
  type="datetime"
/>
\`\`\``,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current datetime value as ISO string',
    },
    type: {
      control: 'select',
      options: ['datetime', 'date', 'time', 'timestamp'],
      description: 'Type of datetime field',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the picker is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the picker is readonly',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    label: {
      control: 'text',
      description: 'Label displayed above the picker',
    },
    description: {
      control: 'text',
      description: 'Description text displayed below the label',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    includeSeconds: {
      control: 'boolean',
      description: 'Whether to include seconds in time display',
    },
    use24: {
      control: 'boolean',
      description: 'Whether to use 24-hour format',
    },
    clearable: {
      control: 'boolean',
      description: 'Whether to allow clearing the value',
    },
    minDate: {
      control: 'text',
      description: 'Minimum allowed date (YYYY-MM-DD)',
    },
    maxDate: {
      control: 'text',
      description: 'Maximum allowed date (YYYY-MM-DD)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Select date and time',
    placeholder: 'Pick date and time',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Selected DateTime',
    value: '2024-12-25T10:30:00',
    description: 'A datetime with a pre-selected value',
  },
};

export const DateOnly: Story = {
  args: {
    label: 'Date',
    type: 'date',
    placeholder: 'Pick a date',
    description: 'Date-only picker without time',
  },
};

export const TimeOnly: Story = {
  args: {
    label: 'Time',
    type: 'time',
    placeholder: 'Pick a time',
    description: 'Time-only picker without date',
  },
};

export const Timestamp: Story = {
  args: {
    label: 'Timestamp',
    type: 'timestamp',
    value: '2024-12-25T10:30:00.000Z',
    description: 'Timestamp format with timezone',
  },
};

export const WithSeconds: Story = {
  args: {
    label: 'DateTime with seconds',
    type: 'datetime',
    includeSeconds: true,
    value: '2024-12-25T10:30:45',
  },
};

export const TwelveHourFormat: Story = {
  args: {
    label: 'DateTime (12-hour)',
    type: 'datetime',
    use24: false,
    value: '2024-12-25T14:30:00',
    description: 'Shows time in 12-hour format with AM/PM',
  },
};

export const TwentyFourHourFormat: Story = {
  args: {
    label: 'DateTime (24-hour)',
    type: 'datetime',
    use24: true,
    value: '2024-12-25T14:30:00',
    description: 'Shows time in 24-hour format',
  },
};

export const Required: Story = {
  args: {
    label: 'Required field',
    required: true,
    placeholder: 'This field is required',
  },
};

export const WithError: Story = {
  args: {
    label: 'Event date',
    error: 'Please select a valid date',
    value: '',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    value: '2024-12-25T10:30:00',
    description: 'This picker is disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    readOnly: true,
    value: '2024-12-25T10:30:00',
    description: 'This picker is read-only',
  },
};

export const WithDateRange: Story = {
  args: {
    label: 'Booking date',
    type: 'date',
    minDate: '2024-01-01',
    maxDate: '2024-12-31',
    description: 'Select a date in 2024',
  },
};

export const NotClearable: Story = {
  args: {
    label: 'Start date',
    type: 'date',
    clearable: false,
    value: '2024-12-25',
    description: 'This picker cannot be cleared',
  },
};

export const CustomFormat: Story = {
  args: {
    label: 'Custom format',
    type: 'date',
    valueFormat: 'DD MMMM YYYY',
    value: '2024-12-25',
    description: 'Displays date as "25 December 2024"',
  },
};

export const AllOptions: Story = {
  args: {
    label: 'Full options example',
    type: 'datetime',
    description: 'Demonstrates all features together',
    value: '2024-12-25T14:30:45',
    includeSeconds: true,
    use24: true,
    clearable: true,
    required: true,
  },
};
