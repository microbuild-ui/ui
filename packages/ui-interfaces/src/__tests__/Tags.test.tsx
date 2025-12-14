import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import '@testing-library/jest-dom';
import { Tags } from './Tags';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('Tags', () => {
  it('renders with default props', () => {
    renderWithProvider(<Tags />);
    
    // Check if input is present when allowCustom is true (default)
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    renderWithProvider(
      <Tags label="Tags Field" />
    );
    
    expect(screen.getByText('Tags Field')).toBeInTheDocument();
  });

  it('shows preset tags as chips', () => {
    renderWithProvider(
      <Tags presets={['React', 'Vue', 'Angular']} />
    );
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
    expect(screen.getByText('Angular')).toBeInTheDocument();
  });

  it('handles preset tag selection', () => {
    const mockOnChange = jest.fn();
    renderWithProvider(
      <Tags 
        presets={['React', 'Vue', 'Angular']} 
        onChange={mockOnChange}
      />
    );
    
    const reactChip = screen.getByText('React');
    fireEvent.click(reactChip);
    
    expect(mockOnChange).toHaveBeenCalledWith(['React']);
  });

  it('handles custom tag input with Enter key', () => {
    const mockOnChange = jest.fn();
    renderWithProvider(
      <Tags onChange={mockOnChange} allowCustom />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Custom Tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnChange).toHaveBeenCalledWith(['Custom Tag']);
  });

  it('handles custom tag input with comma separator', () => {
    const mockOnChange = jest.fn();
    renderWithProvider(
      <Tags 
        onChange={mockOnChange} 
        allowCustom
        presets={['preset1', 'preset2']} // Force it to use TextInput path
      />
    );
    
    const input = screen.getByRole('textbox');
    
    // Type text and comma
    fireEvent.change(input, { target: { value: 'Custom Tag' } });
    fireEvent.keyDown(input, { key: ',' });
    
    // Should process the tag and call onChange
    expect(mockOnChange).toHaveBeenCalledWith(['Custom Tag']);
  });

  it('handles tag input with TagsInput component (no presets)', () => {
    const mockOnChange = jest.fn();
    renderWithProvider(
      <Tags onChange={mockOnChange} allowCustom />
    );
    
    const input = screen.getByRole('textbox');
    
    // Direct value change should work with Mantine TagsInput
    fireEvent.change(input, { target: { value: 'Test Tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnChange).toHaveBeenCalledWith(['Test Tag']);
  });

  it('shows required indicator when required', () => {
    renderWithProvider(
      <Tags label="Tags Field" required />
    );
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    renderWithProvider(
      <Tags error="This field is required" />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('processes tags with uppercase capitalization', () => {
    const mockOnChange = jest.fn();
    renderWithProvider(
      <Tags 
        onChange={mockOnChange} 
        capitalization="uppercase"
        allowCustom 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'lowercase tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnChange).toHaveBeenCalledWith(['LOWERCASE TAG']);
  });

  it('processes tags with lowercase capitalization', () => {
    const mockOnChange = jest.fn();
    renderWithProvider(
      <Tags 
        onChange={mockOnChange} 
        capitalization="lowercase"
        allowCustom 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'UPPERCASE TAG' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnChange).toHaveBeenCalledWith(['uppercase tag']);
  });

  it('handles whitespace replacement', () => {
    const mockOnChange = jest.fn();
    renderWithProvider(
      <Tags 
        onChange={mockOnChange} 
        whitespace="-"
        allowCustom 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'tag with spaces' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnChange).toHaveBeenCalledWith(['tag-with-spaces']);
  });

  it('handles disabled state', () => {
    renderWithProvider(
      <Tags disabled />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('handles array value prop', () => {
    renderWithProvider(
      <Tags value={['Tag1', 'Tag2']} presets={['Tag1', 'Tag2', 'Tag3']} />
    );
    
    // Preset chips should show as selected
    const tag1Chip = screen.getByText('Tag1');
    const tag2Chip = screen.getByText('Tag2');
    
    expect(tag1Chip).toBeInTheDocument();
    expect(tag2Chip).toBeInTheDocument();
  });

  it('filters out custom tags when allowCustom is false', () => {
    const mockOnChange = jest.fn();
    renderWithProvider(
      <Tags 
        onChange={mockOnChange}
        presets={['React', 'Vue']}
        allowCustom={false}
        value={['React', 'CustomTag']} // CustomTag should be filtered out
      />
    );
    
    // Should not show input when allowCustom is false
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    
    // Should only show preset tags
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
    expect(screen.queryByText('CustomTag')).not.toBeInTheDocument();
  });
});
