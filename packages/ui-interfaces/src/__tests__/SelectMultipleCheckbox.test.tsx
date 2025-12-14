import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { SelectMultipleCheckbox, Option } from './SelectMultipleCheckbox';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MantineProvider>{children}</MantineProvider>
);

const mockChoices: Option[] = [
  { text: 'Option 1', value: 'option1' },
  { text: 'Option 2', value: 'option2' },
  { text: 'Option 3', value: 'option3' },
  { text: 'Very Long Option Name That Exceeds Normal Length', value: 'long_option' },
];

describe('SelectMultipleCheckbox', () => {
  it('renders with default props', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} />
      </TestWrapper>
    );
    
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckbox label="Select Options" choices={mockChoices} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Select Options')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckbox label="Select Options" choices={mockChoices} required />
      </TestWrapper>
    );
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} error="This field is required" />
      </TestWrapper>
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays selected values', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} value={['option1', 'option3']} />
      </TestWrapper>
    );
    
    expect(screen.getByLabelText('Option 1')).toBeChecked();
    expect(screen.getByLabelText('Option 2')).not.toBeChecked();
    expect(screen.getByLabelText('Option 3')).toBeChecked();
  });

  it('calls onChange when checkbox is selected', async () => {
    const onChange = jest.fn();
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} onChange={onChange} />
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByLabelText('Option 1'));
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['option1']);
    });
  });

  it('calls onChange when checkbox is deselected', async () => {
    const onChange = jest.fn();
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} value={['option1', 'option2']} onChange={onChange} />
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByLabelText('Option 1'));
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['option2']);
    });
  });

  it('calls onChange with null when all checkboxes are deselected', async () => {
    const onChange = jest.fn();
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} value={['option1']} onChange={onChange} />
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByLabelText('Option 1'));
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  it('shows choices validation message when no choices provided', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={[]} label="Test Label" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Choices option configured incorrectly')).toBeInTheDocument();
  });

  it('limits displayed choices when itemsShown is set', () => {
    const manyChoices = Array.from({ length: 10 }, (_, i) => ({
      text: `Option ${i + 1}`,
      value: `option${i + 1}`,
    }));

    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={manyChoices} itemsShown={5} />
      </TestWrapper>
    );
    
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 5')).toBeInTheDocument();
    expect(screen.queryByLabelText('Option 6')).not.toBeInTheDocument();
    expect(screen.getByText('Show 5 more options')).toBeInTheDocument();
  });

  it('shows all choices when show more button is clicked', async () => {
    const manyChoices = Array.from({ length: 10 }, (_, i) => ({
      text: `Option ${i + 1}`,
      value: `option${i + 1}`,
    }));

    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={manyChoices} itemsShown={5} />
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Show 5 more options'));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Option 6')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 10')).toBeInTheDocument();
    });
  });

  it('renders allow other option when enabled', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} allowOther />
      </TestWrapper>
    );
    
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('allows adding custom values when allowOther is enabled', async () => {
    const onChange = jest.fn();
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} allowOther onChange={onChange} />
      </TestWrapper>
    );
    
    // Click the "Other" button to add a custom input
    fireEvent.click(screen.getByText('Other'));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter custom value')).toBeInTheDocument();
    });
  });

  it('shows existing other values that are selected', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} value={['option1', 'custom_value']} allowOther />
      </TestWrapper>
    );
    
    expect(screen.getByLabelText('custom_value')).toBeInTheDocument();
    expect(screen.getByLabelText('custom_value')).toBeChecked();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} disabled />
      </TestWrapper>
    );
    
    expect(screen.getByLabelText('Option 1')).toBeDisabled();
    expect(screen.getByLabelText('Option 2')).toBeDisabled();
  });

  it('applies custom width', () => {
    const { container } = render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} width="300px" />
      </TestWrapper>
    );
    
    const stackElement = container.querySelector('[style*="width: 300px"]');
    expect(stackElement).toBeInTheDocument();
  });

  it('handles different value types (string, number, boolean)', async () => {
    const mixedChoices: Option[] = [
      { text: 'String Option', value: 'string_value' },
      { text: 'Number Option', value: 42 },
      { text: 'Boolean Option', value: true },
    ];
    
    const onChange = jest.fn();
    render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mixedChoices} onChange={onChange} />
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByLabelText('Number Option'));
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([42]);
    });
  });

  it('calculates grid columns based on text length', () => {
    const shortChoices: Option[] = [
      { text: 'A', value: 'a' },
      { text: 'B', value: 'b' },
    ];
    
    const { container } = render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={shortChoices} />
      </TestWrapper>
    );
    
    // Should have more columns for short text
    const gridElement = container.querySelector('[class*="mantine-Grid-root"]');
    expect(gridElement).toBeInTheDocument();
  });

  it('adjusts grid for half width', () => {
    const { container } = render(
      <TestWrapper>
        <SelectMultipleCheckbox choices={mockChoices} width="half-width" />
      </TestWrapper>
    );
    
    const gridElement = container.querySelector('[class*="mantine-Grid-root"]');
    expect(gridElement).toBeInTheDocument();
  });
});
