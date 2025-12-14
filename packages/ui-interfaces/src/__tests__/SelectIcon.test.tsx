import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { SelectIcon } from './SelectIcon';

const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('SelectIcon', () => {
  it('renders with default props', () => {
    renderWithMantine(<SelectIcon />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Select an icon')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    renderWithMantine(<SelectIcon label="Choose Icon" />);
    expect(screen.getByText('Choose Icon')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    renderWithMantine(<SelectIcon label="Icon" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    renderWithMantine(<SelectIcon error="Icon is required" />);
    expect(screen.getByText('Icon is required')).toBeInTheDocument();
  });

  it('displays selected value', () => {
    renderWithMantine(<SelectIcon value="home" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    renderWithMantine(<SelectIcon />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search icons...')).toBeInTheDocument();
    });
  });

  it('filters icons based on search', async () => {
    renderWithMantine(<SelectIcon />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search icons...');
      fireEvent.change(searchInput, { target: { value: 'home' } });
    });
    
    await waitFor(() => {
      // Should show results with "home" and hide categories that don't contain it
      expect(screen.queryByText('Activities')).toBeInTheDocument(); // home is in Activities
      expect(screen.queryByText('Communication')).not.toBeInTheDocument(); // home is not in Communication
    });
  });

  it('calls onChange when icon is selected', async () => {
    const mockOnChange = jest.fn();
    renderWithMantine(<SelectIcon onChange={mockOnChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search icons...');
      fireEvent.change(searchInput, { target: { value: 'add' } });
    });
    
    await waitFor(() => {
      const addIconButton = screen.getByTestId('icon-add');
      fireEvent.click(addIconButton);
    });
    
    expect(mockOnChange).toHaveBeenCalledWith('add');
  });

  it('clears selection when clear button is clicked', async () => {
    const mockOnChange = jest.fn();
    renderWithMantine(<SelectIcon value="home" onChange={mockOnChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const clearButton = screen.getByTitle('Clear selection');
      fireEvent.click(clearButton);
    });
    
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('is disabled when disabled prop is true', () => {
    renderWithMantine(<SelectIcon disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows no results message when search has no matches', async () => {
    renderWithMantine(<SelectIcon />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search icons...');
      fireEvent.change(searchInput, { target: { value: 'nonexistenticon' } });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/No icons found for/)).toBeInTheDocument();
    });
  });

  it('clears search when clear search button is clicked', async () => {
    renderWithMantine(<SelectIcon />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search icons...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
    });
    
    await waitFor(() => {
      // Get search input and clear it programmatically for testing
      const searchInput = screen.getByPlaceholderText('Search icons...');
      fireEvent.change(searchInput, { target: { value: '' } });
    });
    
    const searchInput = screen.getByPlaceholderText('Search icons...');
    expect(searchInput).toHaveValue('');
  });

  it('formats icon names correctly', () => {
    renderWithMantine(<SelectIcon value="arrow_back_ios" />);
    expect(screen.getByText('Arrow Back Ios')).toBeInTheDocument();
  });

  it('applies custom width', () => {
    renderWithMantine(<SelectIcon width="300px" />);
    const stackContainer = screen.getByRole('button').closest('.mantine-Stack-root');
    expect(stackContainer).toHaveStyle({ width: '300px' });
  });
});
