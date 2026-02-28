import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { GroupAccordion } from './GroupAccordion';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

// Mock fields simulating a DaaS accordion group with child sections
const mockField = {
  name: 'Test Accordion',
  meta: { field: 'test_accordion', special: ['alias', 'group', 'no-data'] },
};

const mockSectionFields = [
  {
    field: 'section_a',
    name: 'Section A',
    meta: {
      group: 'test_accordion',
      field: 'section_a',
      special: ['alias', 'group', 'no-data'],
    },
  },
  {
    field: 'section_b',
    name: 'Section B',
    meta: {
      group: 'test_accordion',
      field: 'section_b',
      special: ['alias', 'group', 'no-data'],
    },
  },
];

const allFields = [
  mockField as any,
  ...mockSectionFields,
  { field: 'child_1', name: 'Child 1', meta: { group: 'section_a' } },
  { field: 'child_2', name: 'Child 2', meta: { group: 'section_b' } },
];

describe('GroupAccordion', () => {
  it('renders with default props', () => {
    renderWithProvider(<GroupAccordion />);
    expect(document.querySelector('.group-accordion')).toBeInTheDocument();
  });

  it('renders section headers from child group fields', () => {
    renderWithProvider(
      <GroupAccordion field={mockField} fields={allFields} />
    );
    expect(screen.getByText('Section A')).toBeInTheDocument();
    expect(screen.getByText('Section B')).toBeInTheDocument();
  });

  it('starts with all sections closed by default', () => {
    renderWithProvider(
      <GroupAccordion
        field={mockField}
        fields={allFields}
        start="closed"
        renderSection={(section) => (
          <div data-testid={`content-${section.field}`}>
            Content for {section.name}
          </div>
        )}
      />
    );
    expect(screen.queryByTestId('content-section_a')).not.toBeVisible();
    expect(screen.queryByTestId('content-section_b')).not.toBeVisible();
  });

  it('opens first section when start is "first"', () => {
    renderWithProvider(
      <GroupAccordion
        field={mockField}
        fields={allFields}
        start="first"
        renderSection={(section) => (
          <div data-testid={`content-${section.field}`}>
            Content for {section.name}
          </div>
        )}
      />
    );
    expect(screen.getByTestId('content-section_a')).toBeVisible();
    expect(screen.queryByTestId('content-section_b')).not.toBeVisible();
  });

  it('opens all sections when start is "opened" and accordionMode is false', () => {
    renderWithProvider(
      <GroupAccordion
        field={mockField}
        fields={allFields}
        start="opened"
        accordionMode={false}
        renderSection={(section) => (
          <div data-testid={`content-${section.field}`}>
            Content for {section.name}
          </div>
        )}
      />
    );
    expect(screen.getByTestId('content-section_a')).toBeVisible();
    expect(screen.getByTestId('content-section_b')).toBeVisible();
  });

  it('in accordion mode, clicking one section closes the other', async () => {
    renderWithProvider(
      <GroupAccordion
        field={mockField}
        fields={allFields}
        accordionMode={true}
        start="first"
        renderSection={(section) => (
          <div data-testid={`content-${section.field}`}>
            Content for {section.name}
          </div>
        )}
      />
    );

    // Section A should be open (start="first")
    expect(screen.getByTestId('content-section_a')).toBeVisible();

    // Click Section B header
    fireEvent.click(screen.getByText('Section B'));
    await new Promise((r) => setTimeout(r, 250));

    // Section B should now be open, Section A closed
    expect(screen.getByTestId('content-section_b')).toBeVisible();
    expect(screen.queryByTestId('content-section_a')).not.toBeVisible();
  });

  it('shows badge on sections when provided', () => {
    renderWithProvider(
      <GroupAccordion
        field={mockField}
        fields={allFields}
        badge="Required"
      />
    );
    const badges = screen.getAllByText('Required');
    expect(badges.length).toBe(2); // One per section
  });

  it('does not toggle when disabled', () => {
    renderWithProvider(
      <GroupAccordion
        field={mockField}
        fields={allFields}
        disabled
        start="closed"
        renderSection={(section) => (
          <div data-testid={`content-${section.field}`}>
            Content for {section.name}
          </div>
        )}
      />
    );

    fireEvent.click(screen.getByText('Section A'));
    expect(screen.queryByTestId('content-section_a')).not.toBeVisible();
  });

  it('renders children as fallback when no section fields found', () => {
    renderWithProvider(
      <GroupAccordion>
        <div data-testid="fallback">Fallback content</div>
      </GroupAccordion>
    );
    expect(screen.getByTestId('fallback')).toBeVisible();
  });
});
