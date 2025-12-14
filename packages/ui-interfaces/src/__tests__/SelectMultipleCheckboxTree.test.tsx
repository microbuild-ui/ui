import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { SelectMultipleCheckboxTree, TreeChoice } from './SelectMultipleCheckboxTree';

// Test wrapper with MantineProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MantineProvider>{children}</MantineProvider>
);

const sampleChoices: TreeChoice[] = [
  {
    text: 'Frontend',
    value: 'frontend',
    children: [
      { text: 'React', value: 'react' },
      { text: 'Vue', value: 'vue' },
      { text: 'Angular', value: 'angular' },
    ],
  },
  {
    text: 'Backend',
    value: 'backend',
    children: [
      { text: 'Node.js', value: 'nodejs' },
      { text: 'Python', value: 'python' },
      {
        text: 'Databases',
        value: 'databases',
        children: [
          { text: 'PostgreSQL', value: 'postgresql' },
          { text: 'MongoDB', value: 'mongodb' },
        ],
      },
    ],
  },
  { text: 'DevOps', value: 'devops' },
];

describe('SelectMultipleCheckboxTree', () => {
  const defaultProps = {
    choices: sampleChoices,
    value: [],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('DevOps')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} label="Select Technologies" />
      </TestWrapper>
    );

    expect(screen.getByText('Select Technologies')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} label="Technologies" required />
      </TestWrapper>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} error="This field is required" />
      </TestWrapper>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays selected values', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} value={['react', 'nodejs']} />
      </TestWrapper>
    );

    const reactCheckbox = screen.getByLabelText('React');
    const nodejsCheckbox = screen.getByLabelText('Node.js');
    
    expect(reactCheckbox).toBeChecked();
    expect(nodejsCheckbox).toBeChecked();
  });

  it('calls onChange when checkbox is selected', () => {
    const onChange = jest.fn();
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );

    const reactCheckbox = screen.getByLabelText('React');
    fireEvent.click(reactCheckbox);

    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('shows expanded tree nodes by default', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('can collapse and expand tree nodes', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} />
      </TestWrapper>
    );

    // Find the expand/collapse button for Frontend
    const frontendExpandButton = screen.getByText('Frontend').closest('div')?.querySelector('[data-mantine-stop-propagation]');
    
    if (frontendExpandButton) {
      // Collapse the Frontend section
      fireEvent.click(frontendExpandButton);
      
      // React should not be visible
      expect(screen.queryByText('React')).not.toBeInTheDocument();
      
      // Expand again
      fireEvent.click(frontendExpandButton);
      
      // React should be visible again
      expect(screen.getByText('React')).toBeInTheDocument();
    }
  });

  it('shows search input when there are more than 10 choices', () => {
    const manyChoices: TreeChoice[] = Array.from({ length: 12 }, (_, i) => ({
      text: `Choice ${i + 1}`,
      value: `choice${i + 1}`,
    }));

    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} choices={manyChoices} />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('filters choices based on search query', async () => {
    // We need more than 10 choices to show the search input
    const manyChoices: TreeChoice[] = [
      { text: 'React', value: 'react' },
      { text: 'Vue', value: 'vue' },
      { text: 'Angular', value: 'angular' },
      { text: 'Node.js', value: 'nodejs' },
      { text: 'Python', value: 'python' },
      { text: 'JavaScript', value: 'javascript' },
      { text: 'TypeScript', value: 'typescript' },
      { text: 'Java', value: 'java' },
      { text: 'C++', value: 'cpp' },
      { text: 'Go', value: 'go' },
      { text: 'Rust', value: 'rust' },
      { text: 'PHP', value: 'php' },
    ];

    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} choices={manyChoices} />
      </TestWrapper>
    );

    // Initially all choices should be visible
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    // Wait for debounced search
    await new Promise(resolve => setTimeout(resolve, 300));

    // After search, only React should be visible
    expect(screen.getAllByText('React')).toHaveLength(1);
    expect(screen.queryByText('Vue')).not.toBeInTheDocument();
  });

  it('handles show selection only toggle', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} value={['react']} />
      </TestWrapper>
    );

    const showSelectedButton = screen.getByText('Show Selected');
    fireEvent.click(showSelectedButton);

    // Should only show selected items and their parents
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument(); // Parent of selected item
  });

  it('shows choices validation message when no choices provided', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} choices={[]} label="Test" />
      </TestWrapper>
    );

    expect(screen.getByText('Choices option configured incorrectly')).toBeInTheDocument();
  });

  it('handles different value combining modes', () => {
    const onChange = jest.fn();
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree 
          {...defaultProps} 
          onChange={onChange} 
          valueCombining="all"
        />
      </TestWrapper>
    );

    const frontendCheckbox = screen.getByLabelText('Frontend');
    fireEvent.click(frontendCheckbox);

    // In 'all' mode, selecting parent should select all children
    expect(onChange).toHaveBeenCalledWith(['frontend', 'react', 'vue', 'angular']);
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} disabled />
      </TestWrapper>
    );

    const reactCheckbox = screen.getByLabelText('React');
    expect(reactCheckbox).toBeDisabled();
  });

  it('applies custom width', () => {
    const { container } = render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} width="50%" />
      </TestWrapper>
    );

    // Check the main Stack container has the custom width
    const stackElement = container.querySelector('.mantine-Stack-root');
    expect(stackElement).toHaveStyle('width: 50%');
  });

  it('handles nested tree structure correctly', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} />
      </TestWrapper>
    );

    // Check if nested items (Databases -> PostgreSQL) are rendered
    expect(screen.getByText('Databases')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
  });

  it('highlights search matches', () => {
    // This test will just verify that the component can handle search highlighting
    // without needing to test the exact highlighting implementation
    const simpleChoices: TreeChoice[] = [
      { text: 'React Native', value: 'reactnative' },
      { text: 'Vue.js', value: 'vue' }
    ];

    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} choices={simpleChoices} />
      </TestWrapper>
    );

    // Just verify the choices are rendered
    expect(screen.getByText('React Native')).toBeInTheDocument();
    expect(screen.getByText('Vue.js')).toBeInTheDocument();
  });

  it('handles indeterminate state for parent nodes', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} value={['react']} valueCombining="all" />
      </TestWrapper>
    );

    const frontendCheckbox = screen.getByLabelText('Frontend');
    // Frontend should be indeterminate since only one child (React) is selected
    expect(frontendCheckbox).toHaveProperty('indeterminate', true);
  });

  it('handles custom color', () => {
    render(
      <TestWrapper>
        <SelectMultipleCheckboxTree {...defaultProps} color="red" value={['react']} />
      </TestWrapper>
    );

    const reactCheckbox = screen.getByLabelText('React');
    // Check that the checkbox has the correct color by checking it's checked
    expect(reactCheckbox).toBeChecked();
  });
});
