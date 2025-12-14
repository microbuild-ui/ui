import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { SelectDropdown, SelectOption } from '../SelectDropdown';

// Helper function to render components with Mantine provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('SelectDropdown', () => {
  const mockChoices: SelectOption[] = [
    { text: 'React', value: 'react' },
    { text: 'Vue', value: 'vue' },
    { text: 'Angular', value: 'angular' },
    { text: 'Svelte (Disabled)', value: 'svelte', disabled: true },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Functionality', () => {
    it('renders with label and placeholder', () => {
      renderWithProvider(
        <SelectDropdown
          label="Framework"
          placeholder="Choose a framework"
          choices={mockChoices}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Framework')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Choose a framework')).toBeInTheDocument();
    });

    it('displays error message when no choices provided and allowOther is false', () => {
      renderWithProvider(
        <SelectDropdown
          choices={[]}
          allowOther={false}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Choices option configured incorrectly')).toBeInTheDocument();
    });

    it('renders normally when no choices provided but allowOther is true', () => {
      renderWithProvider(
        <SelectDropdown
          choices={[]}
          allowOther
          placeholder="Custom input"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByPlaceholderText('Custom input')).toBeInTheDocument();
    });
  });

  describe('Value Selection', () => {
    it('displays the current selected value', () => {
      renderWithProvider(
        <SelectDropdown
          value="react"
          choices={mockChoices}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('React')).toBeInTheDocument();
    });

    it('calls onChange when value is selected', async () => {
      renderWithProvider(
        <SelectDropdown
          choices={mockChoices}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('textbox');
      fireEvent.click(select);

      const reactOption = screen.getByText('React');
      fireEvent.click(reactOption);

      expect(mockOnChange).toHaveBeenCalledWith('react');
    });

    it('handles numeric values correctly', () => {
      const numericChoices: SelectOption[] = [
        { text: 'One', value: 1 },
        { text: 'Two', value: 2 },
        { text: 'Three', value: 3 },
      ];

      renderWithProvider(
        <SelectDropdown
          value={2}
          choices={numericChoices}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('Two')).toBeInTheDocument();
    });

    it('handles boolean values correctly', () => {
      const booleanChoices: SelectOption[] = [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ];

      renderWithProvider(
        <SelectDropdown
          value={true}
          choices={booleanChoices}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('Yes')).toBeInTheDocument();
    });
  });

  describe('Props and Configuration', () => {
    it('renders as disabled when disabled prop is true', () => {
      renderWithProvider(
        <SelectDropdown
          choices={mockChoices}
          disabled
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('textbox');
      expect(select).toBeDisabled();
    });

    it('renders as readonly when readOnly prop is true', () => {
      renderWithProvider(
        <SelectDropdown
          choices={mockChoices}
          readOnly
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('textbox');
      expect(select).toHaveAttribute('readonly');
    });

    it('shows required indicator when required prop is true', () => {
      renderWithProvider(
        <SelectDropdown
          label="Framework"
          choices={mockChoices}
          required
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays description when provided', () => {
      renderWithProvider(
        <SelectDropdown
          label="Framework"
          description="Choose your preferred framework"
          choices={mockChoices}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Choose your preferred framework')).toBeInTheDocument();
    });

    it('displays error message when error prop is provided', () => {
      renderWithProvider(
        <SelectDropdown
          label="Framework"
          choices={mockChoices}
          error="This field is required"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Clear Functionality', () => {
    it('shows clear button when allowNone is true and has value', () => {
      renderWithProvider(
        <SelectDropdown
          value="react"
          choices={mockChoices}
          allowNone
          onChange={mockOnChange}
        />
      );

      // The clear button should be visible when there's a value and allowNone is true
      const clearButton = screen.getByRole('button', { hidden: true });
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveClass('mantine-InputClearButton-root');
    });

    it('calls onChange with null when clear button is clicked', () => {
      renderWithProvider(
        <SelectDropdown
          value="react"
          choices={mockChoices}
          allowNone
          onChange={mockOnChange}
        />
      );

      const clearButton = screen.getByRole('button', { hidden: true });
      fireEvent.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Search Functionality', () => {
    it('enables search when searchable prop is true', () => {
      renderWithProvider(
        <SelectDropdown
          choices={mockChoices}
          searchable
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('textbox');
      // When searchable, the input should not be readonly
      expect(select).not.toHaveAttribute('readonly');
    });

    it('enables search when allowOther is true', () => {
      renderWithProvider(
        <SelectDropdown
          choices={mockChoices}
          allowOther
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('textbox');
      // When allowOther, the input should not be readonly (enables search/typing)
      expect(select).not.toHaveAttribute('readonly');
    });
  });

  describe('Icon Support', () => {
    it('displays icon in left section when provided', () => {
      renderWithProvider(
        <SelectDropdown
          choices={mockChoices}
          icon="arrow_drop_down_circle"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('arrow_drop_down_circle')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null value gracefully', () => {
      renderWithProvider(
        <SelectDropdown
          value={null}
          choices={mockChoices}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('textbox');
      expect(select).toHaveValue('');
    });

    it('handles undefined value gracefully', () => {
      renderWithProvider(
        <SelectDropdown
          value={undefined}
          choices={mockChoices}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('textbox');
      expect(select).toHaveValue('');
    });

    it('handles empty choices array', () => {
      renderWithProvider(
        <SelectDropdown
          choices={[]}
          allowOther
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('textbox');
      expect(select).toBeInTheDocument();
    });
  });
});
