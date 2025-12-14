import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { SelectRadio } from './SelectRadio';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const sampleChoices = [
  { text: 'React', value: 'react' },
  { text: 'Vue', value: 'vue' },
  { text: 'Angular', value: 'angular' },
];

describe('SelectRadio', () => {
  it('renders with default props', () => {
    render(
      <TestWrapper>
        <SelectRadio choices={sampleChoices} />
      </TestWrapper>
    );

    expect(screen.getByLabelText('React')).toBeInTheDocument();
    expect(screen.getByLabelText('Vue')).toBeInTheDocument();
    expect(screen.getByLabelText('Angular')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(
      <TestWrapper>
        <SelectRadio 
          label="Select Framework" 
          choices={sampleChoices} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('Select Framework')).toBeInTheDocument();
  });

  it('handles value selection', () => {
    const mockOnChange = jest.fn();
    
    render(
      <TestWrapper>
        <SelectRadio 
          choices={sampleChoices}
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    const reactRadio = screen.getByLabelText('React');
    fireEvent.click(reactRadio);

    expect(mockOnChange).toHaveBeenCalledWith('react');
  });

  it('handles other option when allowOther is true', () => {
    const mockOnChange = jest.fn();
    
    render(
      <TestWrapper>
        <SelectRadio 
          choices={sampleChoices}
          allowOther
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Other')).toBeInTheDocument();
  });

  it('handles null values gracefully', () => {
    const mockOnChange = jest.fn();
    
    render(
      <TestWrapper>
        <SelectRadio 
          choices={sampleChoices}
          value={null}
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText('React')).toBeInTheDocument();
  });

  it('shows error when no choices provided', () => {
    render(
      <TestWrapper>
        <SelectRadio choices={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('Choices option configured incorrectly')).toBeInTheDocument();
  });
});
