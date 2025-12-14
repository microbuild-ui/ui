import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { InputCode } from '../InputCode';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('InputCode', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders textarea element', () => {
    render(
      <TestWrapper>
        <InputCode onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('renders with label', () => {
    render(
      <TestWrapper>
        <InputCode label="Test Label" onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Label')).toBeDefined();
  });

  it('displays string values correctly', () => {
    render(
      <TestWrapper>
        <InputCode value="test string" onChange={mockOnChange} />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('test string');
  });

  it('calls onChange when textarea value changes', () => {
    render(
      <TestWrapper>
        <InputCode onChange={mockOnChange} />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test content' } });

    expect(mockOnChange).toHaveBeenCalledWith('test content');
  });

  it('shows line numbers by default', () => {
    render(
      <TestWrapper>
        <InputCode value="line 1" onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(screen.getByText('1')).toBeDefined();
  });

  it('renders template fill button when template is provided', () => {
    render(
      <TestWrapper>
        <InputCode 
          template="Hello {{name}}" 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    // The button contains an icon, so we check for the button element
    expect(screen.getByRole('button')).toBeDefined();
  });

  it('fills template when button is clicked', () => {
    render(
      <TestWrapper>
        <InputCode 
          template="Hello {{name}}" 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    const fillButton = screen.getByRole('button');
    fireEvent.click(fillButton);

    expect(mockOnChange).toHaveBeenCalledWith('Hello {{name}}');
  });

  it('forwards ref to textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    
    render(
      <TestWrapper>
        <InputCode ref={ref} onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(ref.current).toBeDefined();
    expect(ref.current?.tagName).toBe('TEXTAREA');
  });
});
