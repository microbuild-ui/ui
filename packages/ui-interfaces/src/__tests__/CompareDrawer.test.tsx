import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { CompareDrawer } from '../workflow-button';
import type { Revision, WorkflowInstance } from '../workflow-button';

// Helper function to render components with Mantine provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('CompareDrawer', () => {
  const mockOnOpenChange = jest.fn();

  const createRevision = (id: number, overrides: Partial<Revision> = {}): Revision => ({
    id,
    collection: 'articles',
    item: 'article-123',
    data: { title: 'Title', content: 'Content' },
    delta: null,
    activity: {
      action: 'update',
      ip: '127.0.0.1',
      user_agent: 'Mozilla',
      origin: 'web',
      timestamp: '2024-01-01T00:00:00Z',
      user: 'user-1',
    },
    ...overrides,
  });

  const createWorkflowInstance = (overrides: Partial<WorkflowInstance> = {}): WorkflowInstance => ({
    id: 1,
    item_id: 'article-123',
    current_state: 'Draft',
    version_key: null,
    terminated: false,
    revision_id: 100,
    workflow: {
      id: 1,
      name: 'Article Workflow',
      workflow_json: JSON.stringify({
        initial_state: 'Draft',
        compare_rollback_state: 'Published',
        states: [],
      }),
    },
    ...overrides,
  });

  beforeEach(() => {
    mockOnOpenChange.mockClear();
  });

  describe('Closed State', () => {
    it('does not render content when closed', () => {
      renderWithProvider(
        <CompareDrawer
          open={false}
          onOpenChange={mockOnOpenChange}
          currentRevision={null}
          previousRevision={null}
          workflowInstance={null}
        />
      );

      expect(screen.queryByText('Item Revision')).not.toBeInTheDocument();
    });
  });

  describe('Open State', () => {
    it('renders drawer title when open', () => {
      renderWithProvider(
        <CompareDrawer
          open={true}
          onOpenChange={mockOnOpenChange}
          currentRevision={null}
          previousRevision={null}
          workflowInstance={null}
        />
      );

      expect(screen.getByText('Item Revision')).toBeInTheDocument();
    });

    it('shows compare state name from workflow', () => {
      const workflowInstance = createWorkflowInstance();

      renderWithProvider(
        <CompareDrawer
          open={true}
          onOpenChange={mockOnOpenChange}
          currentRevision={null}
          previousRevision={null}
          workflowInstance={workflowInstance}
        />
      );

      expect(screen.getByText(/Published/)).toBeInTheDocument();
      expect(screen.getByText(/State vs Current/)).toBeInTheDocument();
    });

    it('defaults to "Published" when no compare state defined', () => {
      const workflowInstance = createWorkflowInstance({
        workflow: {
          id: 1,
          name: 'Workflow',
          workflow_json: JSON.stringify({
            initial_state: 'Draft',
            states: [],
          }),
        },
      });

      renderWithProvider(
        <CompareDrawer
          open={true}
          onOpenChange={mockOnOpenChange}
          currentRevision={null}
          previousRevision={null}
          workflowInstance={workflowInstance}
        />
      );

      expect(screen.getByText(/Published/)).toBeInTheDocument();
    });
  });

  describe('No Changes', () => {
    it('shows no changes message when revisions are null', () => {
      renderWithProvider(
        <CompareDrawer
          open={true}
          onOpenChange={mockOnOpenChange}
          currentRevision={null}
          previousRevision={null}
          workflowInstance={null}
        />
      );

      expect(
        screen.getByText(/No changes detected between published and current state/)
      ).toBeInTheDocument();
    });
  });

  describe('With Revisions', () => {
    it('displays revision updates component', () => {
      const currentRevision = createRevision(2, {
        delta: { title: 'New Title' },
      });
      const previousRevision = createRevision(1, {
        data: { title: 'Old Title' },
      });

      renderWithProvider(
        <CompareDrawer
          open={true}
          onOpenChange={mockOnOpenChange}
          currentRevision={currentRevision}
          previousRevision={previousRevision}
          workflowInstance={null}
        />
      );

      // Should show the field name
      expect(screen.getByText('title')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when provided', () => {
      renderWithProvider(
        <CompareDrawer
          open={true}
          onOpenChange={mockOnOpenChange}
          currentRevision={null}
          previousRevision={null}
          workflowInstance={null}
          errorMessage="Something went wrong"
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('prioritizes error message over no changes message', () => {
      renderWithProvider(
        <CompareDrawer
          open={true}
          onOpenChange={mockOnOpenChange}
          currentRevision={null}
          previousRevision={null}
          workflowInstance={null}
          errorMessage="Error occurred"
        />
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(
        screen.queryByText(/No changes detected/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('calls onOpenChange with false when close button is clicked', () => {
      renderWithProvider(
        <CompareDrawer
          open={true}
          onOpenChange={mockOnOpenChange}
          currentRevision={null}
          previousRevision={null}
          workflowInstance={null}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Invalid Workflow JSON', () => {
    it('defaults to "Published" when workflow JSON is invalid', () => {
      const workflowInstance = createWorkflowInstance({
        workflow: {
          id: 1,
          name: 'Workflow',
          workflow_json: 'invalid-json',
        },
      });

      renderWithProvider(
        <CompareDrawer
          open={true}
          onOpenChange={mockOnOpenChange}
          currentRevision={null}
          previousRevision={null}
          workflowInstance={workflowInstance}
        />
      );

      expect(screen.getByText(/Published/)).toBeInTheDocument();
    });
  });
});
