import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { GroupAccordion } from '../group-accordion/GroupAccordion';

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

  it('starts with all sections closed by default (lazy-mount: content not in DOM)', () => {
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
    // Lazy-mount: sections that have never been opened don't render content at all
    expect(screen.queryByTestId('content-section_a')).not.toBeInTheDocument();
    expect(screen.queryByTestId('content-section_b')).not.toBeInTheDocument();
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
    // Section B: lazy-mount means not in DOM since never opened
    expect(screen.queryByTestId('content-section_b')).not.toBeInTheDocument();
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

    // Click Section B header — in accordion mode this opens B and closes A
    await act(async () => {
      fireEvent.click(screen.getByText('Section B'));
    });

    // Section B should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('content-section_b')).toBeInTheDocument();
    });
    // Section A content stays in DOM (lazy-mount keeps it) but parent has display:none
    const sectionAContent = screen.getByTestId('content-section_a');
    expect(sectionAContent).toBeInTheDocument();
    expect(sectionAContent.closest('div[style*="display: none"]')).not.toBeNull();
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
    // Lazy-mount: section was never opened, so content is not in the DOM
    expect(screen.queryByTestId('content-section_a')).not.toBeInTheDocument();
  });

  it('renders children as fallback when no section fields found', () => {
    renderWithProvider(
      <GroupAccordion>
        <div data-testid="fallback">Fallback content</div>
      </GroupAccordion>
    );
    expect(screen.getByTestId('fallback')).toBeVisible();
  });

  it('lazy-mounts content on first open and keeps it in DOM when collapsed (display:none)', async () => {
    renderWithProvider(
      <GroupAccordion
        field={mockField}
        fields={allFields}
        start="closed"
        accordionMode={false}
        renderSection={(section) => (
          <div data-testid={`content-${section.field}`}>
            Content for {section.name}
          </div>
        )}
      />
    );

    // Initially: content not in DOM (lazy-mount)
    expect(screen.queryByTestId('content-section_a')).not.toBeInTheDocument();

    // Open Section A
    await act(async () => {
      fireEvent.click(screen.getByText('Section A'));
    });

    // Content should now be in the DOM and visible
    await waitFor(() => {
      expect(screen.getByTestId('content-section_a')).toBeVisible();
    });

    // Close Section A
    await act(async () => {
      fireEvent.click(screen.getByText('Section A'));
    });

    // Content should still be in the DOM (stays mounted) but parent has display:none
    expect(screen.getByTestId('content-section_a')).toBeInTheDocument();
    expect(
      screen.getByTestId('content-section_a').closest('div[style*="display: none"]'),
    ).not.toBeNull();
  });

  // =========================================================================
  // Regular (non-group) fields as accordion sections — Directus pattern
  // =========================================================================

  describe('regular fields as sections (Directus pattern)', () => {
    const regularField = {
      name: 'Test Accordion',
      meta: { field: 'test_accordion', special: ['alias', 'group', 'no-data'] },
    };

    const regularChildFields = [
      {
        field: 'test_input',
        name: 'Test Input',
        type: 'string',
        meta: { group: 'test_accordion', field: 'test_input', interface: 'input' },
      },
      {
        field: 'test_input2',
        name: 'Test Input 2',
        type: 'string',
        meta: { group: 'test_accordion', field: 'test_input2', interface: 'input' },
      },
    ];

    const regularAllFields = [regularField as any, ...regularChildFields];

    it('renders regular (non-group) fields as section headers', () => {
      renderWithProvider(
        <GroupAccordion field={regularField} fields={regularAllFields} />
      );
      expect(screen.getByText('Test Input')).toBeInTheDocument();
      expect(screen.getByText('Test Input 2')).toBeInTheDocument();
    });

    it('renders section content for regular fields via renderSection', () => {
      renderWithProvider(
        <GroupAccordion
          field={regularField}
          fields={regularAllFields}
          start="first"
          renderSection={(section) => (
            <div data-testid={`content-${section.field}`}>
              Input for {section.name}
            </div>
          )}
        />
      );
      // First section should be open
      expect(screen.getByTestId('content-test_input')).toBeVisible();
    });

    it('mixes group and regular fields as sections', () => {
      const mixedFields = [
        regularField as any,
        {
          field: 'group_section',
          name: 'Group Section',
          meta: {
            group: 'test_accordion',
            field: 'group_section',
            special: ['alias', 'group', 'no-data'],
          },
        },
        {
          field: 'plain_field',
          name: 'Plain Field',
          type: 'string',
          meta: { group: 'test_accordion', field: 'plain_field', interface: 'input' },
        },
        { field: 'child_of_group', name: 'Child', meta: { group: 'group_section' } },
      ];

      renderWithProvider(
        <GroupAccordion field={regularField} fields={mixedFields} />
      );
      expect(screen.getByText('Group Section')).toBeInTheDocument();
      expect(screen.getByText('Plain Field')).toBeInTheDocument();
    });
  });
});
