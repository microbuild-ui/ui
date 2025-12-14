import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { SelectMultipleDropdown } from './SelectMultipleDropdown';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const sampleChoices = [
  { text: 'React', value: 'react' },
  { text: 'Angular', value: 'angular' },
  { text: 'Vue', value: 'vue' },
  { text: 'Svelte', value: 'svelte' },
];

describe('SelectMultipleDropdown', () => {
  it('renders with default props', () => {
    render(
      <TestWrapper>
        <SelectMultipleDropdown
          value={[]}
          onChange={() => {}}
          choices={sampleChoices}
        />
      </TestWrapper>
    );
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(
      <TestWrapper>
        <SelectMultipleDropdown 
          label="Select frameworks"
          value={[]}
          onChange={() => {}}
          choices={sampleChoices}
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Select frameworks')).toBeInTheDocument();
  });

  it('handles null values gracefully', () => {
    render(
      <TestWrapper>
        <SelectMultipleDropdown 
          value={null}
          onChange={() => {}}
          choices={sampleChoices}
        />
      </TestWrapper>
    );
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
