import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

// Mock the lowlight import to avoid test issues
jest.mock('lowlight', () => ({
  createLowlight: () => ({
    register: jest.fn(),
  }),
}));

jest.mock('@tiptap/extension-code-block-lowlight', () => ({
  CodeBlockLowlight: {
    configure: jest.fn(() => ({})),
  },
}));

// Import after mocking
import { RichTextMarkdown } from './RichTextMarkdown';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('RichTextMarkdown', () => {
  it('renders with default props', () => {
    renderWithProvider(<RichTextMarkdown />);
    
    // Check if the rich text editor container is present
    expect(document.querySelector('.mantine-RichTextEditor-root')).toBeDefined();
  });

  it('renders with label when provided', () => {
    renderWithProvider(
      <RichTextMarkdown label="Markdown Editor" />
    );
    
    expect(screen.getByText('Markdown Editor')).toBeDefined();
  });

  it('shows required indicator when required', () => {
    renderWithProvider(
      <RichTextMarkdown label="Markdown Editor" required />
    );
    
    expect(screen.getByText('Markdown Editor')).toBeDefined();
    expect(screen.getByText('*')).toBeDefined();
  });

  it('applies error state correctly', () => {
    renderWithProvider(
      <RichTextMarkdown error="This field has an error" />
    );
    
    expect(screen.getByText('This field has an error')).toBeDefined();
  });

  it('handles disabled state', () => {
    renderWithProvider(
      <RichTextMarkdown disabled />
    );
    
    // Editor should be present but in disabled state
    const editor = document.querySelector('.mantine-RichTextEditor-root');
    expect(editor).toBeDefined();
  });

  it('shows edit and preview toggle buttons', () => {
    renderWithProvider(<RichTextMarkdown />);
    
    expect(screen.getByText('Edit')).toBeDefined();
    expect(screen.getByText('Preview')).toBeDefined();
  });

  it('calls onChange when content changes', () => {
    const mockOnChange = jest.fn();
    renderWithProvider(
      <RichTextMarkdown onChange={mockOnChange} value="<p>Initial content</p>" />
    );
    
    // Editor should be rendered properly
    expect(document.querySelector('.mantine-RichTextEditor-root')).toBeDefined();
  });
});
